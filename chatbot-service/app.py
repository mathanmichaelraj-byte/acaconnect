from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
load_dotenv()
from ollama_client import get_ollama_client
from database_connector import DatabaseConnector

app = Flask(__name__)
CORS(app)

# Load knowledge base
with open("data/niral_knowledge_simple.json", "r") as file:
    documents = json.load(file)

doc_texts = list(documents.values())
doc_keys = list(documents.keys())

# Initialize models
embed_model = SentenceTransformer("all-MiniLM-L6-v2")
doc_embeddings = embed_model.encode(doc_texts)
db_connector = DatabaseConnector()

def retrieve_context(query, top_k=2):
    """Retrieve top-k most relevant contexts from simple JSON"""
    query_embedding = embed_model.encode([query])
    similarities = cosine_similarity(query_embedding, doc_embeddings)[0]
    top_indices = np.argsort(similarities)[::-1][:top_k]
    return [doc_texts[i] for i in top_indices]

def retrieve_pdf_context(query, top_k=3):
    """Retrieve context from PDF ChromaDB"""
    try:
        import chromadb
        client = chromadb.PersistentClient(path="./chroma_db")
        collection = client.get_collection(name="niral_knowledge")
        
        query_embedding = embed_model.encode([query]).tolist()
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=top_k,
            include=["documents", "metadatas"]
        )
        
        if results['documents'][0]:
            # Return just the documents without source tags
            return results['documents'][0]
        return []
    except Exception as e:
        print(f"PDF retrieval error: {e}")
        return []

def get_event_by_name(query):
    """Find event by name in query with fuzzy matching"""
    events = db_connector.get_all_events()
    query_lower = query.lower()
    
    # Event aliases for better matching
    aliases = {
        'dsa': 'DEBUGGING WITH DSA',
        'debugging': 'DEBUGGING WITH DSA',
        'sql': 'SQL WAR',
        'ui/ux': 'UI/UX DEVELOPMENT',
        'uiux': 'UI/UX DEVELOPMENT',
        'treasure': 'TREASURE HUNT',
        'anime': 'ANIME / CINEMA QUIZ',
        'cinema': 'ANIME / CINEMA QUIZ',
        'ipl': 'IPL AUCTION',
        'auction': 'IPL AUCTION',
        'adzap': 'ADZAP',
        'photography': 'PHOTOGRAPHY CONTEST',
        'photo': 'PHOTOGRAPHY CONTEST',
        'choreo': 'Choreo Night',
        'dance': 'Choreo Night',
        'pitch': 'PITCH YOUR PROJECT CUM PRESENTATION',
        'project': 'PITCH YOUR PROJECT CUM PRESENTATION',
        'presentation': 'PITCH YOUR PROJECT CUM PRESENTATION',
        'technical connections': 'TECHNICAL CONNECTIONS',
        'connections': 'TECHNICAL CONNECTIONS',
        'quiz': 'Tech Quiz Challenge',
        'tech quiz': 'Tech Quiz Challenge'
    }
    
    # Check aliases first
    for alias, event_name in aliases.items():
        if alias in query_lower:
            for event in events:
                if event['title'] == event_name:
                    return event
    
    # Check full event title match
    for event in events:
        if event['title'].lower() in query_lower:
            return event
    
    return None

def handle_greeting(query):
    """Handle simple greetings"""
    greetings = ['hi', 'hello', 'hey', 'hii', 'helo']
    if query.lower().strip() in greetings:
        return "Hello! I'm NIRAL Assistant. Ask me about NIRAL 2026 events, registration, fees, or history."
    return None

def handle_event_list(query):
    """Handle event listing queries"""
    query_lower = query.lower()
    events = db_connector.get_all_events()
    
    if 'technical event' in query_lower and 'non' not in query_lower:
        technical = [e for e in events if e.get('type') == 'Technical']
        if not technical:
            return "No technical events found."
        
        response = f"Here are {len(technical)} technical events:\n\n"
        for i, e in enumerate(technical, 1):
            response += f"{i}. {e['title']} - Rs.{e.get('prize_pool', 0):,} prize\n"
        return response
    
    elif 'non-technical event' in query_lower or 'non technical event' in query_lower or ('show' in query_lower and 'non' in query_lower):
        non_tech = [e for e in events if e.get('type') == 'Non-Technical']
        if not non_tech:
            return "No non-technical events found."
        
        response = f"Here are {len(non_tech)} non-technical events:\n\n"
        for i, e in enumerate(non_tech, 1):
            response += f"{i}. {e['title']} - Rs.{e.get('prize_pool', 0):,} prize\n"
        return response
    
    elif 'all event' in query_lower or 'list event' in query_lower or 'events in niral' in query_lower or 'what event' in query_lower or 'which event' in query_lower or 'what are the event' in query_lower:
        response = f"NIRAL 2026 has {len(events)} events:\n\n"
        tech = [e for e in events if e.get('type') == 'Technical']
        non_tech = [e for e in events if e.get('type') == 'Non-Technical']
        
        response += f"Technical ({len(tech)}):\n"
        for e in tech:
            response += f"• {e['title']}\n"
        
        response += f"\nNon-Technical ({len(non_tech)}):\n"
        for e in non_tech:
            response += f"• {e['title']}\n"
        
        return response
    
    return None

def build_event_context(event):
    """Build a complete context string from all DB fields for an event"""
    hosp = event.get('hospitality', {})
    hr = event.get('hr', {})
    prize_dist = event.get('prize_distribution', {})
    venue = event.get('venue') or hosp.get('venue_details', 'Not yet allocated')
    
    context = f"Event: {event['title']}\n"
    context += f"Type: {event.get('type')}\n"
    context += f"Description: {event.get('description', '')}\n"
    context += f"Date: {str(event.get('date', 'TBD'))[:10]}\n"
    context += f"Time: {event.get('time', 'TBD')}\n"
    context += f"Duration: {event.get('duration_hours', 'TBD')} hours\n"
    context += f"Venue: {venue}\n"
    context += f"Prize Pool: Rs.{event.get('prize_pool', 0):,}\n"
    context += f"Registration Fee: Rs.{event.get('registration_fee', 0)}\n"
    context += f"Expected Participants: {event.get('expected_participants', 'TBD')}\n"
    
    if prize_dist:
        if prize_dist.get('first'): context += f"1st Prize: Rs.{prize_dist['first']:,}\n"
        if prize_dist.get('second'): context += f"2nd Prize: Rs.{prize_dist['second']:,}\n"
        if prize_dist.get('third'): context += f"3rd Prize: Rs.{prize_dist['third']:,}\n"
    
    if hosp.get('allocated_rooms'):
        rooms = [f"{r.get('room_number','')} ({r.get('room_name','')})" for r in hosp['allocated_rooms']]
        context += f"Rooms: {', '.join(rooms)}\n"
    if hosp.get('lab_allocated'):
        context += f"Labs: {hosp['lab_allocated']}\n"
    
    volunteers = hr.get('allocated_volunteers', [])
    if volunteers:
        vol_list = [f"{v.get('volunteer_name','')} from {v.get('volunteer_department','')}" for v in volunteers]
        context += f"Volunteers: {', '.join(vol_list)}\n"
    
    judges = hr.get('allocated_judges', [])
    if judges:
        judge_list = [f"{j.get('judge_name','')} ({j.get('judge_designation','')})" for j in judges]
        context += f"Judges: {', '.join(judge_list)}\n"
    
    context += f"Tags: {', '.join(event.get('tags', []))}\n"
    return context

def handle_specific_event(query):
    """Handle specific event queries using DB data + Groq for fluent responses"""
    event = get_event_by_name(query)
    if not event:
        return None
    
    query_lower = query.lower()
    
    # Rules query - use PDF context
    rule_patterns = ['rule', 'regulation', 'how to play', 'how to participate', 'format', 'guideline', 'what are the rules']
    if any(pattern in query_lower for pattern in rule_patterns):
        event_title = event['title']
        search_terms = [event_title, event_title.upper(), event_title.split()[0], f"{event_title} rules format"]
        
        for term in search_terms:
            pdf_contexts = retrieve_pdf_context(term, top_k=5)
            if pdf_contexts:
                relevant_contexts = [ctx for ctx in pdf_contexts if event_title.lower() in ctx.lower() or any(w in ctx.lower() for w in ['rule', 'format', 'round', 'eligibility', 'judging'])]
                if relevant_contexts:
                    prompt = f"""Here are the rules for {event_title}:

{' '.join(relevant_contexts[:3])}

User asked: {query}

Present the rules in a clear, friendly way."""
                    try:
                        llm = get_ollama_client()
                        return llm.generate(prompt=prompt, system_prompt="You are NIRAL Assistant. Answer in a friendly, conversational tone. Use plain text, no markdown. Keep it concise.")
                    except:
                        return "Rules for " + event_title + ":\n\n" + "\n\n".join(relevant_contexts[:3])
        
        context = build_event_context(event)
        context += "\nNote: Specific rules will be shared with registered participants. General rules apply to all events."
        prompt = f"""Event data:\n{context}\n\nUser asked: {query}\n\nAnswer naturally."""
        try:
            llm = get_ollama_client()
            return llm.generate(prompt=prompt, system_prompt="You are NIRAL Assistant. Answer in a friendly tone using ONLY the data provided. No markdown.")
        except:
            return context
    
    # For all other queries - use DB data + Groq
    context = build_event_context(event)
    prompt = f"""Here is the complete event data from our database:

{context}

User asked: "{query}"

Answer the user's specific question using ONLY the data above. Be friendly and conversational. Do not add any information not present in the data."""
    
    try:
        llm = get_ollama_client()
        return llm.generate(
            prompt=prompt,
            system_prompt="You are NIRAL Assistant, a friendly chatbot for NIRAL 2026 technical symposium. Answer naturally in a conversational tone. Use ONLY the provided data. Do not use markdown formatting like ** or #. Keep responses concise.",
            max_tokens=300
        )
    except:
        # Fallback to raw data if Groq fails
        return context

def rag_chatbot(query):
    """Main RAG chatbot function"""
    # Check for direct handlers first (rule-based for database)
    greeting_response = handle_greeting(query)
    if greeting_response:
        return greeting_response
    
    event_list_response = handle_event_list(query)
    if event_list_response:
        return event_list_response
    
    specific_event_response = handle_specific_event(query)
    if specific_event_response:
        return specific_event_response
    
    # Check if query is about database facts (dates, venues, etc.)
    query_lower = query.lower()
    database_keywords = ['when is', 'date of', 'venue', 'location', 'where is', 'how many participant', 'how many registration', 'how many event', 'is niral free', 'what prize', 'statistics', 'latest edition', 'current edition', 'this year', 'which edition']
    
    if any(keyword in query_lower for keyword in database_keywords):
        # Handle latest edition query
        if 'latest edition' in query_lower or 'current edition' in query_lower or 'which edition' in query_lower:
            return "The latest edition is NIRAL 2026, organized by the Department of Information Science and Technology (IST), CEG, Anna University, Chennai."
        
        # Handle date queries
        if 'when' in query_lower or 'date' in query_lower:
            return "NIRAL 2026 events are scheduled from February to March 2026. Specific event dates:\n\n" + handle_event_list('list all events')
        
        # Handle venue queries
        if 'venue' in query_lower or 'where' in query_lower or 'location' in query_lower:
            return "NIRAL 2026 is held at College of Engineering Guindy (CEG), Anna University, Chennai."
        
        # Handle event count
        if 'how many event' in query_lower:
            events = db_connector.get_all_events()
            tech = [e for e in events if e.get('type') == 'Technical']
            non_tech = [e for e in events if e.get('type') == 'Non-Technical']
            return f"NIRAL 2026 has {len(events)} events - {len(tech)} technical and {len(non_tech)} non-technical events."
        
        # Handle free events query
        if 'free' in query_lower:
            events = db_connector.get_all_events()
            free_events = [e for e in events if e.get('registration_fee', 0) == 0]
            paid_events = [e for e in events if e.get('registration_fee', 0) > 0]
            response = f"NIRAL has both free and paid events:\n\n"
            response += f"FREE Events ({len(free_events)}):\n"
            for e in free_events:
                response += f"  - {e['title']}\n"
            response += f"\nPaid Events ({len(paid_events)}): Registration fees range from Rs.50 to Rs.200"
            return response
        
        # Handle prize query
        if 'prize' in query_lower and 'win' in query_lower:
            return "NIRAL events offer prizes ranging from Rs.5,000 to Rs.30,000 for winners. Check individual event details for specific prize amounts."
        
        # Handle statistics
        if 'how many participant' in query_lower or 'how many registration' in query_lower:
            stats = db_connector.get_event_stats()
            return f"NIRAL 2026 Statistics:\n  Total Events: {stats['total_events']}\n  Registered Participants: {stats['total_participants']}\n  Total Registrations: {stats['total_registrations']}"
    
    # Handle rules query - prioritize PDF content
    if 'rule' in query_lower:
        event = get_event_by_name(query)
        if event:
            # Try multiple search terms for event-specific rules
            event_title = event['title']
            search_terms = [
                f"{event_title} rules",
                f"{event_title} regulations",
                f"{event_title} format",
                event_title
            ]
            
            # Try each search term
            for term in search_terms:
                pdf_contexts = retrieve_pdf_context(term, top_k=2)
                if pdf_contexts:
                    # Check if content is relevant (contains event name or rules keywords)
                    combined = " ".join(pdf_contexts).lower()
                    if event_title.lower() in combined or any(word in combined for word in ['rule', 'format', 'round', 'judging', 'criteria']):
                        response = f"Rules for {event_title}:\n\n"
                        for ctx in pdf_contexts:
                            response += ctx + "\n\n"
                        return response
        
        # Try general rules from PDF
        pdf_contexts = retrieve_pdf_context("general rules regulations all events", top_k=2)
        if pdf_contexts:
            return "General NIRAL Event Rules:\n\n" + "\n\n".join(pdf_contexts)
        
        # Fallback to basic rules
        return "General NIRAL Event Rules:\n  - Participants must bring college ID\n  - Judges' decisions are final\n  - Misconduct leads to disqualification\n  - Organizers reserve the right to modify rules\n  - Check specific event details for team/individual participation"
    
    # Handle history query - use PDF content with LLM processing
    if any(word in query_lower for word in ['history', 'started', 'founded', 'began', 'origin', 'first niral', 'when was niral']):
        pdf_contexts = retrieve_pdf_context("NIRAL history evolution started founded", top_k=3)
        if pdf_contexts:
            prompt = f"""Answer this question using ONLY the context below. Be specific and concise.

Context: {" ".join(pdf_contexts)}

Question: {query}

Provide a clear, direct answer in 2-3 sentences."""
            
            try:
                llm = get_ollama_client()
                return llm.generate(
                    prompt=prompt,
                    system_prompt="You are NIRAL Assistant. Answer briefly and accurately using plain text without markdown formatting."
                )
            except:
                return "NIRAL began in the early 2010s as a student-driven initiative by the MCA students of the Department of Information Science and Technology (IST), College of Engineering Guindy (CEG), Anna University, Chennai."
    
    # Use LLM for other PDF content queries
    # Use LLM for general queries with simple JSON context
    context = retrieve_context(query, top_k=2)
    
    prompt = f"""You are NIRAL Assistant. Answer using ONLY the context below.

Context: {" ".join(context)}

Question: {query}

IMPORTANT: 
- Answer ONLY from the context provided
- Be brief (2-3 sentences max)
- If context doesn't answer the question, say "I don't have that information. Please contact NIRAL coordinators."
- Do NOT make up dates, numbers, or event names
"""
    
    try:
        llm = get_ollama_client()
        return llm.generate(
            prompt=prompt,
            system_prompt="You are NIRAL Assistant. Answer briefly using plain text without markdown. Never make up information."
        )
    except Exception as e:
        return "I'm having trouble processing that. Please try asking about NIRAL events, registration, or history."

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "NIRAL Chatbot Service"
    })

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_query = data.get('query', '').strip()
        
        if not user_query:
            return jsonify({"error": "No query provided"}), 400
        
        response = rag_chatbot(user_query)
        
        return jsonify({
            "success": True,
            "query": user_query,
            "response": response
        })
    
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to process chat request"
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("NIRAL Chatbot Service Starting...")
    print("=" * 60)
    print("Chatbot service ready on http://localhost:5002")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5002, debug=False)
