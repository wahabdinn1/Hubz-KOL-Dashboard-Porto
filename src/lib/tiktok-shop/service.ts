import crypto from "crypto";
import { TIKTOK_SHOP_CONFIG, TIKTOK_SHOP_ENDPOINTS } from "./config";

export class TikTokShopService {
    /**
     * Generates the HMAC-SHA256 signature required by TikTok Shop API.
     * @param params - The query parameters of the request (excluding sign and access_token).
     * @param body - The request body (optional).
     * @returns The calculated signature.
     */
    static generateSignature(params: Record<string, any>, body?: string): string {
        const { appSecret } = TIKTOK_SHOP_CONFIG;

        // 1. Filter out 'sign' and 'access_token' parameters
        const keys = Object.keys(params).filter(
            (key) => key !== "sign" && key !== "access_token"
        );

        // 2. Sort keys alphabetically
        keys.sort();

        // 3. Concatenate key-value pairs
        let inputStr = keys.map((key) => `${key}${params[key]}`).join("");

        // 4. Append body if required (for non-GET/DELETE or specific content types)
        // Note: For simple auth calls, usually body is not included in signature unless specified.
        // Checking specific endpoint requirements is crucial. 
        // For /token/get (GET), no body.
        
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
        
        const params: Record<string, any> = {
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
        const sign = this.generateSignature(params);
        
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

    /**
     * Retrieves the Creator Profile information.
     * @param accessToken - The access token.
     * @returns The creator profile data.
     */
    static async getCreatorProfile(accessToken: string) {
        const { appKey, appSecret, apiBaseUrl } = TIKTOK_SHOP_CONFIG;
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Common params for business endpoints
        const params: Record<string, any> = {
            app_key: appKey,
            timestamp: timestamp,
            access_token: accessToken,
        };
        
        const sign = this.generateSignature(params);
        
        const url = new URL(`${apiBaseUrl}${TIKTOK_SHOP_ENDPOINTS.getCreatorProfile}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));
        url.searchParams.append("sign", sign);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
             // Try to parse json error
            try {
                const jsonErr = JSON.parse(errorText);
                throw new Error(`TikTok API Error: ${jsonErr.message || jsonErr.error_msg || errorText}`);
            } catch {
                throw new Error(`TikTok API Error: ${response.status} - ${errorText}`);
            }
        }

        return response.json();
    }
}
