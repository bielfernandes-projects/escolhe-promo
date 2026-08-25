/**
 * The Template de Copy: the pool of phrasings each slot can contribute.
 *
 * One variation is drawn per slot and the results are joined, so the number of
 * distinct copies is the product of the pool sizes — currently in the tens of
 * thousands, which is what keeps an affiliate from posting the same text twice.
 *
 * Placeholders available to every variation:
 *   {nome}       nome do produto
 *   {preco}      preço formatado, ex. "R$ 119,28"
 *   {vendas}     número de vendas
 *   {avaliacao}  nota, ex. "4.8"
 *   {b}...{/b}   negrito — vira *asterisco* no WhatsApp, some no Instagram
 *
 * A comissão do afiliado NUNCA entra na copy: ela é informação para quem
 * divulga, não para quem compra.
 */

export type SlotId = "abertura" | "beneficio" | "urgencia" | "fechamento";

export type Slot = {
  id: SlotId;
  variacoes: string[];
};

export const SLOTS: Slot[] = [
  {
    id: "abertura",
    variacoes: [
      "🔥 OLHA ESSE ACHADINHO!",
      "😱 GENTE, QUE PREÇO É ESSE?!",
      "🚨 ACHADINHO DO DIA!",
      "✨ Achei e vim correndo mostrar pra vocês!",
      "💥 PRECISO te mostrar isso agora!",
      "🛒 Separei esse achadinho especial pra vocês hoje!",
      "😍 Gente, eu AMEI esse!",
      "⚡ Corre que esse tá voando!",
      "🎯 Achado da semana chegou!",
      "💖 Esse aqui eu não podia deixar de mostrar!",
    ],
  },
  {
    id: "beneficio",
    variacoes: [
      "{b}{nome}{/b} por apenas {preco} 😮",
      "{b}{nome}{/b} saindo por {preco} — sério isso!",
      "Olha o preço: {b}{nome}{/b} por {preco} 🤩",
      "{b}{nome}{/b} 👉 {preco}",
      "{b}{nome}{/b} por {preco}. Eu não acreditei quando vi!",
      "{b}{nome}{/b} de tudo isso por {preco} 💸",
      "{b}{nome}{/b}, agora por {preco} e com entrega rápida 🚚",
      "{b}{nome}{/b} por {preco} — qualidade que vale cada centavo!",
    ],
  },
  {
    id: "urgencia",
    variacoes: [
      "⏰ Promoção por tempo LIMITADO!",
      "⚠️ O estoque tá acabando, viu?",
      "🏃‍♀️ Corre que é por poucas horas!",
      "🔴 Última chance nesse preço!",
      "⌛ Isso aqui não vai durar muito tempo!",
      "📉 O preço pode subir a qualquer momento!",
      "🎁 Aproveita enquanto tá com esse desconto!",
      "🚀 Já tá voando do estoque!",
      "❗ Quem deixar pra depois vai perder!",
    ],
  },
  {
    id: "fechamento",
    variacoes: [
      "👉 Garanta o seu aqui: {link}",
      "🛍️ Compre pelo link: {link}",
      "É só clicar aqui pra pegar o seu 👇\n{link}",
      "Link direto pra compra 👇\n{link}",
      "Corre pegar o seu 👇\n{link}",
      "Toca aqui e aproveita 👇\n{link}",
      "👇 Link com o desconto ativo:\n{link}",
      "Não vai ficar de fora, hein! 👇\n{link}",
    ],
  },
];
