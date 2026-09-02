-- Correções de Row Level Security encontradas na auditoria pré-lançamento.

-- ---------------------------------------------------------------------------
-- 1. ROUBO DE COMISSÃO (crítico)
--
-- A policy de UPDATE de `credenciais_afiliado` tinha `using` mas não tinha
-- `with check`. `using` decide QUAIS LINHAS a pessoa pode alterar; `with check`
-- decide COMO a linha pode ficar DEPOIS. Sem o segundo, a afiliada podia dar
-- UPDATE na própria linha trocando `user_id` pelo de outra pessoa — jogando as
-- credenciais Shopee dela para a conta da vítima. A partir daí todo link que a
-- vítima gerasse sairia assinado com o App ID do atacante, e a comissão das
-- vendas dela iria para ele.
-- ---------------------------------------------------------------------------
drop policy if exists "usuario atualiza a propria credencial" on credenciais_afiliado;

create policy "usuario atualiza a propria credencial"
  on credenciais_afiliado for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Faltava também poder apagar a própria credencial (voltar pro link padrão).
drop policy if exists "usuario apaga a propria credencial" on credenciais_afiliado;

create policy "usuario apaga a propria credencial"
  on credenciais_afiliado for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. O App Secret cifrado não precisa sair do servidor.
--
-- RLS é por linha, não por coluna: a policy de SELECT devolvia a linha inteira,
-- incluindo `shopee_app_secret`. O texto está cifrado (AES-256-GCM, chave só do
-- servidor), então não é uma chave em claro — mas o app nunca lê essa coluna do
-- lado do cliente, e o que não precisa sair não sai.
-- ---------------------------------------------------------------------------
revoke select (shopee_app_secret) on credenciais_afiliado from authenticated;
revoke select (shopee_app_secret) on credenciais_afiliado from anon;

-- ---------------------------------------------------------------------------
-- 3. ACESSO DE GRAÇA AO PRODUTO PAGO (crítico)
--
-- Duas coisas se somavam. (a) A anon key do Supabase é pública por desenho —
-- ela está no bundle do browser — e com ela qualquer pessoa chama signUp() e
-- vira `authenticated`, a não ser que o auto-cadastro esteja desligado no
-- painel. (b) A policy da Vitrine era "to authenticated using (true)": bastava
-- estar autenticado, sem olhar se houve compra. Somando as duas, o catálogo
-- inteiro (o produto pago) ficava disponível pra quem criasse a própria conta.
--
-- O mesmo buraco cobria o reembolso: a revogação vivia só no layout de /app, e
-- quem foi reembolsada seguia com sessão válida, podendo ler tudo direto pela
-- API REST do Supabase sem passar pelo nosso Next.js.
--
-- Agora a regra mora no banco: só lê a Vitrine quem tem compra sem reembolso.
-- Conta criada sozinha, sem compra, não enxerga nada.
--
-- Pra liberar uma conta de teste sua, insira a compra à mão:
--   insert into compras (user_id, email, lifetime, cakto_order_id)
--   select id, email, true, 'manual-' || id
--   from auth.users where email = 'voce@exemplo.com';
--
-- E desligue o auto-cadastro no painel do Supabase:
--   Authentication > Sign In / Providers > Email
--   > "Allow new users to sign up" = OFF
-- ---------------------------------------------------------------------------
create or replace function tem_compra_ativa()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from compras c
    where c.user_id = auth.uid()
      and c.reembolsada_em is null
  );
$$;

grant execute on function tem_compra_ativa() to authenticated;

drop policy if exists "Vitrine visível para autenticados" on produtos;
drop policy if exists "Vitrine visível para quem tem compra ativa" on produtos;

create policy "Vitrine visível para quem tem compra ativa"
  on produtos for select
  to authenticated
  using (tem_compra_ativa());

-- ---------------------------------------------------------------------------
-- 4. Mesma trava nas divulgações e no perfil público.
-- ---------------------------------------------------------------------------
drop policy if exists "afiliada cria as próprias divulgações" on divulgacoes;
create policy "afiliada cria as próprias divulgações"
  on divulgacoes for insert to authenticated
  with check (auth.uid() = user_id and tem_compra_ativa());

drop policy if exists "afiliada edita as próprias divulgações" on divulgacoes;
create policy "afiliada edita as próprias divulgações"
  on divulgacoes for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and tem_compra_ativa());

drop policy if exists "afiliada cria o próprio perfil" on perfis;
create policy "afiliada cria o próprio perfil"
  on perfis for insert to authenticated
  with check (auth.uid() = user_id and tem_compra_ativa());

-- ---------------------------------------------------------------------------
-- 5. A vitrine pública some quando a compra é reembolsada.
--
-- `vitrine_publica` é security definer (roda com os poderes do dono da função)
-- justamente pra não precisar abrir `divulgacoes` para o público. Por isso a
-- checagem de compra ativa precisa ser feita DENTRO dela.
-- ---------------------------------------------------------------------------
create or replace function vitrine_publica(p_handle text)
returns table (
  nome_exibicao text,
  handle        text,
  divulgacao_id uuid,
  item_id       text,
  nome          text,
  preco         numeric,
  imagem_url    text,
  link_afiliado text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pr.nome_exibicao,
    pr.handle,
    d.id,
    d.item_id,
    d.nome,
    d.preco,
    d.imagem_url,
    d.link_afiliado
  from perfis pr
  join divulgacoes d
    on d.user_id = pr.user_id
   and d.na_vitrine = true
  where pr.handle = lower(p_handle)
    and exists (
      select 1 from compras c
      where c.user_id = pr.user_id
        and c.reembolsada_em is null
    )
  order by d.ordem asc, d.criado_em desc
  limit 500;
$$;

grant execute on function vitrine_publica(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. Teto de linhas por afiliada.
--
-- `divulgacoes` só cresce por ação da própria afiliada, mas nada impedia um
-- script de inserir milhões de linhas e inchar o banco (o plano do Supabase é
-- compartilhado). 2000 fica muito acima de qualquer uso real.
-- ---------------------------------------------------------------------------
create or replace function limitar_divulgacoes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from divulgacoes where user_id = new.user_id) >= 2000 then
    raise exception 'limite de divulgações atingido';
  end if;
  return new;
end;
$$;

drop trigger if exists divulgacoes_teto on divulgacoes;
create trigger divulgacoes_teto
  before insert on divulgacoes
  for each row execute function limitar_divulgacoes();
