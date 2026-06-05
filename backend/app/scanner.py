import re
from typing import Dict, Any, Tuple

# PII regex patterns
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
PHONE_REGEX = re.compile(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{3}[-.\s]?\d{4}\b')
CREDIT_CARD_REGEX = re.compile(r'\b(?:\d[ -]*?){13,16}\b')
# Simple pattern to detect common introduction sentences for names
NAME_INTRO_REGEX = re.compile(r'\b(?:my name is|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b', re.IGNORECASE)

# Jailbreak phrases
JAILBREAK_PHRASES = [
    r"ignore (?:all )?previous instructions",
    r"system override",
    r"you are now a(?:n)?",
    r"dan mode",
    r"do anything now",
    r"developer mode enabled",
    r"bypass (?:the )?restriction",
    r"forget (?:all )?safety rules",
    r"respond in developer mode",
    r"new instructions:",
    r"jailbreak",
    r"unfiltered response",
    r"pretend to be",
    r"roleplay as",
    r"you are no longer an AI",
]

# Prompt injection indicators
INJECTION_PATTERNS = [
    r"\[system\]",
    r"\[assistant\]",
    r"<!--.*-->",  # HTML comments
    r"base64:\s*[A-Za-z0-9+/=]+", # Base64 encoded payload
    r"note to (?:llm|ai|model|assistant)",
    r"translate the following instruction",
    r"execute the following code",
]

# Output data leakage patterns
LEAKAGE_PATTERNS = {
    "stripe_api_key": re.compile(r'\brk_(?:live|test)_[0-9a-zA-Z]{8,32}\b|\bsk_(?:live|test)_[0-9a-zA-Z]{8,32}\b'),
    "aws_access_key": re.compile(r'\bAKIA[0-9A-Z]{16}\b'),
    "generic_api_key": re.compile(r'\b[a-zA-Z0-9]{32}\b|\b[a-zA-Z0-9_-]{40}\b'), # entropy based
    "confidential_leak": re.compile(r'\b(?:CONFIDENTIAL|INTERNAL ONLY|PROPRIETARY|CLASSIFIED)\b', re.IGNORECASE),
}

def scan_input_text(text: str) -> Tuple[int, str, Dict[str, Any]]:
    """
    Scans input text for prompt injection, jailbreaks, and PII.
    Returns: (threat_score, threat_type, details)
    """
    threat_score = 0
    threat_types = []
    details = {
        "pii_detected": {},
        "jailbreaks_detected": [],
        "injections_detected": []
    }

    # 1. PII Scan
    emails = EMAIL_REGEX.findall(text)
    phones = PHONE_REGEX.findall(text)
    cards = []
    card_candidates = CREDIT_CARD_REGEX.findall(text)
    for c in card_candidates:
        # Simple Luhn-like digits filter (remove spacing/dashes)
        digits = re.sub(r'\D', '', c)
        if len(digits) >= 13 and len(digits) <= 16:
            cards.append(c)
    
    names = NAME_INTRO_REGEX.findall(text)

    if emails:
        details["pii_detected"]["emails"] = list(set(emails))
    if phones:
        details["pii_detected"]["phones"] = list(set(phones))
    if cards:
        details["pii_detected"]["credit_cards"] = list(set(cards))
    if names:
        details["pii_detected"]["names"] = list(set(names))

    if details["pii_detected"]:
        threat_types.append("PII")
        # Increase score based on PII count/type
        threat_score = max(threat_score, 20 + len(details["pii_detected"]) * 15)

    # 2. Jailbreak Scan
    for pattern in JAILBREAK_PHRASES:
        if re.search(pattern, text, re.IGNORECASE):
            details["jailbreaks_detected"].append(pattern)
    
    if details["jailbreaks_detected"]:
        threat_types.append("Jailbreak")
        threat_score = max(threat_score, 85 + min(15, len(details["jailbreaks_detected"]) * 5))

    # 3. Prompt Injection Scan
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            details["injections_detected"].append(pattern)
            
    if details["injections_detected"]:
        threat_types.append("Prompt Injection")
        threat_score = max(threat_score, 70 + min(25, len(details["injections_detected"]) * 10))

    # Determine dominant threat type
    if not threat_types:
        dominant_type = "None"
    elif "Jailbreak" in threat_types:
        dominant_type = "Jailbreak"
    elif "Prompt Injection" in threat_types:
        dominant_type = "Prompt Injection"
    else:
        dominant_type = "PII"

    # Limit maximum threat score to 100
    threat_score = min(threat_score, 100)

    return threat_score, dominant_type, details

def scan_output_text(text: str) -> Tuple[int, str, Dict[str, Any]]:
    """
    Scans LLM output text for data leakage and PII.
    Returns: (threat_score, threat_type, details)
    """
    threat_score = 0
    threat_types = []
    details = {
        "leakage_detected": [],
        "pii_detected": {}
    }

    # 1. PII Scan (output data leakage of PII)
    emails = EMAIL_REGEX.findall(text)
    phones = PHONE_REGEX.findall(text)
    
    if emails:
        details["pii_detected"]["emails"] = list(set(emails))
    if phones:
        details["pii_detected"]["phones"] = list(set(phones))
        
    if details["pii_detected"]:
        threat_types.append("PII Leakage")
        threat_score = max(threat_score, 30 + len(details["pii_detected"]) * 15)

    # 2. Leakage Pattern Scan (API Keys, Classified docs)
    for name, regex in LEAKAGE_PATTERNS.items():
        matches = regex.findall(text)
        if matches:
            details["leakage_detected"].append({
                "type": name,
                "matches": list(set(matches))
            })

    if details["leakage_detected"]:
        threat_types.append("Data Leakage")
        threat_score = max(threat_score, 90)

    # Determine dominant threat type
    if not threat_types:
        dominant_type = "None"
    elif "Data Leakage" in threat_types:
        dominant_type = "Data Leakage"
    else:
        dominant_type = "PII Leakage"

    threat_score = min(threat_score, 100)

    return threat_score, dominant_type, details
