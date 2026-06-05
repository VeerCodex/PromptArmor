class Shield {
    constructor(config) {
        let apiKey;
        let apiUrl = 'http://localhost:8000';

        if (typeof config === 'string') {
            apiKey = config;
        } else if (config && typeof config === 'object') {
            apiKey = config.apiKey;
            if (config.apiUrl) {
                apiUrl = config.apiUrl;
            }
        }

        if (!apiKey) {
            throw new Error('API key (apiKey) is required to initialize PromptArmor Shield.');
        }

        this.apiKey = apiKey;
        this.apiUrl = apiUrl.replace(/\/$/, '');
    }

    async _post(endpoint, text) {
        const url = `${this.apiUrl}${endpoint}`;
        try {
            // Using global fetch (available in Node.js 18+)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                let errText;
                try {
                    const errJson = await response.json();
                    errText = errJson.detail || response.statusText;
                } catch {
                    errText = await response.text();
                }
                throw new Error(`API Error ${response.status}: ${errText}`);
            }

            return await response.json();
        } catch (error) {
            if (error.message.startsWith('API Error')) {
                throw error;
            }
            throw new Error(`Failed to connect to PromptArmor API at ${this.apiUrl}: ${error.message}`);
        }
    }

    /**
     * Scans user input for prompt injection, jailbreaks, and PII.
     * @param {string} userMessage - The input text to scan.
     * @returns {Promise<Object>} Scan results containing threat_score, threat_type, details.
     */
    async scanInput(userMessage) {
        return this._post('/scan/input', userMessage);
    }

    /**
     * Scans LLM response for data leakage and PII.
     * @param {string} llmResponse - The output text to scan.
     * @returns {Promise<Object>} Scan results containing threat_score, threat_type, details.
     */
    async scanOutput(llmResponse) {
        return this._post('/scan/output', llmResponse);
    }
}

module.exports = { Shield };
