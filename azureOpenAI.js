const { AzureOpenAI } = require("openai");

class AzureOpenAIService {
    constructor() {
        if (!process.env.AZURE_OPENAI_ENDPOINT ||
            !process.env.AZURE_OPENAI_KEY ||
            !process.env.AZURE_OPENAI_API_VERSION ||
            !process.env.AZURE_OPENAI_DEPLOYMENT_ID) {
            throw new Error('Azure OpenAI credentials not found in environment variables');
        }

        try {
            this.client = new AzureOpenAI({
                apiKey: process.env.AZURE_OPENAI_KEY,
                endpoint: process.env.AZURE_OPENAI_ENDPOINT,
                apiVersion: process.env.AZURE_OPENAI_API_VERSION,
                deploymentId: process.env.AZURE_OPENAI_DEPLOYMENT_ID
            });
            this.deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID;
            console.log('Azure OpenAI Service initialized with deployment:', this.deploymentId);
        } catch (error) {
            console.error('Error initializing Azure OpenAI client:', error);
            throw error;
        }
    }

    async processContent(command, htmlString) {
        try {
            console.log(`Processing HTML content with deployment: ${this.deploymentId}`);

            // Ensure the HTML is treated as a string
            const sanitizedHtml = String(htmlString).trim();

            const messages = [
                { role: "system", content: "Provide the HTML text. I will return the same HTML text with data prefilled using the summary that you will provide. I will try to fill all the data in the given HTML text. (Even if I am required to guess it)" },
                { role: "user", content: `(Don't add anything on your own) Fill all the fields of the HTML, including checkboxes and radio buttons if there are any in HTML text using the following summary: ${command}\nHTML: ${sanitizedHtml}` }
            ];

            console.log('messages =====> ', messages);

            const response = await this.client.chat.completions.create({
                model: this.deploymentId,
                messages: messages,
                temperature: 0.3, // Lower temperature for more consistent outputs
                max_tokens: 4000  // Increased to handle larger HTML forms

            });

            if (!response.choices || response.choices.length === 0) {
                throw new Error('No response received from Azure OpenAI');
            }

            // Extract and return only the HTML string from the response
            const filledHtml = response.choices[0].message.content.trim();
            console.log('Processed HTML form successfully =====> response from GPT');
            console.log(filledHtml);
            return filledHtml;
        } catch (error) {
            console.error('Azure OpenAI Error:', error);
            if (error.code === 'DeploymentNotFound') {
                throw new Error(`Deployment '${this.deploymentId}' not found. Please check your Azure OpenAI deployments.`);
            }
            throw new Error(`Azure OpenAI processing failed: ${error.message}`);
        }
    }

    async getModels() {
        try {
            const models = await this.client.models.list();
            return models.data;
        } catch (error) {
            console.error('Error fetching models:', error);
            throw error;
        }
    }
}

module.exports = new AzureOpenAIService(); 