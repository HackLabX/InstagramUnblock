const express = require('express');
const { remote } = require('webdriverio');

const app = express();
app.use(express.json());

// Welcome message route
app.get('/', (req, res) => {
  res.send('Welcome to the Instagram Unblock Service');
});

// Endpoint to start the unblocking process
app.post('/unblock', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required!');
  }

  try {
    // Appium driver configuration
    const driver = await remote({
      path: '/wd/hub',
      port: 4723, // Default Appium server port
      capabilities: {
        platformName: 'Android',
        platformVersion: '10', // Adjust to match the device/emulator
        deviceName: 'emulator-5554', // Adjust to match your device/emulator
        appPackage: 'com.instagram.android',
        appActivity: 'com.instagram.mainactivity.LauncherActivity',
        automationName: 'UiAutomator2'
      }
    });

    // Perform automation steps (example: login and unblock a user)
    await driver.$('android=new UiSelector().text("Log In")').click(); // Example locator
    await driver.$('android=new UiSelector().resourceId("username_field_id")').setValue(username); // Replace with actual ID
    await driver.$('android=new UiSelector().resourceId("password_field_id")').setValue(password);
    await driver.$('android=new UiSelector().text("Log In")').click();

    // Add your unblocking steps here...
    res.send('Unblocking process started!');
    
    await driver.deleteSession(); // Close the session
  } catch (error) {
    console.error('Error during unblocking process:', error);
    res.status(500).send('An error occurred during the unblocking process.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
