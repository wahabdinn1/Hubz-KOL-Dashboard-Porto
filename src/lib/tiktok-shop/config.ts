export const TIKTOK_SHOP_CONFIG = {
    appKey: process.env.TIKTOK_APP_KEY!,
    appSecret: process.env.TIKTOK_APP_SECRET!,
    redirectUri: process.env.TIKTOK_REDIRECT_URI!,
    authBaseUrl: "https://auth.tiktok-shops.com/oauth/authorize",
    apiBaseUrl: "https://open-api.tiktokglobalshop.com",
    authApiBaseUrl: "https://auth.tiktok-shops.com/api/v2",
};

export const TIKTOK_SHOP_ENDPOINTS = {
    getAccessToken: "/token/get",
    getRefreshToken: "/token/refresh",
    getAuthorizedShops: "/authorization/202309/shops",
};
