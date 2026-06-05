# Python SDK Integration Manual

The PromptArmor Python SDK is a lightweight, zero-dependency client that validates user messages and LLM responses.

## Installation

Install directly using `pip` from the local directory path:

```bash
pip install ./sdk/python
```

## Quick Start Example

Here is a typical production script integrating PromptArmor with OpenAI's API:

```python
from promptarmor import Shield
import openai

# 1. Initialize the security shield
shield = Shield(
    api_key="your-api-key-here",
    api_url="http://localhost:8000"  # Target backend endpoint
)

def run_chat_safely(user_prompt: str) -> str:
    # 2. Check input prompt for injections/jailbreaks
    input_scan = shield.scan_input(user_prompt)
    
    if input_scan["threat_score"] >= 75:
        # Halt execution before sending request to model
        raise Exception(f"Security Alert: Blocked {input_scan['threat_type']}")

    # 3. Call LLM normally
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": user_prompt}]
    )
    llm_output = response.choices[0].message.content

    # 4. Check LLM output for leaks
    output_scan = shield.scan_output(llm_output)
    
    if output_scan["threat_score"] >= 90:
        raise Exception("Security Alert: Output data leak detected!")

    return llm_output
```

## Scan Response Payload

The `scan_input()` and `scan_output()` methods return a dictionary with the following schema:

```json
{
  "threat_score": 85,
  "threat_type": "Jailbreak",
  "details": {
    "pii_detected": {},
    "jailbreaks_detected": ["ignore previous instructions"],
    "injections_detected": []
  }
}
```
