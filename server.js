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

app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!!!!');
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/fill', (req, res) => {
    try {
        const { html, url, timestamp } = req.body;
        if (!html) {
            return res.status(400).json({
                error: 'HTML content is required in the request body'
            });
        }

        // Log the additional information
        console.log(`Processing request from URL: ${url}`);
        console.log(`Request timestamp: ${new Date(timestamp).toISOString()}`);

        // Since the client expects application/json (based on Accept header)
        // we should send a JSON response instead of plain HTML
        res.json({
            html: html,
            processed: true,
            timestamp: Date.now()
        });
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