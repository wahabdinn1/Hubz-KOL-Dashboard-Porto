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

            // Navigate directly to the API URL
            const apiUrl = `https://www.tikwm.com/api/user/posts?unique_id=${username}`;
            console.log(`[Puppeteer] Navigating to API: ${apiUrl}`);
            console.log('[Puppeteer] ⚠️ If you see a Cloudflare captcha, please solve it manually!');
            
            await page.goto(apiUrl, { waitUntil: 'networkidle2', timeout: 120000 }); // 2 min timeout for captcha

            // Wait for user to solve captcha - check for JSON response
            const waitForJson = async () => {
                const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max wait
                for (let i = 0; i < maxAttempts; i++) {
                    const content = await page.evaluate(() => document.body.innerText);
                    
                    // Check if content starts with JSON
                    if (content.trim().startsWith('{')) {
                        console.log('[Puppeteer] ✅ JSON response detected!');
                        return content;
                    }
                    
                    // Show progress every 5 attempts
                    if (i % 5 === 0) {
                        console.log(`[Puppeteer] Waiting for captcha resolution... (${i * 2}s)`);
                    }
                    
                    await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds between checks
                }
                
                // Return whatever we have after timeout
                return await page.evaluate(() => document.body.innerText);
            };

            const content = await waitForJson();
            console.log(`[Puppeteer] Response length: ${content.length} chars`);

            if (content.trim().startsWith('{')) {
                try {
                    // Extract just the JSON portion (between first { and last })
                    const jsonStart = content.indexOf('{');
                    const jsonEnd = content.lastIndexOf('}');
                    
                    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                        const jsonString = content.substring(jsonStart, jsonEnd + 1);
                        const json = JSON.parse(jsonString);
                        console.log('[Puppeteer] Successfully parsed JSON response!');
                        return json;
                    } else {
                        console.error('[Puppeteer] Could not find valid JSON boundaries');
                        return null;
                    }
                } catch (e) {
                    console.error('[Puppeteer] JSON parse error:', e);
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
