import crypto from "crypto";
import { TIKTOK_SHOP_CONFIG, TIKTOK_SHOP_ENDPOINTS } from "./config";

export class TikTokShopService {
    /**
     * Generates the HMAC-SHA256 signature required by TikTok Shop API.
     * @param params - The query parameters of the request (excluding sign and access_token).
     * @param body - The request body (optional).
     * @returns The calculated signature.
     */
    static generateSignature(params: Record<string, string | number | boolean>, path?: string): string {
        const { appSecret } = TIKTOK_SHOP_CONFIG;

        // 1. Filter out 'sign' and 'access_token' parameters
        const keys = Object.keys(params).filter(
            (key) => key !== "sign" && key !== "access_token"
        );

        // 2. Sort keys alphabetically
        keys.sort();

        // 3. Concatenate key-value pairs
        let inputStr = keys.map((key) => `${key}${params[key]}`).join("");

        // 4. Prepend Path if provided (Critical for V2 Business Endpoints)
        if (path) {
            inputStr = `${path}${inputStr}`;
        }
        
        // 5. Wrap with app_secret
        inputStr = `${appSecret}${inputStr}${appSecret}`;

        // 6. Calculate HMAC-SHA256
        const hmac = crypto.createHmac("sha256", appSecret);
        hmac.update(inputStr);
        return hmac.digest("hex");
    }

    /**
     * Generates the Authorization URL for the user to login.
     * @param state - A random string to prevent CSRF.
     * @returns The full authorization URL.
     */
    static getAuthUrl(state: string): string {
        const { appKey, redirectUri, authBaseUrl } = TIKTOK_SHOP_CONFIG;
        const url = new URL(authBaseUrl);
        url.searchParams.append("app_key", appKey);
        url.searchParams.append("state", state);
        url.searchParams.append("redirect_uri", redirectUri); // Optional/Recommended to ensure match
        return url.toString();
    }

    /**
     * Exchanges the auth code for an access token.
     * @param authCode - The code returned by TikTok.
     * @returns The token response.
     */
    static async getAccessToken(authCode: string) {
        const { appKey, appSecret, authApiBaseUrl } = TIKTOK_SHOP_CONFIG;
        const timestamp = Math.floor(Date.now() / 1000);
        
        const params: Record<string, string | number> = {
            app_key: appKey,
            app_secret: appSecret,
            auth_code: authCode,
            grant_type: "authorized_code",
            timestamp: timestamp,
        };

        // Note: For /token/get, signature logic might differ slightly or use specific params.
        // According to docs: https://partner.tiktokshop.com/docv2/page/650fd2ad22c95502446779f6
        // GET https://auth.tiktok-shops.com/api/v2/token/get
        
        // Calculate signature
        const sign = this.generateSignature(params, TIKTOK_SHOP_ENDPOINTS.getAccessToken);
        
        const url = new URL(`${authApiBaseUrl}${TIKTOK_SHOP_ENDPOINTS.getAccessToken}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));
        url.searchParams.append("sign", sign);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.json();
    }


}
