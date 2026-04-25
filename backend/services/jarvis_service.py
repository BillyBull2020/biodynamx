"""
Jarvis Executive Assistant
======================
Elite AI assistant with business memory for EmpireOS
"""

import os
import json
import sqlite3
from datetime import datetime
from typing import Dict, Any, List, Optional
from flask import current_app
from backend.services.llm_service import get_provider, chat_with_fallback, AVAILABLE_MODELS


# Jarvis system prompt - elite executive operator persona
JARVIS_SYSTEM_PROMPT = """You are JARVIS - Elite Executive Operator, Strategist, Closer, and AI Assistant for AI Expert Solutions / BioDynamX.

Your role is to help the owner (Billy De La Taurus) make money FAST by:
1. Strategic planning and day prioritization
2. Writing high-converting sales copy and offers
3. Managing follow-ups and closing deals
4. Identifying ROI opportunities
5. Coordinating agent team workflows

Personality:
- Elite operator mindset - focused on results and revenue
- Strategic thinker - always look for the fastest path to money
- Direct and action-oriented
- Professional but real - not robotic
- Use proven frameworks for sales, marketing, and operations

Business Context:
- AI automation business (AIExpertSolutions)
- BioDynamX brand
- Roofing/construction marketing (Denver market)
- Local business lead generation
- Client fulfillment and AI employee deployments

Current Capabilities:
- Multi-agent team (Sales, Marketing, Research, Builder, Operations, Client Success, Finance, Legal, Roofing, AI Employee)
- Lead pipeline with full management
- Client profiles and workflows
- Executive dashboard

Response Style:
- Be direct and actionable
- Provide specific steps, not just advice
- Include ROI reasoning in recommendations
- Use numbers and metrics when possible
- Stay focused on making money

Remember: Your goal is to help Billy make money. Every response should drive toward revenue."""


def get_memory_context() -> str:
    """Get business memory context from database"""
    try:
        from database import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        # Get recent tasks
        cursor.execute("""
            SELECT title, status, priority, deadline 
            FROM tasks 
            ORDER BY created_at DESC LIMIT 5
        """)
        tasks = cursor.fetchall()
        
        # Get recent leads
        cursor.execute("""
            SELECT name, company, status, next_follow_up 
            FROM leads 
            ORDER BY created_at DESC LIMIT 5
        """)
        leads = cursor.fetchall()
        
        # Get recent clients
        cursor.execute("""
            SELECT business_name, industry, status 
            FROM clients 
            ORDER BY created_at DESC LIMIT 3
        """)
        clients = cursor.fetchall()
        
        # Get recent decisions
        cursor.execute("""
            SELECT content 
            FROM memory 
            WHERE type = 'decision' 
            ORDER BY created_at DESC LIMIT 5
        """)
        decisions = cursor.fetchall()
        
        # Build context
        context = "\n\n## Recent Business Context\n"
        
        if tasks:
            context += "\n### Recent Tasks\n"
            for task in tasks:
                context += f"- [{task[1]}] {task[0]} (Priority: {task[2]}, Due: {task[3] or 'N/A'})\n"
        
        if leads:
            context += "\n### Recent Leads\n"
            for lead in leads:
                context += f"- {lead[0]} @ {lead[1] or 'N/A'} - {lead[2]} (Follow-up: {lead[3] or 'N/A'})\n"
        
        if clients:
            context += "\n### Recent Clients\n"
            for client in clients:
                context += f"- {client[0]} ({client[1]}) - {client[2]}\n"
        
        if decisions:
            context += "\n### Recent Decisions\n"
            for decision in decisions:
                context += f"- {decision[0]}\n"
        
        return context
        
    except Exception as e:
        return f"\n\n## Note\n(Unable to load business context: {str(e)})"


def chat_with_jarvis(user_message: str, provider: str = None) -> Dict[str, Any]:
    """Send message to Jarvis AI"""
    
    # Build messages
    messages = [
        {"role": "system", "content": JARVIS_SYSTEM_PROMPT + get_memory_context()}
    ]
    
    # Add user message
    messages.append({"role": "user", "content": user_message})
    
    # Try primary provider first, then fallback
    result = chat_with_fallback(messages, preferred_provider=provider)
    
    if result.get("success"):
        # Save to chat history
        try:
            from database import get_db
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO chat_history (user_message, ai_response, provider)
                VALUES (?, ?, ?)
            """, (user_message, result.get("content", ""), result.get("provider", "unknown")))
            conn.commit()
        except:
            pass  # Don't fail if we can't save history
    
    return result


def get_chat_history(limit: int = 20) -> List[Dict[str, Any]]:
    """Get chat history"""
    try:
        from database import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, user_message, ai_response, provider, created_at
            FROM chat_history
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        
        return [
            {
                "id": row[0],
                "user_message": row[1],
                "ai_response": row[2],
                "provider": row[3],
                "created_at": row[4]
            }
            for row in rows
        ]
        
    except Exception as e:
        return []


def save_to_memory(content: str, memo_type: str = "note", title: str = None) -> bool:
    """Save important info to memory"""
    try:
        from database import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO memory (type, title, content)
            VALUES (?, ?, ?)
        """, (memo_type, title or content[:50], content))
        
        conn.commit()
        return True
        
    except Exception as e:
        print(f"Error saving to memory: {e}")
        return False


def get_memory(memo_type: str = None, limit: int = 20) -> List[Dict[str, Any]]:
    """Get memory entries"""
    try:
        from database import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        if memo_type:
            cursor.execute("""
                SELECT id, type, title, content, created_at
                FROM memory
                WHERE type = ?
                ORDER BY created_at DESC
                LIMIT ?
            """, (memo_type, limit))
        else:
            cursor.execute("""
                SELECT id, type, title, content, created_at
                FROM memory
                ORDER BY created_at DESC
                LIMIT ?
            """, (limit,))
        
        rows = cursor.fetchall()
        
        return [
            {
                "id": row[0],
                "type": row[1],
                "title": row[2],
                "content": row[3],
                "created_at": row[4]
            }
            for row in rows
        ]
        
    except Exception as e:
        return []