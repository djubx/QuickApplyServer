const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');

class AzureOpenAIService {
    constructor() {
        this.client = new OpenAIClient(
            process.env.AZURE_OPENAI_ENDPOINT,
            new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
        );
        this.deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID;
    }

    async processContent(command, html) {
        try {
            const messages = [
                { role: "system", content: "You are a helpful assistant that processes HTML content based on commands." },
                { role: "user", content: `Command: ${command}\nHTML: ${html}` }
            ];

            const response = await this.client.getChatCompletions(
                this.deploymentId,
                messages,
                {
                    temperature: 0.7,
                    topP: 0.95,
                    maxTokens: 800,
                    n: 1
                }
            );

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Azure OpenAI Error:', error);
            throw new Error(`Azure OpenAI processing failed: ${error.message}`);
        }
    }

    async getModels() {
        try {
            const models = await this.client.listModels();
            return models;
        } catch (error) {
            console.error('Error fetching models:', error);
            throw error;
        }
    }
}

module.exports = new AzureOpenAIService(); 