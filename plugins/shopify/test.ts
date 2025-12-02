type ShopInfo = {
  shop: {
    name: string;
    email: string;
  };
};

export async function testShopify(credentials: Record<string, string>) {
  try {
    const storeDomain = credentials.SHOPIFY_STORE_DOMAIN;
    const accessToken = credentials.SHOPIFY_ACCESS_TOKEN;

    if (!storeDomain) {
      return {
        success: false,
        error: "SHOPIFY_STORE_DOMAIN is required",
      };
    }

    if (!accessToken) {
      return {
        success: false,
        error: "SHOPIFY_ACCESS_TOKEN is required",
      };
    }

    // Normalize store domain (remove protocol and trailing slashes)
    const normalizedDomain = storeDomain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    // Make a lightweight API call to verify credentials
    const response = await fetch(
      `https://${normalizedDomain}/admin/api/2024-01/shop.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error:
            "Invalid access token. Please check your Shopify Admin API access token.",
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          error:
            "Store not found. Please check your store domain (e.g., your-store.myshopify.com).",
        };
      }
      return {
        success: false,
        error: `API validation failed: HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as ShopInfo;

    if (!data.shop?.name) {
      return {
        success: false,
        error: "Failed to verify Shopify connection",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
