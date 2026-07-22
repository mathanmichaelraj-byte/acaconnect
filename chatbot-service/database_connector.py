import pymongo
from datetime import datetime
from typing import Dict, List
import json
import os

class DatabaseConnector:
    def __init__(self, mongo_uri: str = None):
        mongo_uri = mongo_uri or os.getenv('MONGODB_URI', 'mongodb://localhost:27017/college_events')
        self.client = pymongo.MongoClient(mongo_uri)
        self.db = self.client.college_events
        
    def get_all_events(self) -> List[Dict]:
        """Get all published events"""
        events = list(self.db.events.find({"status": "PUBLISHED"}))
        for event in events:
            event['_id'] = str(event['_id'])
        return events
    
    def get_event_registrations(self, event_id: str = None) -> List[Dict]:
        """Get registration data"""
        query = {}
        if event_id:
            query['event_id'] = event_id
            
        registrations = list(self.db.registrations.find(query))
        for reg in registrations:
            reg['_id'] = str(reg['_id'])
        return registrations
    
    def get_participants_count(self) -> int:
        """Get total participants count"""
        return self.db.participants.count_documents({"isVerified": True})
    
    def get_event_stats(self) -> Dict:
        """Get comprehensive event statistics"""
        stats = {
            "total_events": self.db.events.count_documents({"status": "PUBLISHED"}),
            "total_participants": self.get_participants_count(),
            "total_registrations": self.db.registrations.count_documents({}),
            "events_by_type": {},
            "upcoming_events": []
        }
        
        # Events by type
        pipeline = [
            {"$match": {"status": "PUBLISHED"}},
            {"$group": {"_id": "$event_type", "count": {"$sum": 1}}}
        ]
        for result in self.db.events.aggregate(pipeline):
            stats["events_by_type"][result["_id"]] = result["count"]
        
        # Upcoming events
        upcoming = list(self.db.events.find({
            "status": "PUBLISHED",
            "event_date": {"$gte": datetime.now()}
        }).sort("event_date", 1).limit(5))
        
        for event in upcoming:
            event['_id'] = str(event['_id'])
            stats["upcoming_events"].append({
                "title": event["title"],
                "date": event["event_date"].strftime("%Y-%m-%d"),
                "type": event.get("event_type", "Unknown")
            })
        
        return stats
    
    def format_events_for_context(self) -> str:
        """Format events data for chatbot context"""
        events = self.get_all_events()
        stats = self.get_event_stats()
        
        context = f"""
NIRAL 2026 EVENT INFORMATION:

STATISTICS:
- Total Events: {stats['total_events']}
- Total Registered Participants: {stats['total_participants']}
- Total Registrations: {stats['total_registrations']}

EVENTS BY TYPE:
"""
        for event_type, count in stats['events_by_type'].items():
            context += f"- {event_type}: {count} events\n"
        
        context += "\nDETAILED EVENT LIST:\n"
        
        for event in events:
            context += f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVENT: {event['title']}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: {event.get('type', 'Unknown')}
Date: {event.get('date', 'TBD')}
Duration: {event.get('duration_hours', 'TBD')} hours
PRIZE POOL: ₹{event.get('prize_pool', 0)}
REGISTRATION FEE: ₹{event.get('registration_fee', 0)}
Description: {event.get('description', 'No description')}
Expected Participants: {event.get('expected_participants', 'TBD')}

"""
        
        return context