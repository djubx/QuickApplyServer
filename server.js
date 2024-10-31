require('dotenv').config();
const express = require('express');
const azureOpenAI = require('./azureOpenAI');
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

app.post('/fill', async (req, res) => {
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

        // Process content using Azure OpenAI
        const aiResponse = await azureOpenAI.processContent(command, html);

        // Store the current response to send in next request
        const currentResponse = {
            html: aiResponse,
            processed: true,
            timestamp: Date.now(),
            command: command
        };

        // Update lastHtmlResponse for the next request
        lastHtmlResponse = html;

        // Send the AI-processed response
        res.json(currentResponse);
    } catch (error) {
        console.error('Error processing HTML:', error);
        res.status(500).json({
            error: 'Failed to process HTML content',
            details: error.message
        });
    }
})

app.get('/text', (req, res) => {
    const { text } = req.query;
    console.log(`Received text: ${text}`);
    res.send('Thank you');
})

// Add a new endpoint to list available models
app.get('/models', async (req, res) => {
    try {
        const models = await azureOpenAI.getModels();
        res.json(models);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch models',
            details: error.message
        });
    }
});

// Handle 404
app.use((req, res) => {
    res.status(404).send('Not Found');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})