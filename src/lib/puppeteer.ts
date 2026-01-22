import puppeteer from 'puppeteer';

export const PuppeteerService = {
    async fetchTikWMUserPosts(username: string) {
        let browser;
        try {
            console.log(`[Puppeteer] Launching browser (Chrome, Non-Headless) for ${username}...`);
            browser = await puppeteer.launch({
                channel: 'chrome', // Use installed Chrome
                headless: false,   // Show browser for manual captcha solving
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--window-size=1200,800',
                    '--disable-blink-features=AutomationControlled'
                ],
                ignoreDefaultArgs: ['--enable-automation']
            });

            const page = await browser.newPage();
            
            // Set Viewport & User Agent
            await page.setViewport({ width: 1200, height: 800 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Variable to store the API response
            let apiResponseData: string | null = null;

            // Intercept network responses to capture the raw JSON
            page.on('response', async (response) => {
                const url = response.url();
                if (url.includes('/api/user/posts') && response.status() === 200) {
                    try {
                        const text = await response.text();
                        if (text.startsWith('{')) {
                            console.log('[Puppeteer] ✅ Captured API response from network!');
                            apiResponseData = text;
                        }
                    } catch {
                        // Response body may not be available
                    }
                }
            });

            // Navigate directly to the API URL
            const apiUrl = `https://www.tikwm.com/api/user/posts?unique_id=${username}`;
            console.log(`[Puppeteer] Navigating to API: ${apiUrl}`);
            console.log('[Puppeteer] ⚠️ If you see a Cloudflare captcha, please solve it manually!');
            
            await page.goto(apiUrl, { waitUntil: 'networkidle2', timeout: 120000 }); // 2 min timeout for captcha

            // Wait for captcha resolution and API response
            const maxWaitTime = 120000; // 2 minutes
            const startTime = Date.now();
            
            while (!apiResponseData && (Date.now() - startTime) < maxWaitTime) {
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                if (elapsed % 10 === 0 && elapsed > 0) {
                    console.log(`[Puppeteer] Waiting for captcha resolution... (${elapsed}s)`);
                }
                
                // Check if page content looks like JSON (fallback)
                const content = await page.evaluate(() => document.body.innerText);
                if (content.trim().startsWith('{') && !apiResponseData) {
                    // Try to get fresh response by reloading
                    console.log('[Puppeteer] JSON detected in DOM, checking network capture...');
                    await new Promise(r => setTimeout(r, 1000));
                }
                
                await new Promise(r => setTimeout(r, 2000));
            }

            // If we captured from network, use that (most reliable)
            if (apiResponseData) {
                try {
                    const json = JSON.parse(apiResponseData);
                    console.log('[Puppeteer] Successfully parsed JSON from network response!');
                    return json;
                } catch (e) {
                    console.error('[Puppeteer] Network JSON parse error:', e);
                }
            }

            // Fallback: Try to get from page content using <pre> tag first
            console.log('[Puppeteer] Trying fallback: extracting from page content...');
            const content = await page.evaluate(() => {
                // Try to get content from <pre> tag first (common for raw JSON display)
                const pre = document.querySelector('pre');
                if (pre) {
                    return pre.textContent || '';
                }
                // Fall back to body innerText
                return document.body.innerText;
            });

            if (content.trim().startsWith('{')) {
                try {
                    // Clean the content - remove any non-printable characters
                    const cleanedContent = content
                        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
                        .trim();
                    
                    const json = JSON.parse(cleanedContent);
                    console.log('[Puppeteer] Successfully parsed JSON from page content!');
                    return json;
                } catch (e) {
                    console.error('[Puppeteer] Page content JSON parse error:', e);
                    console.log('[Puppeteer] First 500 chars:', content.substring(0, 500));
                    return null;
                }
            } else {
                console.log('[Puppeteer] Response is not JSON. Captcha may not have been solved.');
                console.log('[Puppeteer] First 200 chars:', content.substring(0, 200));
                return null;
            }

        } catch (error) {
            console.error('[Puppeteer] Error fetching user posts:', error);
            return null;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
};
