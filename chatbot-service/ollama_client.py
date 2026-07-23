from groq import Groq
import os

class GroqClient:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('GROQ_API_KEY')
        self.client = Groq(api_key=self.api_key)
        self.model = 'llama-3.3-70b-versatile'
    
    def generate(self, prompt, system_prompt=None, temperature=0.7, max_tokens=500):
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            print(f"Groq error: {e}")
            return f"Error generating response: {str(e)}"
    
    def check_health(self):
        try:
            self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "hi"}],
                max_tokens=5
            )
            return True
        except:
            return False

groq_client = None

def get_ollama_client():
    global groq_client
    if groq_client is None:
        groq_client = GroqClient()
    return groq_client
