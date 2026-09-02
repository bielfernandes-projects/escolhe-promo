import { describe, it, expect } from "vitest";
import { linkShopeeValido, imagemPermitida } from "../urls";

describe("linkShopeeValido", () => {
  it("aceita os hosts reais da Shopee", () => {
    expect(linkShopeeValido("https://s.shopee.com.br/abc123")).toBe(true);
    expect(linkShopeeValido("https://shopee.com.br/produto-i.123.456")).toBe(true);
    expect(linkShopeeValido("https://shp.ee/xyz")).toBe(true);
    expect(linkShopeeValido("  https://shope.ee/xyz  ")).toBe(true);
  });

  it("bloqueia javascript: (era XSS armazenado na vitrine pública)", () => {
    expect(linkShopeeValido("javascript:alert(1)//shopee.com.br")).toBe(false);
    expect(linkShopeeValido("JaVaScRiPt:alert(1)")).toBe(false);
    expect(linkShopeeValido("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("bloqueia host de terceiro que só cita shopee.com.br", () => {
    // O regex antigo (`.includes`) deixava todos estes passarem.
    expect(linkShopeeValido("https://evil.com/?ref=shopee.com.br")).toBe(false);
    expect(linkShopeeValido("https://shopee.com.br.evil.com/x")).toBe(false);
    expect(linkShopeeValido("https://evil.com#shp.ee")).toBe(false);
  });

  it("exige https", () => {
    expect(linkShopeeValido("http://shopee.com.br/x")).toBe(false);
  });

  it("rejeita lixo", () => {
    expect(linkShopeeValido("")).toBe(false);
    expect(linkShopeeValido("nao é url")).toBe(false);
    expect(linkShopeeValido("https://" + "a".repeat(3000))).toBe(false);
  });
});

describe("imagemPermitida", () => {
  it("aceita o CDN da Shopee e o Storage do Supabase", () => {
    expect(imagemPermitida("https://down-br.img.susercontent.com/file/abc")).toBe(true);
    expect(imagemPermitida("https://cf.shopee.com.br/file/abc")).toBe(true);
    expect(imagemPermitida("https://xyz.supabase.co/storage/v1/object/public/p.jpg")).toBe(true);
  });

  it("bloqueia SSRF pra rede interna e metadados de nuvem", () => {
    expect(imagemPermitida("http://169.254.169.254/latest/meta-data/")).toBe(false);
    expect(imagemPermitida("https://169.254.169.254/latest/meta-data/")).toBe(false);
    expect(imagemPermitida("http://localhost:3000/api/cron/sync-produtos")).toBe(false);
    expect(imagemPermitida("https://10.0.0.1/admin")).toBe(false);
    expect(imagemPermitida("file:///etc/passwd")).toBe(false);
  });

  it("bloqueia host de terceiro com sufixo parecido", () => {
    expect(imagemPermitida("https://susercontent.com.evil.com/x.jpg")).toBe(false);
    expect(imagemPermitida("https://evilsusercontent.com/x.jpg")).toBe(false);
  });
});
