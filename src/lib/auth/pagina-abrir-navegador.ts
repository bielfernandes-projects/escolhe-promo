/**
 * HTML autossuficiente servido quando o magic link é aberto dentro de um in-app
 * browser (Gmail, WhatsApp, Instagram...). Empurra o usuário pro navegador
 * padrão SEM consumir o token — o link continua válido pro navegador de verdade.
 *
 * Android: `intent://` abre direto no navegador padrão.
 * iOS: não dá pra forçar; mostra o link pra copiar e instrução do menu "•••".
 */
export function paginaAbrirNoNavegador(opts: {
  urlHttps: string;
  android: boolean;
}): string {
  const { urlHttps, android } = opts;

  // intent:// exige a URL sem o esquema https://
  const semEsquema = urlHttps.replace(/^https?:\/\//, "");
  const intentUrl = `intent://${semEsquema}#Intent;scheme=https;package=com.android.chrome;end`;

  const jsAndroid = android
    ? `try { window.location.href = ${JSON.stringify(intentUrl)}; } catch (e) {}`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Abrir no navegador — Escolhe Promo</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #f8f8f8; color: #1a1a1a;
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 24px; line-height: 1.5;
  }
  .cartao {
    background: #fff; border-radius: 16px; padding: 32px 24px;
    max-width: 400px; width: 100%; text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,.08);
  }
  .marca { font-size: 26px; font-weight: 800; color: #c43a1e; letter-spacing: -.02em; margin-bottom: 20px; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  p { font-size: 14px; color: #666; margin-bottom: 20px; }
  .botao {
    display: block; width: 100%; background: #c43a1e; color: #fff;
    text-decoration: none; padding: 14px; border-radius: 10px;
    font-weight: 700; font-size: 15px; border: none; cursor: pointer;
    margin-bottom: 12px;
  }
  .copiar {
    display: block; width: 100%; background: #f0f0f0; color: #1a1a1a;
    padding: 12px; border-radius: 10px; font-weight: 600; font-size: 14px;
    border: none; cursor: pointer;
  }
  .instrucao {
    font-size: 12px; color: #999; margin-top: 16px;
  }
  .ok { color: #059669; font-weight: 600; }
</style>
</head>
<body>
  <div class="cartao">
    <div class="marca">Escolhe Promo</div>
    <h1>Abra no seu navegador</h1>
    <p>Pra entrar com segurança, este link precisa abrir no navegador do celular (Chrome, Safari), não aqui dentro do app.</p>

    <a class="botao" href="${escapeHtml(urlHttps)}" id="abrir">Abrir no navegador</a>
    <button class="copiar" id="copiar" type="button">Copiar link</button>

    <p class="instrucao" id="instrucao">
      Se o botão não funcionar: toque no menu <strong>•••</strong> no canto da tela e escolha <strong>"Abrir no navegador"</strong>.
    </p>
  </div>

<script>
(function () {
  var url = ${JSON.stringify(urlHttps)};
  ${jsAndroid}

  var btnCopiar = document.getElementById("copiar");
  btnCopiar.addEventListener("click", function () {
    function feito() {
      btnCopiar.textContent = "Link copiado!";
      btnCopiar.classList.add("ok");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(feito).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); feito(); } catch (e) {}
      document.body.removeChild(ta);
    }
  });
})();
</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
