"""
openai_client.py
────────────────
Shared OpenAI helper used by all chat pages.
"""
import os
import streamlit as st
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


@st.cache_resource(show_spinner=False)
def get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        st.error(
            "⚠️ **OPENAI_API_KEY** not found. "
            "Create a `.env` file in the `backend/` folder and add your key.",
            icon="🔑",
        )
        st.stop()
    return OpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
    )


def chat(
    system_prompt: str,
    history: list[dict],
    model: str = "openai/gpt-4o",
    temperature: float = 0.5,
    max_tokens: int = 1500,
) -> str:
    """Send a chat completion request and return the assistant reply."""
    client = get_client()
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": system_prompt}] + history,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content
