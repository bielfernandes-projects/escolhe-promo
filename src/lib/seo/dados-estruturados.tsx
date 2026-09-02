import { SITE_URL } from "./site";

/**
 * JSON-LD.
 *
 * É o que permite ao Google entender que a landing vende um produto de R$ 47
 * com garantia, e não é só mais uma página de texto — e o que habilita os
 * resultados enriquecidos (preço, avaliação, FAQ) na busca.
 *
 * Renderizado no servidor, dentro do HTML. O CSP libera script inline, então
 * a tag passa; se um dia a CSP endurecer com nonce, este é o ponto a ajustar.
 */
export function DadosEstruturados({ dados }: { dados: object }) {
  return (
    <script
      type="application/ld+json"
      // O conteúdo é montado por nós, não vem de entrada de usuário. Mesmo
      // assim o `<` é escapado: um nome com "</script>" fecharia a tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(dados).replace(/</g, "\u003c"),
      }}
    />
  );
}

export function organizacao() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organizacao`,
    name: "Escolhe Promo",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    email: "contato@escolhepromo.com.br",
    areaServed: "BR",
  };
}

export function produto(preco: string, faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizacao(),
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        url: SITE_URL,
        name: "Escolhe Promo",
        inLanguage: "pt-BR",
        publisher: { "@id": `${SITE_URL}/#organizacao` },
      },
      {
        // SoftwareApplication, não Product: o Escolhe Promo é uma ferramenta web,
        // não um item físico. O Rich Results Test cobra review/aggregateRating/
        // shippingDetails de todo Product e enche a landing de warnings —
        // SoftwareApplication com offer é o tipo certo e o preço aparece igual.
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#produto`,
        name: "Escolhe Promo",
        description:
          "Ferramenta que gera texto e imagem prontos pra afiliada da Shopee divulgar no WhatsApp e no Instagram, com vitrine de produtos atualizada todo dia.",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android",
        inLanguage: "pt-BR",
        image: `${SITE_URL}/opengraph-image`,
        publisher: { "@id": `${SITE_URL}/#organizacao` },
        offers: {
          "@type": "Offer",
          url: SITE_URL,
          price: preco,
          priceCurrency: "BRL",
          availability: "https://schema.org/InStock",
          // Pagamento único: acesso vitalício, sem validade da oferta.
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}

/** Vitrine pública da afiliada: perfil + lista dos produtos que ela publicou. */
export function vitrineDaAfiliada(opcoes: {
  nome: string;
  handle: string;
  itens: { nome: string; preco: number; imagem_url: string; link_afiliado: string }[];
}) {
  const url = `${SITE_URL}/@${opcoes.handle}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: `Promoções da ${opcoes.nome}`,
    inLanguage: "pt-BR",
    isPartOf: { "@id": `${SITE_URL}/#site` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opcoes.itens.length,
      itemListElement: opcoes.itens.slice(0, 100).map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: item.nome,
          image: item.imagem_url,
          offers: {
            "@type": "Offer",
            price: item.preco.toFixed(2),
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            url: item.link_afiliado,
          },
        },
      })),
    },
  };
}
