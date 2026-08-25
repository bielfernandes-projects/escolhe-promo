import Link from "next/link";

export const metadata = { title: "Política de Privacidade — Eita Promo" };

export default function PrivacidadePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <Link href="/" className="text-sm font-semibold text-marca-600">
        ← Eita Promo
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Política de Privacidade
      </h1>
      <p className="mt-1 text-sm text-tinta-fraca">Última atualização: 25/08/2026</p>

      <div className="prose prose-sm mt-6 max-w-none space-y-5 text-sm leading-relaxed text-tinta">
        <section>
          <h2 className="font-bold">1. Controlador dos dados</h2>
          <p>
            <strong>Gabriel Monteiro Fernandes, CPF 074.898.793-29, Fortaleza-CE</strong> é quem decide
            como seus dados são usados no Eita Promo. Contato do encarregado
            (DPO):{" "}
            <a href="mailto:contato@eitapromo.bf.dev.br" className="text-marca-600 underline">
              contato@eitapromo.bf.dev.br
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-bold">2. Dados que coletamos</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>E-mail e nome, recebidos da Cakto na confirmação da compra.</li>
            <li>
              App ID e App Secret da Shopee, apenas se você optar por conectar
              sua própria conta de afiliado em Configurações (armazenados
              criptografados).
            </li>
            <li>
              Dados de navegação e uso do app (páginas vistas, cliques),
              coletados de forma agregada pelo Vercel Analytics.
            </li>
            <li>
              Se você chegou por um anúncio, também podemos registrar um
              evento de compra vinculado ao seu e-mail no Meta (Facebook/
              Instagram) Ads, pra medir o resultado da campanha.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold">3. Pra que usamos</h2>
          <p>
            Liberar seu acesso após a compra, enviar o link de entrada por
            e-mail, gerar seus links de afiliado pessoais (quando conectados),
            e entender se nossos anúncios estão funcionando.
          </p>
        </section>

        <section>
          <h2 className="font-bold">4. Base legal</h2>
          <p>
            Execução de contrato (liberar seu acesso pago), consentimento
            (conexão opcional da sua API Shopee, pixel de anúncios) e
            legítimo interesse (segurança, prevenção de fraude).
          </p>
        </section>

        <section>
          <h2 className="font-bold">5. Com quem compartilhamos</h2>
          <p>Usamos os seguintes prestadores pra operar o serviço:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Supabase</strong> — banco de dados e autenticação.
            </li>
            <li>
              <strong>Vercel</strong> — hospedagem e analytics de uso.
            </li>
            <li>
              <strong>Cakto</strong> — processamento do pagamento (nunca
              vemos dados de cartão).
            </li>
            <li>
              <strong>Resend</strong> — envio do e-mail de acesso.
            </li>
            <li>
              <strong>Shopee</strong> — catálogo de produtos e geração de
              links de afiliado.
            </li>
            <li>
              <strong>Meta (Facebook/Instagram)</strong> — medição de
              resultado de anúncios, quando você chega por uma campanha
              nossa.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold">6. Seus direitos (LGPD)</h2>
          <p>
            Você pode pedir a qualquer momento: confirmação de que tratamos
            seus dados, acesso a eles, correção, exclusão, portabilidade, ou
            revogar um consentimento dado (como a conexão da sua API Shopee).
            Basta escrever pro e-mail de contato acima.
          </p>
        </section>

        <section>
          <h2 className="font-bold">7. Retenção</h2>
          <p>
            Mantemos seus dados enquanto sua conta existir. Se você pedir
            exclusão, apagamos em até 30 dias, exceto o que a lei exigir
            manter (ex.: registro fiscal da compra).
          </p>
        </section>

        <section>
          <h2 className="font-bold">8. Segurança</h2>
          <p>
            Segredos de terceiros que você conecta (App Secret da Shopee) são
            armazenados criptografados. O acesso ao banco é restrito por
            usuário (Row Level Security) — ninguém, nem o próprio Eita Promo,
            consulta seus dados fora do necessário pra operar o serviço.
          </p>
        </section>
      </div>
    </main>
  );
}
