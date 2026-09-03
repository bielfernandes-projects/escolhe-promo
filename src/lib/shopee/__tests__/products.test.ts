import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const queryShopee = vi.fn();
vi.mock("../client", () => ({ queryShopee: (...a: unknown[]) => queryShopee(...a) }));

import { fetchProdutos } from "../products";

const NODE = {
  itemId: 1,
  productName: "Air Fryer 5L",
  imageUrl: "https://cf.shopee/x.jpg",
  price: "299.90",
  commissionRate: "0.12",
  commission: "36.00",
  sales: 500,
  ratingStar: "4.8",
  priceDiscountRate: "10",
  productCatIds: [],
  offerLink: "https://s.shopee.com.br/a",
  productLink: "https://shopee.com.br/p",
};

beforeEach(() => queryShopee.mockReset());

describe("fetchProdutos", () => {
  it("manda o keyword nas variáveis da query e para quando a Shopee esvazia", async () => {
    queryShopee
      .mockResolvedValueOnce({ productOfferV2: { nodes: [NODE] } })
      .mockResolvedValueOnce({ productOfferV2: { nodes: [] } });

    const r = await fetchProdutos({ keyword: "air fryer", limit: 20 });

    expect(r).toHaveLength(1);
    expect(r[0].nome).toBe("Air Fryer 5L");
    const [, variables] = queryShopee.mock.calls[0];
    expect(variables).toMatchObject({ keyword: "air fryer" });
  });

  it("repassa a credencial da afiliada pro queryShopee", async () => {
    queryShopee.mockResolvedValueOnce({ productOfferV2: { nodes: [] } });
    const cred = { appId: "id", appSecret: "segredo" };

    await fetchProdutos({ keyword: "fone", credenciais: cred });

    const [, , credenciais] = queryShopee.mock.calls[0];
    expect(credenciais).toBe(cred);
  });

  it("sem keyword, passa null (busca por categoria/feed)", async () => {
    queryShopee.mockResolvedValueOnce({ productOfferV2: { nodes: [] } });

    await fetchProdutos({ limit: 10 });

    const [, variables] = queryShopee.mock.calls[0];
    expect(variables).toMatchObject({ keyword: null });
  });
});
