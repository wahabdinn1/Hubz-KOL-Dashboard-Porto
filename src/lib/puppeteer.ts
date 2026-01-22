import puppeteer from 'puppeteer';

export const PuppeteerService = {
    async fetchTikWMUserPosts(username: string) {
        let browser;
        try {
            browser = await puppeteer.launch({
                channel: 'chrome',
                headless: false, // Show browser window
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--window-size=1920,1080',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--disable-dev-shm-usage',
                    '--disable-infobars',
                    '--no-first-run',
                    '--no-default-browser-check',
                ],
                ignoreDefaultArgs: ['--enable-automation']
            });

            const page = await browser.newPage();
            
            // Manual stealth: Override navigator.webdriver
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
                
                // Override chrome object
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).chrome = {
                    runtime: {},
                };
                
                // Override permissions
                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters: PermissionDescriptor) =>
                    parameters.name === 'notifications'
                        ? Promise.resolve({ state: 'denied' } as PermissionStatus)
                        : originalQuery(parameters);
            });
            
            // Set viewport and realistic user agent
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

            // Set extra headers to appear more like a real browser
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            });

            // Variable to store the API response
            let apiResponseData: string | null = null;

            // Intercept network responses to capture the raw JSON
            page.on('response', async (response) => {
                const url = response.url();
                if (url.includes('/api/user/posts') && response.status() === 200) {
                    try {
                        const text = await response.text();
                        if (text.startsWith('{')) {
                            apiResponseData = text;
                        }
                    } catch {
                        // Response body may not be available
                    }
                }
            });

            // Navigate to the API URL
            const apiUrl = `https://www.tikwm.com/api/user/posts?unique_id=${username}`;
            
            await page.goto(apiUrl, { waitUntil: 'networkidle2', timeout: 60000 });

            // Wait for captcha resolution - poll for up to 2 minutes
            const maxWaitTime = 120000; // 2 minutes
            const pollInterval = 2000; // Check every 2 seconds
            let elapsed = 0;
            
            while (elapsed < maxWaitTime) {
                // Check if we got API response via network interception
                if (apiResponseData) {
                    try {
                        const json = JSON.parse(apiResponseData);
                        return json;
                    } catch {
                        // Parse error, continue waiting
                    }
                }
                
                // Check if page content is JSON (captcha solved)
                const pageContent = await page.evaluate(() => {
                    const pre = document.querySelector('pre');
                    if (pre) return pre.textContent || '';
                    return document.body.innerText;
                });
                
                if (pageContent.trim().startsWith('{')) {
                    try {
                        const cleanedContent = pageContent.replace(/[\x00-\x1F\x7F]/g, '').trim();
                        const json = JSON.parse(cleanedContent);
                        return json;
                    } catch {
                        // Continue waiting
                    }
                }
                
                await new Promise(r => setTimeout(r, pollInterval));
                elapsed += pollInterval;
            }

            // Timeout - try one last time from page content
            const finalContent = await page.evaluate(() => {
                const pre = document.querySelector('pre');
                if (pre) return pre.textContent || '';
                return document.body.innerText;
            });

            if (finalContent.trim().startsWith('{')) {
                try {
                    const cleanedContent = finalContent.replace(/[\x00-\x1F\x7F]/g, '').trim();
                    const json = JSON.parse(cleanedContent);
                    return json;
                } catch {
                    return null;
                }
            }
            
            return null;

        } catch {
            return null;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
};
