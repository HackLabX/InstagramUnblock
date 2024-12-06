const wdio = require('webdriverio');

(async () => {
  const options = {
    path: '/wd/hub',
    port: 4723,
    capabilities: {
      platformName: "Android", // Change to "iOS" for Safari
      browserName: "Chrome",  // Use "Safari" for iOS
      automationName: "UiAutomator2", // Use "XCUITest" for iOS
      deviceName: "Android Emulator", // Adjust for a real device
    },
  };

  const browser = await wdio.remote(options);

  try {
    // Navigate to Instagram login
    console.log("Navigating to Instagram login...");
    await browser.url("https://www.instagram.com/accounts/login/");

    // Wait for user to manually log in
    console.log("Please log in manually and press ENTER to continue...");
    await new Promise(resolve => require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    }).question("", resolve));

    // Navigate to the Blocked Accounts page
    console.log("Navigating to Blocked Accounts...");
    await browser.url("https://www.instagram.com/accounts/blocked_accounts/");

    // Scroll through blocked accounts
    console.log("Scrolling through blocked accounts...");
    await browser.execute(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
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

    // Locate and unblock target user
    const targetUsername = 'realsreeharis';
    console.log(`Looking for the account: ${targetUsername}`);
    const accounts = await browser.$$('div[data-bloks-name="bk.components.Flexbox"]');
    let targetFound = false;

    for (const account of accounts) {
      const username = await account.$('span[data-bloks-name="bk.components.Text"]');
      const usernameText = await username.getText();
      if (usernameText.trim() === targetUsername) {
        console.log(`Found target account: ${usernameText}`);

        const unblockButton = await account.$('div[aria-label="Unblock"]');
        if (unblockButton) {
          console.log("Clicking unblock button...");
          await unblockButton.click();

          const confirmButton = await browser.$('button=Unblock');
          if (confirmButton) {
            console.log("Confirming unblock action...");
            await confirmButton.click();
            console.log(`Account "${targetUsername}" unblocked successfully.`);
            targetFound = true;
            break;
          }
        }
      }
    }

    if (!targetFound) {
      console.log(`Account "${targetUsername}" not found.`);
    }
  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    await browser.deleteSession();
  }
})();
