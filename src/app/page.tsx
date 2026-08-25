export default function LandingPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-6 py-32 px-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Eita Promo
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Copiou, postou, vendeu. Gere copy e imagens prontas pra divulgar
          produtos da Shopee no WhatsApp e no Instagram em segundos.
        </p>
        <a
          href="#"
          className="flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Quero acesso vitalício
        </a>
      </main>
    </div>
  );
}
