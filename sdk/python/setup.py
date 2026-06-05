from setuptools import setup, find_packages

setup(
    name="promptarmor",
    version="1.0.0",
    description="Official Python SDK for PromptArmor LLM Security platform",
    long_description=open("README.md").read() if open("README.md") else "PromptArmor Python SDK",
    long_description_content_type="text/markdown",
    author="PromptArmor Security Team",
    packages=find_packages(),
    python_requires=">=3.7",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
