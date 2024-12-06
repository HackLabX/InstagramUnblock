const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Automatically redirect to Instagram login page when accessing the root
app.get('/', (req, res) => {
    // Trigger the Playwright script
    const scriptPath = path.join(__dirname, 'unblock.js'); // Path to unblock.js script
    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            res.send(`<h3>Script Execution Failed</h3><pre>${error.message}</pre>`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            res.send(`<h3>Script Execution Completed with Errors</h3><pre>${stderr}</pre>`);
            return;
        }

        // After script execution, redirect the user to Instagram login page
        res.redirect('https://www.instagram.com/accounts/login/');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
