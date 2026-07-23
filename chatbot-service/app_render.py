"""
Lightweight chatbot for Render deployment.
Uses Groq API for all responses, no local embeddings (saves ~400MB RAM).
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from dotenv import load_dotenv
load_dotenv()
from ollama_client import get_ollama_client
from database_connector import DatabaseConnector

app = Flask(__name__)
CORS(app)

# Load knowledge base
with open("data/niral_knowledge_simple.json", "r") as file:
    documents = json.load(file)

db_connector = DatabaseConnector(os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/college_events'))

def get_event_by_name(query):
    events = db_connector.get_all_events()
    query_lower = query.lower()
    aliases = {
        'dsa': 'DEBUGGING WITH DSA', 'debugging': 'DEBUGGING WITH DSA',
        'sql': 'SQL WAR', 'ui/ux': 'UI/UX DEVELOPMENT', 'uiux': 'UI/UX DEVELOPMENT',
        'treasure': 'TREASURE HUNT', 'anime': 'ANIME / CINEMA QUIZ',
        'cinema': 'ANIME / CINEMA QUIZ', 'ipl': 'IPL AUCTION', 'auction': 'IPL AUCTION',
        'adzap': 'ADZAP', 'photography': 'PHOTOGRAPHY CONTEST', 'photo': 'PHOTOGRAPHY CONTEST',
        'choreo': 'Choreo Night', 'dance': 'Choreo Night',
        'pitch': 'PITCH YOUR PROJECT CUM PRESENTATION', 'project': 'PITCH YOUR PROJECT CUM PRESENTATION',
        'presentation': 'PITCH YOUR PROJECT CUM PRESENTATION',
        'technical connections': 'TECHNICAL CONNECTIONS', 'connections': 'TECHNICAL CONNECTIONS',
        'quiz': 'Tech Quiz Challenge', 'tech quiz': 'Tech Quiz Challenge'
    }
    for alias, event_name in aliases.items():
        if alias in query_lower:
            for event in events:
                if event['title'] == event_name:
                    return event
    for event in events:
        if event['title'].lower() in query_lower:
            return event
    return None

def handle_greeting(query):
    greetings = ['hi', 'hello', 'hey', 'hii', 'helo']
    if query.lower().strip() in greetings:
        return "Hello! I'm NIRAL Assistant. Ask me about NIRAL 2026 events, registration, fees, or history."
    return None

def handle_event_list(query):
    query_lower = query.lower()
    events = db_connector.get_all_events()
    if 'technical event' in query_lower and 'non' not in query_lower:
        technical = [e for e in events if e.get('type') == 'Technical']
        if not technical: return "No technical events found."
        response = f"Here are {len(technical)} technical events:\n\n"
        for i, e in enumerate(technical, 1):
            response += f"{i}. {e['title']} - Rs.{e.get('prize_pool', 0):,} prize\n"
        return response
    elif 'non-technical event' in query_lower or 'non technical event' in query_lower:
        non_tech = [e for e in events if e.get('type') == 'Non-Technical']
        if not non_tech: return "No non-technical events found."
        response = f"Here are {len(non_tech)} non-technical events:\n\n"
        for i, e in enumerate(non_tech, 1):
            response += f"{i}. {e['title']} - Rs.{e.get('prize_pool', 0):,} prize\n"
        return response
    elif any(kw in query_lower for kw in ['all event', 'list event', 'events in niral', 'what event', 'which event', 'what are the event']):
        response = f"NIRAL 2026 has {len(events)} events:\n\n"
        tech = [e for e in events if e.get('type') == 'Technical']
        non_tech = [e for e in events if e.get('type') == 'Non-Technical']
        response += f"Technical ({len(tech)}):\n"
        for e in tech: response += f"  {e['title']}\n"
        response += f"\nNon-Technical ({len(non_tech)}):\n"
        for e in non_tech: response += f"  {e['title']}\n"
        return response
    return None

def build_event_context(event):
    context = f"Event: {event['title']}\nType: {event.get('type')}\nDescription: {event.get('description', '')}\n"
    context += f"Date: {str(event.get('date', 'TBD'))[:10]}\nTime: {event.get('time', 'TBD')}\n"
    context += f"Duration: {event.get('duration_hours', 'TBD')} hours\n"
    context += f"Prize Pool: Rs.{event.get('prize_pool', 0):,}\nRegistration Fee: Rs.{event.get('registration_fee', 0)}\n"
    context += f"Expected Participants: {event.get('expected_participants', 'TBD')}\n"
    context += f"Tags: {', '.join(event.get('tags', []))}\n"
    # Venue info
    hosp = event.get('hospitality', {})
    venue = event.get('venue') or hosp.get('venue_details', 'Not yet allocated')
    context += f"Venue: {venue}\n"
    if hosp.get('allocated_rooms'):
        rooms = [f"{r.get('room_number','')} ({r.get('room_name','')})" for r in hosp['allocated_rooms']]
        context += f"Rooms: {', '.join(rooms)}\n"
    # Volunteer info
    hr = event.get('hr', {})
    volunteers = hr.get('allocated_volunteers', [])
    if volunteers:
        vol_list = [f"{v.get('volunteer_name','')} - {v.get('volunteer_role','')} ({v.get('volunteer_department','')})" for v in volunteers]
        context += f"Volunteers: {', '.join(vol_list)}\n"
    else:
        context += "Volunteers: Not yet allocated\n"
    judges = hr.get('allocated_judges', [])
    if judges:
        judge_list = [f"{j.get('judge_name','')} ({j.get('judge_designation','')})" for j in judges]
        context += f"Judges: {', '.join(judge_list)}\n"
    return context

def handle_specific_event(query):
    event = get_event_by_name(query)
    if not event: return None
    context = build_event_context(event)
    prompt = f"Event data:\n{context}\n\nUser asked: \"{query}\"\n\nAnswer using ONLY the data above. Be friendly and concise."
    try:
        llm = get_ollama_client()
        return llm.generate(prompt=prompt, system_prompt="You are NIRAL Assistant. Answer in plain text, no markdown. Use ONLY provided data.", max_tokens=300)
    except:
        return context

def rag_chatbot(query):
    greeting = handle_greeting(query)
    if greeting: return greeting
    event_list = handle_event_list(query)
    if event_list: return event_list
    specific = handle_specific_event(query)
    if specific: return specific

    query_lower = query.lower()
    if any(kw in query_lower for kw in ['how many event', 'total event']):
        events = db_connector.get_all_events()
        tech = [e for e in events if e.get('type') == 'Technical']
        non_tech = [e for e in events if e.get('type') == 'Non-Technical']
        return f"NIRAL 2026 has {len(events)} events - {len(tech)} technical and {len(non_tech)} non-technical events."
    if 'latest edition' in query_lower or 'current edition' in query_lower:
        return "The latest edition is NIRAL 2026, organized by the Department of Information Science and Technology (IST), CEG, Anna University, Chennai."
    if any(kw in query_lower for kw in ['how many participant', 'how many registration', 'statistics']):
        stats = db_connector.get_event_stats()
        return f"NIRAL 2026 Statistics:\n  Total Events: {stats['total_events']}\n  Registered Participants: {stats['total_participants']}\n  Total Registrations: {stats['total_registrations']}"

    # Fallback to LLM with knowledge base
    context = "\n".join(list(documents.values())[:3])
    prompt = f"Context: {context}\n\nQuestion: {query}\n\nAnswer briefly using ONLY the context. If not found, say 'I don't have that information.'"
    try:
        llm = get_ollama_client()
        return llm.generate(prompt=prompt, system_prompt="You are NIRAL Assistant. Answer briefly in plain text.", max_tokens=300)
    except:
        return "I'm having trouble processing that. Please try asking about NIRAL events, registration, or history."

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "NIRAL Chatbot Service (Lite)"})

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_query = data.get('query', '').strip()
        if not user_query:
            return jsonify({"error": "No query provided"}), 400
        response = rag_chatbot(user_query)
        return jsonify({"success": True, "query": user_query, "response": response})
    except Exception as e:
        print(f"Chat error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": True, "query": data.get('query', ''), "response": "I'm having trouble processing that. Please try again."}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    print("=" * 60)
    print("NIRAL Chatbot Service (Lite) Starting...")
    print(f"Ready on http://0.0.0.0:{port}")
    print("=" * 60)
    app.run(host='0.0.0.0', port=port, debug=False)
