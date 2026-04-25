"""
Flask Blueprint for EmpireOS API
"""

import os
import json
from flask import Blueprint, request, jsonify, g

# Initialize database
from database import init_db, get_db, get_setting, set_setting

api = Blueprint('api', __name__)


@api.before_request
def before_request():
    """Initialize database on first request"""
    g.db = get_db()


@api.route('/')
def index():
    """Main dashboard"""
    return jsonify({
        "name": "EmpireOS",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "/api/jarvis/chat",
            "/api/jarvis/history",
            "/api/providers/status",
            "/api/providers/test",
            "/api/clients",
            "/api/leads",
            "/api/tasks",
            "/api/agents",
            "/api/workflows",
            "/api/settings",
            "/api/memory",
            "/api/dashboard",
        ]
    })


# =====================
# JARVIS ENDPOINTS
# =====================

@api.route('/jarvis/chat', methods=['POST'])
def jarvis_chat():
    """Chat with Jarvis AI"""
    from backend.services.jarvis_service import chat_with_jarvis
    
    data = request.get_json()
    message = data.get('message', '')
    provider = data.get('provider')
    
    if not message:
        return jsonify({"error": "Message required"}), 400
    
    result = chat_with_jarvis(message, provider)
    
    return jsonify(result)


@api.route('/jarvis/history')
def jarvis_history():
    """Get chat history"""
    from backend.services.jarvis_service import get_chat_history
    
    limit = request.args.get('limit', 20, type=int)
    history = get_chat_history(limit)
    
    return jsonify(history)


# =====================
# PROVIDER ENDPOINTS
# =====================

@api.route('/providers/status')
def provider_status():
    """Get status of all providers"""
    from backend.services.llm_service import get_provider_status
    
    status = get_provider_status()
    return jsonify(status)


@api.route('/providers/test', methods=['POST'])
def test_provider():
    """Test a specific provider"""
    from backend.services.llm_service import get_provider, AVAILABLE_MODELS
    
    data = request.get_json()
    provider_name = data.get('provider', 'ollama')
    model = data.get('model')
    
    try:
        provider = get_provider(provider_name)
        result = provider.test_connection()
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@api.route('/models')
def list_models():
    """List all available models"""
    from backend.services.llm_service import AVAILABLE_MODELS
    
    return jsonify(AVAILABLE_MODELS)


# =====================
# CLIENT ENDPOINTS
# =====================

@api.route('/clients', methods=['GET'])
def get_clients():
    """Get all clients"""
    cursor = g.db.cursor()
    cursor.execute("""
        SELECT id, business_name, industry, contact_name, email, phone, 
               website, goals, pain_points, status, created_at
        FROM clients
        ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()
    
    clients = []
    for row in rows:
        clients.append({
            "id": row[0],
            "business_name": row[1],
            "industry": row[2],
            "contact_name": row[3],
            "email": row[4],
            "phone": row[5],
            "website": row[6],
            "goals": row[7],
            "pain_points": row[8],
            "status": row[9],
            "created_at": row[10]
        })
    
    return jsonify(clients)


@api.route('/clients', methods=['POST'])
def create_client():
    """Create a new client"""
    data = request.get_json()
    
    cursor = g.db.cursor()
    cursor.execute("""
        INSERT INTO clients (business_name, industry, contact_name, email, phone, 
                        website, goals, pain_points, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get('business_name'),
        data.get('industry'),
        data.get('contact_name'),
        data.get('email'),
        data.get('phone'),
        data.get('website'),
        data.get('goals'),
        data.get('pain_points'),
        data.get('notes'),
        data.get('status', 'active')
    ))
    
    g.db.commit()
    client_id = cursor.lastrowid
    
    return jsonify({"id": client_id, "success": True})


@api.route('/clients/<int:client_id>', methods=['GET'])
def get_client(client_id):
    """Get a specific client"""
    cursor = g.db.cursor()
    cursor.execute("SELECT * FROM clients WHERE id = ?", (client_id,))
    row = cursor.fetchone()
    
    if not row:
        return jsonify({"error": "Client not found"}), 404
    
    return jsonify(dict(row))


@api.route('/clients/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    """Update a client"""
    data = request.get_json()
    
    cursor = g.db.cursor()
    cursor.execute("""
        UPDATE clients
        SET business_name = COALESCE(?, business_name),
            industry = COALESCE(?, industry),
            contact_name = COALESCE(?, contact_name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            website = COALESCE(?, website),
            goals = COALESCE(?, goals),
            pain_points = COALESCE(?, pain_points),
            notes = COALESCE(?, notes),
            status = COALESCE(?, status),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (
        data.get('business_name'),
        data.get('industry'),
        data.get('contact_name'),
        data.get('email'),
        data.get('phone'),
        data.get('website'),
        data.get('goals'),
        data.get('pain_points'),
        data.get('notes'),
        data.get('status'),
        client_id
    ))
    
    g.db.commit()
    
    return jsonify({"success": True})


@api.route('/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    """Delete a client"""
    cursor = g.db.cursor()
    cursor.execute("DELETE FROM clients WHERE id = ?", (client_id,))
    g.db.commit()
    
    return jsonify({"success": True})


# =====================
# LEAD ENDPOINTS
# =====================

@api.route('/leads', methods=['GET'])
def get_leads():
    """Get all leads"""
    status = request.args.get('status')
    
    cursor = g.db.cursor()
    if status:
        cursor.execute("""
            SELECT id, name, company, phone, email, industry, city, 
                   status, source, notes, next_follow_up, created_at
            FROM leads
            WHERE status = ?
            ORDER BY created_at DESC
        """, (status,))
    else:
        cursor.execute("""
            SELECT id, name, company, phone, email, industry, city, 
                   status, source, notes, next_follow_up, created_at
            FROM leads
            ORDER BY created_at DESC
        """)
    
    rows = cursor.fetchall()
    
    leads = []
    for row in rows:
        leads.append({
            "id": row[0],
            "name": row[1],
            "company": row[2],
            "phone": row[3],
            "email": row[4],
            "industry": row[5],
            "city": row[6],
            "status": row[7],
            "source": row[8],
            "notes": row[9],
            "next_follow_up": row[10],
            "created_at": row[11]
        })
    
    return jsonify(leads)


@api.route('/leads', methods=['POST'])
def create_lead():
    """Create a new lead"""
    data = request.get_json()
    
    cursor = g.db.cursor()
    cursor.execute("""
        INSERT INTO leads (name, company, phone, email, industry, city, 
                      status, source, notes, next_follow_up)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get('name'),
        data.get('company'),
        data.get('phone'),
        data.get('email'),
        data.get('industry'),
        data.get('city'),
        data.get('status', 'new'),
        data.get('source'),
        data.get('notes'),
        data.get('next_follow_up')
    ))
    
    g.db.commit()
    lead_id = cursor.lastrowid
    
    return jsonify({"id": lead_id, "success": True})


@api.route('/leads/<int:lead_id>', methods=['PUT'])
def update_lead(lead_id):
    """Update a lead"""
    data = request.get_json()
    
    cursor = g.db.cursor()
    cursor.execute("""
        UPDATE leads
        SET name = COALESCE(?, name),
            company = COALESCE(?, company),
            phone = COALESCE(?, phone),
            email = COALESCE(?, email),
            industry = COALESCE(?, industry),
            city = COALESCE(?, city),
            status = COALESCE(?, status),
            source = COALESCE(?, source),
            notes = COALESCE(?, notes),
            next_follow_up = COALESCE(?, next_follow_up),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (
        data.get('name'),
        data.get('company'),
        data.get('phone'),
        data.get('email'),
        data.get('industry'),
        data.get('city'),
        data.get('status'),
        data.get('source'),
        data.get('notes'),
        data.get('next_follow_up'),
        lead_id
    ))
    
    g.db.commit()
    
    return jsonify({"success": True})


@api.route('/leads/<int:lead_id>', methods=['DELETE'])
def delete_lead(lead_id):
    """Delete a lead"""
    cursor = g.db.cursor()
    cursor.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
    g.db.commit()
    
    return jsonify({"success": True})


# =====================
# TASK ENDPOINTS
# =====================

@api.route('/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    status = request.args.get('status')
    
    cursor = g.db.cursor()
    if status:
        cursor.execute("""
            SELECT id, title, description, status, priority, owner, deadline, result, agent_assigned, created_at
            FROM tasks
            WHERE status = ?
            ORDER BY 
                CASE priority 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    ELSE 3 
                END,
                deadline ASC
        """, (status,))
    else:
        cursor.execute("""
            SELECT id, title, description, status, priority, owner, deadline, result, agent_assigned, created_at
            FROM tasks
            ORDER BY 
                CASE priority 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    ELSE 3 
                END,
                deadline ASC
        """)
    
    rows = cursor.fetchall()
    
    tasks = []
    for row in rows:
        tasks.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "status": row[3],
            "priority": row[4],
            "owner": row[5],
            "deadline": row[6],
            "result": row[7],
            "agent_assigned": row[8],
            "created_at": row[9]
        })
    
    return jsonify(tasks)


@api.route('/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = request.get_json()
    
    cursor = g.db.cursor()
    cursor.execute("""
        INSERT INTO tasks (title, description, status, priority, owner, deadline, agent_assigned)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get('title'),
        data.get('description'),
        data.get('status', 'pending'),
        data.get('priority', 'medium'),
        data.get('owner'),
        data.get('deadline'),
        data.get('agent_assigned')
    ))
    
    g.db.commit()
    task_id = cursor.lastrowid
    
    return jsonify({"id": task_id, "success": True})


@api.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    data = request.get_json()
    
    cursor = g.db.cursor()
    cursor.execute("""
        UPDATE tasks
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            status = COALESCE(?, status),
            priority = COALESCE(?, priority),
            owner = COALESCE(?, owner),
            deadline = COALESCE(?, deadline),
            result = COALESCE(?, result),
            agent_assigned = COALESCE(?, agent_assigned),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (
        data.get('title'),
        data.get('description'),
        data.get('status'),
        data.get('priority'),
        data.get('owner'),
        data.get('deadline'),
        data.get('result'),
        data.get('agent_assigned'),
        task_id
    ))
    
    g.db.commit()
    
    return jsonify({"success": True})


@api.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    cursor = g.db.cursor()
    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    g.db.commit()
    
    return jsonify({"success": True})


# =====================
# AGENT ENDPOINTS
# =====================

@api.route('/agents', methods=['GET'])
def get_agents():
    """Get all agents"""
    cursor = g.db.cursor()
    cursor.execute("""
        SELECT id, name, role, description, instructions, status, created_at
        FROM agents
        ORDER BY name
    """)
    rows = cursor.fetchall()
    
    agents = []
    for row in rows:
        agents.append({
            "id": row[0],
            "name": row[1],
            "role": row[2],
            "description": row[3],
            "instructions": row[4],
            "status": row[5],
            "created_at": row[6]
        })
    
    return jsonify(agents)


@api.route('/agents/<int:agent_id>', methods=['GET'])
def get_agent(agent_id):
    """Get a specific agent"""
    cursor = g.db.cursor()
    cursor.execute("SELECT * FROM agents WHERE id = ?", (agent_id,))
    row = cursor.fetchone()
    
    if not row:
        return jsonify({"error": "Agent not found"}), 404
    
    return jsonify(dict(row))


# =====================
# WORKFLOW ENDPOINTS
# =====================

@api.route('/workflows', methods=['GET'])
def get_workflows():
    """Get all workflows"""
    cursor = g.db.cursor()
    cursor.execute("""
        SELECT id, name, description, steps, trigger_type, status, created_at
        FROM workflows
        ORDER BY name
    """)
    rows = cursor.fetchall()
    
    workflows = []
    for row in rows:
        workflows.append({
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "steps": row[3],
            "trigger_type": row[4],
            "status": row[5],
            "created_at": row[6]
        })
    
    return jsonify(workflows)


@api.route('/workflows', methods=['POST'])
def create_workflow():
    """Create a new workflow"""
    data = request.get_json()
    
    cursor = g.db.cursor()
    cursor.execute("""
        INSERT INTO workflows (name, description, steps, trigger_type, status)
        VALUES (?, ?, ?, ?, ?)
    """, (
        data.get('name'),
        data.get('description'),
        data.get('steps'),
        data.get('trigger_type'),
        data.get('status', 'active')
    ))
    
    g.db.commit()
    workflow_id = cursor.lastrowid
    
    return jsonify({"id": workflow_id, "success": True})


@api.route('/workflows/<int:workflow_id>', methods=['PUT'])
def update_workflow(workflow_id):
    """Update a workflow"""
    data = request.get_json()
    
    cursor = g.db.cursor()
    cursor.execute("""
        UPDATE workflows
        SET name = COALESCE(?, name),
            description = COALESCE(?, description),
            steps = COALESCE(?, steps),
            trigger_type = COALESCE(?, trigger_type),
            status = COALESCE(?, status),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (
        data.get('name'),
        data.get('description'),
        data.get('steps'),
        data.get('trigger_type'),
        data.get('status'),
        workflow_id
    ))
    
    g.db.commit()
    
    return jsonify({"success": True})


# =====================
# SETTINGS ENDPOINTS
# =====================

@api.route('/settings', methods=['GET'])
def get_settings():
    """Get all settings"""
    from backend.services.llm_service import AVAILABLE_MODELS
    
    cursor = g.db.cursor()
    cursor.execute("SELECT key, value FROM settings")
    rows = cursor.fetchall()
    
    settings = {}
    for row in rows:
        settings[row[0]] = row[1]
    
    # Add available models and providers
    settings['available_models'] = AVAILABLE_MODELS
    settings['default_provider'] = os.getenv('DEFAULT_PROVIDER', 'ollama')
    settings['default_model'] = os.getenv('DEFAULT_MODEL', 'qwen2.5-coder:7b')
    
    return jsonify(settings)


@api.route('/settings', methods=['POST'])
def update_settings():
    """Update settings"""
    data = request.get_json()
    
    for key, value in data.items():
        set_setting(key, value)
    
    return jsonify({"success": True})


# =====================
# MEMORY ENDPOINTS
# =====================

@api.route('/memory', methods=['GET'])
def get_memory():
    """Get memory entries"""
    memo_type = request.args.get('type')
    limit = request.args.get('limit', 20, type=int)
    
    from backend.services.jarvis_service import get_memory as jarvis_get_memory
    
    entries = jarvis_get_memory(memo_type, limit)
    return jsonify(entries)


@api.route('/memory', methods=['POST'])
def save_memory():
    """Save to memory"""
    data = request.get_json()
    
    from backend.services.jarvis_service import save_to_memory
    
    success = save_to_memory(
        content=data.get('content'),
        memo_type=data.get('type', 'note'),
        title=data.get('title')
    )
    
    return jsonify({"success": success})


# =====================
# DASHBOARD ENDPOINTS
# =====================

@api.route('/dashboard')
def dashboard():
    """Get dashboard statistics"""
    cursor = g.db.cursor()
    
    # Get counts
    cursor.execute("SELECT COUNT(*) FROM clients WHERE status = 'active'")
    active_clients = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM leads")
    total_leads = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM leads WHERE status = 'new'")
    new_leads = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'pending'")
    open_tasks = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM agents WHERE status = 'active'")
    active_agents = cursor.fetchone()[0]
    
    # Get recent leads
    cursor.execute("""
        SELECT name, company, status, created_at
        FROM leads
        ORDER BY created_at DESC
        LIMIT 5
    """)
    recent_leads = cursor.fetchall()
    
    # Get recent tasks
    cursor.execute("""
        SELECT title, status, priority, deadline
        FROM tasks
        ORDER BY created_at DESC
        LIMIT 5
    """)
    recent_tasks = cursor.fetchall()
    
    return jsonify({
        "active_clients": active_clients,
        "total_leads": total_leads,
        "new_leads": new_leads,
        "open_tasks": open_tasks,
        "active_agents": active_agents,
        "recent_leads": [
            {"name": row[0], "company": row[1], "status": row[2], "created_at": row[3]}
            for row in recent_leads
        ],
        "recent_tasks": [
            {"title": row[0], "status": row[1], "priority": row[2], "deadline": row[3]}
            for row in recent_tasks
        ]
    })


# =====================
# CLONE SYSTEM ENDPOINTS
# =====================

@api.route('/clone', methods=['POST'])
def clone_system():
    """Clone the system for a new client"""
    data = request.get_json()
    new_client_name = data.get('client_name')
    
    if not new_client_name:
        return jsonify({"error": "client_name required"}), 400
    
    cursor = g.db.cursor()
    
    # Create client profile
    cursor.execute("""
        INSERT INTO clients (business_name, industry, status)
        VALUES (?, ?, ?)
    """, (new_client_name, 'cloned', 'active'))
    
    new_client_id = cursor.lastrowid
    
    g.db.commit()
    
    return jsonify({
        "success": True,
        "client_id": new_client_id,
        "message": f"System cloned for {new_client_name}"
    })