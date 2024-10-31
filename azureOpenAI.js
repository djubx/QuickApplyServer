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

    async processContent(command, html) {
        try {
            console.log(`Processing content with deployment: ${this.deploymentId}`);

            const messages = [
                { role: "system", content: "You are a helpful assistant that processes HTML content and fills all the form elements in HTML based on the command post which you return the entire filled HTML." },
                { role: "user", content: `Fill the possible fields of the HTML using the following summary: ${command}\nHTML: ${html}` }
            ];

            const response = await this.client.chat.completions.create({
                model: this.deploymentId,
                messages: messages
            });

            if (!response.choices || response.choices.length === 0) {
                throw new Error('No response received from Azure OpenAI');
            }

            console.log('Azure OpenAI Response:', response.choices[0].message);
            return response.choices[0].message.content;
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