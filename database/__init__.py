"""
Database package initialization
"""

import os
import sqlite3


_db_path = None


def _get_db_dir():
    """Get database directory"""
    return os.path.dirname(os.path.abspath(__file__))


def get_db():
    """Get database connection"""
    global _db_path
    db_dir = _get_db_dir()
    if _db_path is None:
        _db_path = os.path.join(db_dir, "empireos.db")
    os.makedirs(db_dir, exist_ok=True)
    conn = sqlite3.connect(_db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize all database tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Chat history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_message TEXT NOT NULL,
            ai_response TEXT,
            provider TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Memory table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            title TEXT,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Tasks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            owner TEXT,
            deadline TEXT,
            result TEXT,
            agent_assigned TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Clients table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_name TEXT NOT NULL,
            industry TEXT,
            contact_name TEXT,
            email TEXT,
            phone TEXT,
            website TEXT,
            goals TEXT,
            pain_points TEXT,
            offers TEXT,
            notes TEXT,
            status TEXT DEFAULT 'active',
            agents_assigned TEXT,
            workflows_assigned TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Leads table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            company TEXT,
            phone TEXT,
            email TEXT,
            industry TEXT,
            city TEXT,
            status TEXT DEFAULT 'new',
            source TEXT,
            notes TEXT,
            next_follow_up TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Agents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            role TEXT,
            description TEXT,
            instructions TEXT,
            status TEXT DEFAULT 'active',
            tools TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Workflows table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workflows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            steps TEXT,
            trigger_type TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # API Keys table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider TEXT UNIQUE NOT NULL,
            api_key TEXT,
            model TEXT,
            base_url TEXT,
            enabled INTEGER DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    
    # Seed default data
    seed_default_data(cursor, conn)
    
    conn.close()
    print("Database initialized successfully!")


def seed_default_data(cursor, conn):
    """Seed default agents and workflows"""
    
    # Default Agents
    default_agents = [
        ("Sales Agent", "sales", "Handles cold calls, objections, follow-up, and closing", 
         "You are a expert sales closer. Handle cold calls, overcome objections, and close deals.", "active"),
        ("Marketing Agent", "marketing", "Creates ads, content, landing pages, and SEO",
         "You are a marketing expert. Create ads, content, and landing pages.", "active"),
        ("Research Agent", "research", "Market, competitor, and lead research",
         "You are a research specialist. Research markets, competitors, and leads.", "active"),
        ("Builder Agent", "builder", "Websites, funnels, apps, and automations",
         "You are a builder. Create websites, funnels, apps, and automations.", "active"),
        ("Operations Agent", "operations", "SOPs, fulfillment, and task management",
         "You are an operations expert. Manage SOPs, fulfillment, and tasks.", "active"),
        ("Client Success Agent", "client_success", "Onboarding, reporting, and retention",
         "You are a client success manager. Handle onboarding, reporting, and retention.", "active"),
        ("Finance Agent", "finance", "ROI, pricing, and projections",
         "You are a finance expert. Analyze ROI, set pricing, and create projections.", "active"),
        ("Legal/Admin Agent", "legal", "Contracts, disclaimers, and compliance",
         "You are a legal support agent. Handle contracts and compliance.", "active"),
        ("Roofing Campaign Agent", "roofing", "Denver roofing leads, storm alerts, canvassing",
         "You are a roofing campaign specialist. Handle Denver roofing leads and storm campaigns.", "active"),
        ("AI Employee Agent", "ai_employee", "Receptionist, sales, support workflows",
         "You are an AI employee. Handle receptionist, sales, and support workflows.", "active"),
    ]
    
    for agent_data in default_agents:
        cursor.execute("""
            INSERT OR IGNORE INTO agents (name, role, description, instructions, status)
            VALUES (?, ?, ?, ?, ?)
        """, agent_data)
    
    # Default Workflows
    default_workflows = [
        ("Missed Call Text Back", "Auto-text leads when phone call missed",
         '[{"step": 1, "action": "detect_missed_call"}, {"step": 2, "action": "send_sms", "template": "Hi {name}, we missed your call. How can I help?"}]',
         "missed_call", "active"),
        ("Lead Follow-Up", "Follow-up sequence for new leads",
         '[{"step": 1, "action": "check_status"}, {"step": 2, "action": "send_message"}]', 
         "schedule", "active"),
        ("Appointment Booking", "Book appointments from inquiries",
         '[{"step": 1, "action": "check_interest"}, {"step": 2, "action": "offer_times"}, {"step": 3, "action": "confirm_booking"}]',
         "trigger", "active"),
        ("Review Request", "Request reviews after completion",
         '[{"step": 1, "action": "check_completion"}, {"step": 2, "action": "send_review_request"}]',
         "completion", "active"),
        ("Roofing Storm Campaign", "Denver storm season campaign",
         '[{"step": 1, "action": "storm_alert"}, {"step": 2, "action": "canvass_area"}, {"step": 3, "action": "follow_up"}]',
         "storm", "active"),
        ("AI Receptionist Setup", "Set up AI receptionist for client",
         '[{"step": 1, "action": "configure_voice"}, {"step": 2, "action": "set_hours"}, {"step": 3, "action": "test_responses"}]',
         "manual", "active"),
        ("Outbound Sales Campaign", "Cold outreach campaign",
         '[{"step": 1, "action": "load_leads"}, {"step": 2, "action": "call_sequence"}, {"step": 3, "action": "log_results"}]',
         "schedule", "active"),
    ]
    
    for workflow_data in default_workflows:
        cursor.execute("""
            INSERT OR IGNORE INTO workflows (name, description, steps, trigger_type, status)
            VALUES (?, ?, ?, ?, ?)
        """, workflow_data)
    
    conn.commit()


def get_setting(key: str, default: str = None) -> str:
    """Get a setting value"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
        row = cursor.fetchone()
        conn.close()
        return row[0] if row else default
    except:
        return default


def set_setting(key: str, value: str) -> bool:
    """Set a setting value"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO settings (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """, (key, value))
        conn.commit()
        conn.close()
        return True
    except:
        return False