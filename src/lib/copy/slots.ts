/**
 * O Template de Copy do WhatsApp, no formato definido pelo dono do produto:
 *
 *   {abertura}
 *
 *   {nome do produto}
 *
 *   🏷️ De: R$ 99,73
 *   💰 Por: R$ 40,89
 *   🎯 Desconto: 59%
 *
 *   🔗 Link da oferta:
 *   {link}
 *
 *   {fechamento}
 *
 * O miolo (nome, preços, link) é fixo — é a informação da oferta e não deve
 * variar. O que varia são a abertura e o fechamento, sorteados a cada clique
 * em "gerar outra", pra quem posta todo dia não repetir o mesmo texto.
 *
 * Há dois conjuntos de abertura porque só ~87% dos produtos vêm com desconto
 * informado pela Shopee: sem o percentual, uma abertura que promete "59% OFF"
 * ficaria mentindo.
 *
 * Placeholders:
 *   {nome}       nome do produto
 *   {preco}      preço atual formatado, ex. "R$ 40,89"
 *   {desconto}   percentual inteiro, ex. "59"
 *   {vendas}     número de vendas
 *   {avaliacao}  nota, ex. "4.8"
 *   {b}...{/b}   negrito — vira *asterisco* no WhatsApp, some no Instagram
 *
 * A comissão do afiliado NUNCA entra na copy: ela é informação para quem
 * divulga, não para quem compra.
 */

export type SlotId = "abertura" | "aberturaSemDesconto" | "fechamento";

export type Slot = {
  id: SlotId;
  variacoes: string[];
};

/** Aberturas para quando a Shopee informou o percentual de desconto. */
const ABERTURA_COM_DESCONTO = [
  "Aproveite a chance! 🏆 Desconto de {desconto}% nesse achadinho! Só hoje! 🎉",
  "🔥 OLHA ISSO! {desconto}% OFF nesse achadinho que eu encontrei! Corre! 🏃‍♀️",
  "😱 Gente, que preço é esse?! {desconto}% de desconto só hoje! 🎉",
  "🚨 ACHADINHO DO DIA com {desconto}% OFF! Não vai perder, hein! ⏰",
  "✨ Achei e vim correndo mostrar: {desconto}% de desconto nesse aqui! 🎯",
  "💥 Olha o precinho! {desconto}% OFF por tempo limitado! ⚡",
  "🛒 Separei esse com {desconto}% de desconto pra vocês hoje! 💰",
  "😍 Eu AMEI esse e tá com {desconto}% OFF! Aproveita! 🎁",
  "⚡ Corre que esse tá voando com {desconto}% de desconto! 🚀",
  "💖 Não podia deixar de mostrar: {desconto}% OFF nesse achadinho! ✨",
  "🎉 Chegou a promoção que faltava: {desconto}% de desconto! 🏆",
  "👀 Olha o que eu garimpei! {desconto}% OFF só hoje! 🛍️",
  "🤑 {desconto}% de desconto nesse achadinho! Bora aproveitar! 🎁",
  "🏃‍♀️ Corre lá! Tá com {desconto}% OFF e vai acabar! ⏰",
  "💣 BOMBA! {desconto}% de desconto nesse produto! 🔥",
  "🌟 Achadinho da vez com {desconto}% OFF! Aproveita! 💫",
];

/** Aberturas para quando não há percentual — nenhuma promete desconto. */
const ABERTURA_SEM_DESCONTO = [
  "Aproveite a chance! 🏆 Olha o preço desse achadinho! Só hoje! 🎉",
  "🔥 OLHA ESSE ACHADINHO! Corre que tá valendo muito! 🏃‍♀️",
  "😱 Gente, que preço é esse?! Precisava mostrar pra vocês! 🎉",
  "🚨 ACHADINHO DO DIA! Não vai perder, hein! ⏰",
  "✨ Achei e vim correndo mostrar pra vocês! 🎯",
  "💥 Preciso te mostrar isso agora! ⚡",
  "🛒 Separei esse achadinho especial pra vocês hoje! 💰",
  "😍 Gente, eu AMEI esse! Aproveita! 🎁",
  "⚡ Corre que esse tá voando! 🚀",
  "💖 Esse aqui eu não podia deixar de mostrar! ✨",
  "🎉 Chegou o achadinho que faltava na sua casa! 🏆",
  "👀 Olha o que eu garimpei pra vocês hoje! 🛍️",
  "🤑 Esse preço tá de graça, viu! Bora aproveitar! 🎁",
  "🏃‍♀️ Corre lá que vai acabar! ⏰",
  "💣 Achei uma BOMBA de achadinho! 🔥",
  "🌟 Achadinho da vez, direto pra vocês! 💫",
];

const FECHAMENTO = [
  "✨ Aproveite essa oferta exclusiva!",
  "✨ Corre que é por tempo limitado!",
  "🎁 Aproveita enquanto tá nesse preço!",
  "⏰ Não deixa pra depois que acaba!",
  "🛍️ Garante o seu antes que suba de preço!",
  "🚀 Já tá voando do estoque, corre!",
  "❗ Quem deixar pra amanhã vai se arrepender!",
  "💚 Espero que goste tanto quanto eu!",
  "🔥 Ó o precinho, aproveita!",
  "😍 Depois me conta se você comprou!",
  "🛒 Bora garantir o seu!",
  "⚠️ Estoque limitado, corre!",
  "🎉 Aproveita que hoje tá valendo!",
  "💸 Economia dessas não aparece todo dia!",
];

export const SLOTS: Slot[] = [
  { id: "abertura", variacoes: ABERTURA_COM_DESCONTO },
  { id: "aberturaSemDesconto", variacoes: ABERTURA_SEM_DESCONTO },
  { id: "fechamento", variacoes: FECHAMENTO },
];
