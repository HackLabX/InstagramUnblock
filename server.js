const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Simple route for the home page
app.get('/', (req, res) => {
  res.send('Welcome to the Instagram Unblock Service');
});

// Route to trigger the unblock.js script
app.get('/unblock', (req, res) => {
  console.log('Starting the unblock script...');

  // Execute the unblock.js script
  exec('node unblock.js', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error executing unblock.js: ${stderr}`);
      res.status(500).send('Failed to execute unblock script');
      return;
    }

    console.log(`Script executed successfully: ${stdout}`);
    res.send('Instagram Unblock process completed');
  });
});

// Example route for testing, could be extended for more functionality
app.get('/test', (req, res) => {
  res.send('Test route for checking server');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
