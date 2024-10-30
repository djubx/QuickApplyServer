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
    res.status(500).send('Something broke!!!');
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/fill', (req, res) => {
    const { html } = req.body;
    console.log(`Received HTML: ${html}`);
    res.send(html);
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