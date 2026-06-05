# Node.js SDK Integration Manual

The Node.js SDK provides async/await support to protect Javascript applications.

## Installation

Install using `npm` from the local directory path:

```bash
npm install ./sdk/nodejs
```

## Quick Start Example

Integrate inside a Node.js project using standard imports:

```javascript
const { Shield } = require('promptarmor');
const { OpenAI } = require('openai');

// Initialize the PromptArmor Shield
const shield = new Shield({
  apiKey: 'your-api-key-here',
  apiUrl: 'http://localhost:8000'
});

const openai = new OpenAI();

async function handleRequest(userMessage) {
  // 1. Scan inputs
  const inputScan = await shield.scanInput(userMessage);
  
  if (inputScan.threat_score >= 70) {
    throw new Error(`Security Blocked: Threat Type [${inputScan.threat_type}]`);
  }

  // 2. Call OpenAI model
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: userMessage }],
  });
  const rawOutput = completion.choices[0].message.content;

  // 3. Scan outputs
  const outputScan = await shield.scanOutput(rawOutput);
  
  if (outputScan.threat_score >= 90) {
    throw new Error('Security Blocked: Outgoing data leakage detected.');
  }

  return rawOutput;
}
```

## Requirements

Requires Node.js `>=18.0.0` to support the global native fetch api.
