const { chromium } = require('playwright');

(async () => {
    const targetUsername = 'realsreeharis'; // Replace with the username to unblock
    const redirectURL = 'https://www.instagram.com/reel/DC6ZwhVz6Y3/?igsh=YzljYTk1ODg3Zg=='; // Redirect URL after login

    // Step 1: Launch browser in non-headless mode for manual login
    console.log('Launching browser for manual login...');
    const browser = await chromium.launch({ headless: false }); // Non-headless mode for manual login
    const context = await browser.newContext(); // Reuse the existing browser context
    const page = await context.newPage();

    try {
        // Navigate to Instagram login page
        console.log('Please log in to Instagram manually...');
        await page.goto('https://www.instagram.com/accounts/login/');

        // Wait indefinitely until the login process is completed (checking for Home icon after login)
        console.log('Waiting for login to complete...');
        await page.waitForSelector('svg[aria-label="Home"]', { state: 'attached', timeout: 0 }); // Disable timeout

        console.log('Login confirmed. Redirecting to the provided URL...');
        await page.goto(redirectURL); // Redirect to the specified URL after login
        console.log(`Redirected to: ${redirectURL}`);

        // Save cookies and storage state (session data)
        const storageState = await context.storageState();

        console.log('Login successful. Proceeding with the task...');

        // Step 2: Launch headless browser for the rest of the process
        console.log('Launching headless browser for the rest of the process...');
        const headlessBrowser = await chromium.launch({ headless: true }); // Headless mode for automation
        const headlessContext = await headlessBrowser.newContext({ storageState }); // Use saved session from existing context
        const headlessPage = await headlessContext.newPage();

        // Navigate to Blocked Accounts page
        console.log('Navigating to Blocked Accounts...');
        await headlessPage.goto('https://www.instagram.com/accounts/blocked_accounts/');

        // Scroll through blocked accounts
        console.log('Scrolling through blocked accounts...');
        await headlessPage.evaluate(() => {
            return new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100; // Adjust scroll distance
                const interval = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        });

        // Locate and unblock the target account
        console.log(`Looking for the account: ${targetUsername}`);
        const accounts = await headlessPage.$$('div[data-bloks-name="bk.components.Flexbox"]'); // Get all account containers
        let targetFound = false;

        for (const account of accounts) {
            const username = await account.$eval('span[data-bloks-name="bk.components.Text"]', el => el.textContent.trim());
            if (username === targetUsername) {
                console.log(`Found target account: ${username}`);

                // Click the Unblock button
                const unblockButton = await account.$('div[aria-label="Unblock"]');
                if (unblockButton) {
                    console.log('Clicking the unblock button...');
                    await unblockButton.click();

                    // Handle confirmation dialog
                    console.log('Waiting for confirmation dialog...');
                    await headlessPage.waitForSelector('button:has-text("Unblock")', { timeout: 0 }); // Disable timeout

                    const confirmButton = await headlessPage.$('button:has-text("Unblock")');
                    if (confirmButton) {
                        console.log('Confirming unblock action...');
                        await confirmButton.click();
                        console.log(`Account "${targetUsername}" unblocked successfully.`);
                    } else {
                        console.log('Confirmation dialog not found.');
                    }

                    targetFound = true;
                    break;
                } else {
                    console.log(`Unblock button not found for "${targetUsername}".`);
                }
            }
        }

        if (!targetFound) {
            console.log(`Account with username "${targetUsername}" not found in the blocked list.`);
        }

        // Close the headless browser
        await headlessBrowser.close();
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        if (browser) await browser.close();
    }
})();
