const { AzureOpenAI } = require("openai");

class AzureOpenAIService {
    constructor() {
        if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_KEY) {
            throw new Error('Azure OpenAI credentials not found in environment variables');
        }

        try {
            this.client = new AzureOpenAI({
                apiKey: process.env.AZURE_OPENAI_KEY,
                endpoint: process.env.AZURE_OPENAI_ENDPOINT,
                apiVersion: "2024-02-15-preview"
            });
            this.deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID || 'gpt-4o-mini';
        } catch (error) {
            console.error('Error initializing Azure OpenAI client:', error);
            throw error;
        }
    }

    async processContent(command, html) {
        try {
            const messages = [
                { role: "system", content: "You are a helpful assistant that processes HTML content based on commands." },
                { role: "user", content: `Command: ${command}\nHTML: ${html}` }
            ];

            const response = await this.client.chat.completions.create({
                model: this.deploymentId,
                messages: messages,
                temperature: 0.7,
                top_p: 0.95,
                max_tokens: 800,
                n: 1
            });

            if (!response.choices || response.choices.length === 0) {
                throw new Error('No response received from Azure OpenAI');
            }

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Azure OpenAI Error:', error);
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