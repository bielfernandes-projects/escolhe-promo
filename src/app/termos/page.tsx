import Link from "next/link";

export const metadata = { title: "Termos de Uso — Eita Promo" };

/**
 * Rascunho informado por LGPD/CDC, nao revisao juridica — vale como ponto de
 * partida, nao substitui revisao por advogado antes de escalar trafego pago.
 */
export default function TermosPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <Link href="/" className="text-sm font-semibold text-marca-600">
        ← Eita Promo
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Termos de Uso</h1>
      <p className="mt-1 text-sm text-tinta-fraca">Última atualização: 25/08/2026</p>

      <div className="prose prose-sm mt-6 max-w-none space-y-5 text-sm leading-relaxed text-tinta">
        <section>
          <h2 className="font-bold">1. Quem somos</h2>
          <p>
            O Eita Promo é um serviço operado por{" "}
            <strong>Gabriel Monteiro Fernandes, CPF 074.898.793-29, Fortaleza-CE</strong>, contato:{" "}
            <a href="mailto:contato@eitapromo.bf.dev.br" className="text-marca-600 underline">
              contato@eitapromo.bf.dev.br
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-bold">2. O que o serviço é (e o que não é)</h2>
          <p>
            O Eita Promo é uma ferramenta de apoio para afiliados da Shopee: ele
            sugere produtos, gera textos de divulgação e imagens prontas pra
            postar. Ele não garante vendas, comissão, ganho financeiro ou
            resultado de qualquer tipo — o desempenho depende inteiramente de
            como e onde você divulga.
          </p>
        </section>

        <section>
          <h2 className="font-bold">3. Acesso e pagamento</h2>
          <p>
            O acesso é vitalício, mediante pagamento único processado pela
            Cakto. Não há cobrança recorrente. O acesso é pessoal e
            intransferível, vinculado ao e-mail usado na compra.
          </p>
        </section>

        <section>
          <h2 className="font-bold">4. Direito de arrependimento</h2>
          <p>
            Por se tratar de compra online, você tem direito de solicitar o
            cancelamento e reembolso integral em até 7 dias corridos da
            compra, conforme o art. 49 do Código de Defesa do Consumidor,
            solicitando diretamente na plataforma de pagamento (Cakto) ou pelo
            contato acima.
          </p>
        </section>

        <section>
          <h2 className="font-bold">5. Uso da sua própria API da Shopee (opcional)</h2>
          <p>
            Se você optar por conectar suas próprias credenciais de afiliado
            da Shopee em Configurações, elas são usadas exclusivamente pra
            gerar seus próprios links de afiliado dentro do app, e ficam
            armazenadas de forma criptografada. Sem essa conexão, os links
            gerados usam a conta de afiliado do Eita Promo.
          </p>
        </section>

        <section>
          <h2 className="font-bold">6. Uso aceitável</h2>
          <p>
            É proibido usar o serviço pra fins ilegais, spam em massa não
            solicitado, ou pra divulgar produtos de forma enganosa. Contas
            usadas dessa forma podem ter o acesso suspenso sem reembolso.
          </p>
        </section>

        <section>
          <h2 className="font-bold">7. Propriedade intelectual</h2>
          <p>
            Os textos e imagens gerados pelo app são seus pra usar livremente
            na divulgação dos produtos. O software, marca e templates
            continuam propriedade do Eita Promo.
          </p>
        </section>

        <section>
          <h2 className="font-bold">8. Disponibilidade</h2>
          <p>
            O serviço depende de terceiros (Shopee, Supabase, Vercel) e pode
            ter instabilidades pontuais fora do nosso controle. Fazemos o
            possível pra manter tudo no ar, mas não garantimos disponibilidade
            ininterrupta.
          </p>
        </section>

        <section>
          <h2 className="font-bold">9. Alterações</h2>
          <p>
            Podemos atualizar estes termos; mudanças relevantes serão
            comunicadas por e-mail ou aviso no app.
          </p>
        </section>

        <section>
          <h2 className="font-bold">10. Foro</h2>
          <p>Fica eleito o foro da comarca de Fortaleza-CE.</p>
        </section>
      </div>
    </main>
  );
}
