// Test script to list available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function listModels() {
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'NOT FOUND');
    console.log('API Key value:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // List of models to test
    const modelsToTest = [
        'gemini-pro',
        'gemini-1.0-pro',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-exp-1206',
        'models/gemini-pro',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash'
    ];

    console.log('\n🔍 Testing available models...\n');

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say "OK" if you can hear me');
            const response = result.response.text();
            console.log(`✅ ${modelName}: WORKS - Response: "${response.substring(0, 50)}..."`);
        } catch (error) {
            if (error.status === 404) {
                console.log(`❌ ${modelName}: NOT FOUND (404)`);
            } else if (error.status === 429) {
                console.log(`⚠️  ${modelName}: RATE LIMITED (model exists but too many requests)`);
            } else if (error.status === 401 || error.status === 403) {
                console.log(`🔒 ${modelName}: ACCESS DENIED (${error.status})`);
            } else {
                console.log(`❓ ${modelName}: ERROR - ${error.message?.substring(0, 50)}`);
            }
        }
    }
}

listModels().catch(console.error);
