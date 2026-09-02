# Templates de E-mail do Supabase

Estes templates customizam os e-mails de acesso (magic link) e recuperação de senha
do Escolhe Promo via Resend.

## Como usar

1. **Abra o painel do Supabase**:
   Projeto → *Authentication* → *Emails* → *Email Templates*

2. **Template "Magic Link"** (e-mail de acesso):
   - Copia todo o conteúdo de `magic-link.html`
   - Cola no painel, abas *HTML* e *Subject Line*
   - **Assunto (Subject)**: `Seu acesso ao Escolhe Promo`
   - Clica *Save*

3. **Template "Reset Password"** (recuperação de senha):
   - Copia todo o conteúdo de `reset-password.html`
   - Cola no painel
   - **Assunto (Subject)**: `Recuperar sua senha — Escolhe Promo`
   - Clica *Save*

## Variáveis

Os templates montam o link à mão com `{{ .SiteURL }}` + `{{ .TokenHash }}`, apontando
direto pra `/auth/confirm`. **Não troca por `{{ .ConfirmationURL }}`**: aquele passa pelo
`/verify` do Supabase e devolve o token no fragmento da URL, o que quebra o "abrir no
navegador" (o token seria consumido dentro do app de e-mail antes do redirect).

## Customização

Mudar marca (cores, logo, mensagem) depois:
- Edita as cores (`background: #c43a1e`), o nome "Escolhe Promo", e o link do logo aqui
- Refaz os passos acima no painel
- Commit no git

Não mexe na HTML `<!-- estrutura` — só mudanças de estilo / copy.
