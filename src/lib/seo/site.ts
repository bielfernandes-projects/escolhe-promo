/**
 * Endereço canônico do site.
 *
 * Tem que ser o `www`: o apex responde 308 pro www, e usar o apex aqui fazia o
 * `og:image` e os links do sitemap apontarem pra uma URL que redireciona. O
 * Google trata as duas como páginas distintas (dividindo o sinal entre elas) e
 * vários scrapers de preview de link — WhatsApp entre eles — não seguem o
 * redirect, então a miniatura simplesmente não aparecia.
 */
export const SITE_URL = "https://www.escolhepromo.com.br";

/** Preço do acesso vitalício, num lugar só (landing + dados estruturados). */
export const PRECO_BRL = "47.00";
