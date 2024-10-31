const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Add CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!!!!');
});

// Add this at the top of the file, after the express initialization
let lastHtmlResponse = null;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/fill', (req, res) => {
    try {
        const { html, url, timestamp, command } = req.body;
        if (!html) {
            return res.status(400).json({
                error: 'HTML content is required in the request body'
            });
        }

        // Log all the information including the command
        console.log('=== New Fill Request ===');
        console.log(`URL: ${url}`);
        console.log(`Timestamp: ${new Date(timestamp).toISOString()}`);
        console.log(`Command: ${command || 'No command provided'}`);
        console.log('Current HTML:', html);
        console.log('Last HTML Response:', lastHtmlResponse);
        console.log('=== End Fill Request ===\n');

        // Store the current response to send in next request
        const currentResponse = {
            html: lastHtmlResponse || html, // If lastHtmlResponse is null, use current html
            processed: true,
            timestamp: Date.now(),
            command: command // Include the command in the response
        };

        // Update lastHtmlResponse for the next request
        lastHtmlResponse = html;

        // Send the previous HTML (or current if it's the first request)
        res.json(currentResponse);
    } catch (error) {
        console.error('Error processing HTML:', error);
        res.status(500).json({
            error: 'Failed to process HTML content'
        });
    }
})

app.get('/text', (req, res) => {
    const { text } = req.query;
    console.log(`Received text: ${text}`);
    res.send('Thank you');
})

// Handle 404
app.use((req, res) => {
    res.status(404).send('Not Found');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})