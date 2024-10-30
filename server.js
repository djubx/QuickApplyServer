const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})