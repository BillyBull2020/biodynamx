/**
 * EmpireOS - Frontend JavaScript
 */

// API Base URL
const API_BASE = '';

// Current state
let currentPage = 'dashboard';
let currentLeadFilter = 'all';
let modelsData = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadDashboard();
    checkProviders();
    loadModels();
});

// Navigation
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            showPage(page);
        });
    });
}

function showPage(page) {
    currentPage = page;
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Show page
    document.querySelectorAll('.page').forEach(p => {
        p.classList.add('hidden');
    });
    document.getElementById(`page-${page}`).classList.remove('hidden');
    
    // Load data for page
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'clients':
            loadClients();
            break;
        case 'leads':
            loadLeads();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'agents':
            loadAgents();
            break;
        case 'workflows':
            loadWorkflows();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/api/dashboard`);
        const data = await response.json();
        
        document.getElementById('stat-clients').textContent = data.active_clients;
        document.getElementById('stat-leads').textContent = data.total_leads;
        document.getElementById('stat-new-leads').textContent = data.new_leads;
        document.getElementById('stat-tasks').textContent = data.open_tasks;
        
        // Recent leads
        const leadsContainer = document.getElementById('recent-leads');
        leadsContainer.innerHTML = data.recent_leads.map(lead => `
            <div class="item-row">
                <div class="item-info">
                    <div class="item-name">${lead.name}</div>
                    <div class="item-meta">${lead.company || 'N/A'} - ${lead.status}</div>
                </div>
            </div>
        `).join('') || '<p class="help-text">No leads yet</p>';
        
        // Recent tasks
        const tasksContainer = document.getElementById('recent-tasks');
        tasksContainer.innerHTML = data.recent_tasks.map(task => `
            <div class="item-row">
                <div class="item-info">
                    <div class="item-name">${task.title}</div>
                    <div class="item-meta priority-${task.priority}">${task.priority} - ${task.status}</div>
                </div>
            </div>
        `).join('') || '<p class="help-text">No tasks yet</p>';
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Quick Jarvis Command
async function runQuickJarvis() {
    const input = document.getElementById('quick-command');
    const responseDiv = document.getElementById('quick-response');
    const message = input.value.trim();
    
    if (!message) return;
    
    responseDiv.classList.remove('hidden');
    responseDiv.textContent = 'Jarvis is thinking...';
    
    try {
        const response = await fetch(`${API_BASE}/api/jarvis/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            responseDiv.textContent = data.content;
        } else {
            responseDiv.textContent = `Error: ${data.error}`;
        }
        
    } catch (error) {
        responseDiv.textContent = `Error: ${error.message}`;
    }
    
    input.value = '';
}

// Jarvis Chat
async function sendToJarvis() {
    const input = document.getElementById('jarvis-input');
    const chatContainer = document.getElementById('jarvis-chat');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message chat-user';
    userMsg.textContent = message;
    chatContainer.appendChild(userMsg);
    
    input.value = '';
    
    // Add AI thinking message
    const aiMsg = document.createElement('div');
    aiMsg.className = 'chat-message chat-ai';
    aiMsg.textContent = 'Thinking...';
    chatContainer.appendChild(aiMsg);
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    try {
        const response = await fetch(`${API_BASE}/api/jarvis/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            aiMsg.textContent = data.content;
        } else {
            aiMsg.textContent = `Error: ${data.error}`;
        }
        
    } catch (error) {
        aiMsg.textContent = `Error: ${error.message}`;
    }
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function openJarvis() {
    showPage('jarvis');
}

// Clients
async function loadClients() {
    try {
        const response = await fetch(`${API_BASE}/api/clients`);
        const clients = await response.json();
        
        const container = document.getElementById('clients-list');
        container.innerHTML = clients.map(client => `
            <div class="item-row">
                <div class="item-info">
                    <div class="item-name">${client.business_name}</div>
                    <div class="item-meta">${client.industry || 'N/A'} - ${client.contact_name || 'N/A'}</div>
                </div>
                <span class="item-status status-${client.status}">${client.status}</span>
            </div>
        `).join('') || '<p class="help-text">No clients yet. Add your first client!</p>';
        
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

function showAddClient() {
    const name = prompt('Business Name:');
    if (!name) return;
    
    const industry = prompt('Industry:') || '';
    const contact = prompt('Contact Name:') || '';
    
    fetch(`${API_BASE}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            business_name: name,
            industry,
            contact_name: contact
        })
    }).then(() => loadClients());
}

// Leads
async function loadLeads() {
    try {
        const status = currentLeadFilter === 'all' ? '' : currentLeadFilter;
        const response = await fetch(`${API_BASE}/api/leads${status ? `?status=${status}` : ''}`);
        const leads = await response.json();
        
        const container = document.getElementById('leads-list');
        container.innerHTML = leads.map(lead => `
            <div class="item-row">
                <div class="item-info">
                    <div class="item-name">${lead.name}</div>
                    <div class="item-meta">${lead.company || 'N/A'} - ${lead.city || 'N/A'} - ${lead.phone || 'N/A'}</div>
                </div>
                <span class="item-status status-${lead.status}">${lead.status.replace('_', ' ')}</span>
            </div>
        `).join('') || '<p class="help-text">No leads yet. Add your first lead!</p>';
        
        // Also load roofing leads
        loadRoofingLeads();
        
    } catch (error) {
        console.error('Error loading leads:', error);
    }
}

async function loadRoofingLeads() {
    try {
        const response = await fetch(`${API_BASE}/api/leads?status=roofing`);
        const leads = await response.json();
        
        const container = document.getElementById('roofing-leads');
        container.innerHTML = leads.map(lead => `
            <div class="item-row">
                <div class="item-info">
                    <div class="item-name">${lead.name}</div>
                    <div class="item-meta">${lead.city || 'N/A'} - ${lead.phone || 'N/A'}</div>
                </div>
                <span class="item-status status-${lead.status}">${lead.status}</span>
            </div>
        `).join('') || '<p class="help-text">No roofing leads</p>';
        
    } catch (error) {
        console.error('Error loading roofing leads:', error);
    }
}

function showAddLead() {
    const name = prompt('Lead Name:');
    if (!name) return;
    
    const company = prompt('Company:') || '';
    const phone = prompt('Phone:') || '';
    const email = prompt('Email:') || '';
    const city = prompt('City:') || '';
    
    fetch(`${API_BASE}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name, company, phone, email, city, status: 'new'
        })
    }).then(() => loadLeads());
}

// Lead filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLeadFilter = btn.dataset.filter;
        loadLeads();
    });
});

// Tasks
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/api/tasks`);
        const tasks = await response.json();
        
        const container = document.getElementById('tasks-list');
        container.innerHTML = tasks.map(task => `
            <div class="item-row">
                <div class="item-info">
                    <div class="item-name">${task.title}</div>
                    <div class="item-meta priority-${task.priority}">${task.priority} - ${task.owner || 'Unassigned'} - Due: ${task.deadline || 'N/A'}</div>
                </div>
                <span class="item-status status-${task.status}">${task.status}</span>
            </div>
        `).join('') || '<p class="help-text">No tasks yet. Add your first task!</p>';
        
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function showAddTask() {
    const title = prompt('Task Title:');
    if (!title) return;
    
    const description = prompt('Description:') || '';
    const priority = prompt('Priority (high/medium/low):', 'medium') || 'medium';
    const owner = prompt('Owner:') || '';
    const deadline = prompt('Deadline (YYYY-MM-DD):') || '';
    
    fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title, description, priority, owner, deadline, status: 'pending'
        })
    }).then(() => loadTasks());
}

// Agents
async function loadAgents() {
    try {
        const response = await fetch(`${API_BASE}/api/agents`);
        const agents = await response.json();
        
        const container = document.getElementById('agents-list');
        container.innerHTML = agents.map(agent => `
            <div class="agent-card">
                <h4>${agent.name}</h4>
                <p>${agent.description}</p>
                <p style="margin-top: 8px; font-size: 12px; color: var(--accent-primary);">${agent.status}</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading agents:', error);
    }
}

// Workflows
async function loadWorkflows() {
    try {
        const response = await fetch(`${API_BASE}/api/workflows`);
        const workflows = await response.json();
        
        const container = document.getElementById('workflows-list');
        container.innerHTML = workflows.map(workflow => `
            <div class="item-row">
                <div class="item-info">
                    <div class="item-name">${workflow.name}</div>
                    <div class="item-meta">${workflow.description}</div>
                </div>
                <span class="item-status status-${workflow.status}">${workflow.trigger_type}</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading workflows:', error);
    }
}

// Settings
async function loadSettings() {
    checkProviders();
    loadModels();
}

async function checkProviders() {
    try {
        const response = await fetch(`${API_BASE}/api/providers/status`);
        const status = await response.json();
        
        const providers = ['ollama', 'openrouter', 'groq', 'gemini', 'openai'];
        providers.forEach(provider => {
            const card = document.getElementById(`status-${provider}`);
            if (card) {
                const statusEl = card.querySelector('.provider-status');
                if (status[provider]?.success) {
                    statusEl.textContent = '✓ Connected';
                    statusEl.className = 'provider-status success';
                } else {
                    statusEl.textContent = status[provider]?.error || 'Not configured';
                    statusEl.className = 'provider-status error';
                }
            }
        });
        
        // Update sidebar status
        document.getElementById('provider-status').textContent = 
            status.ollama?.success ? 'Ollama Connected' : 
            status.openrouter?.success ? 'OpenRouter Connected' : 'Not Connected';
        
    } catch (error) {
        console.error('Error checking providers:', error);
    }
}

async function loadModels() {
    try {
        const response = await fetch(`${API_BASE}/api/models`);
        modelsData = await response.json();
        
        const modelSelect = document.getElementById('default-model');
        modelSelect.innerHTML = '';
        
        // Populate models for each provider
        Object.keys(modelsData).forEach(provider => {
            Object.keys(modelsData[provider]).forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = `${modelsData[provider][model].name} (${provider})`;
                option.dataset.provider = provider;
                modelSelect.appendChild(option);
            });
        });
        
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

// Model selector based on provider
document.getElementById('default-provider')?.addEventListener('change', (e) => {
    const provider = e.target.value;
    const modelSelect = document.getElementById('default-model');
    
    Array.from(modelSelect.options).forEach(option => {
        option.style.display = option.dataset.provider === provider ? 'block' : 'none';
    });
});

// Roofing Scripts
function runRoofingScript(script) {
    const scripts = {
        door: `DOOR-KNOCK SCRIPT FOR DENVER ROOFING:

Opening:
"Hi, I'm ${'[Your Name]'} from AI Expert Solutions. We noticed some storm damage in the neighborhood and wanted to check if your roof is okay. Have you noticed any leaks or damage?"

If interested:
"We offer FREE roof inspections. Would you like us to take a look?"

Close:
"If we find damage, we'll give you a free estimate with no obligation. When works best for you - today or tomorrow?"`,

        sms: `SMS SCRIPT:
"Hi [Name], this is [Name] from AI Expert Solutions. We noticed some recent storm damage in your area and wanted to offer a FREE roof inspection. No obligation - just want to make sure your roof is okay. Text back YES for more info!"`,

        call: `COLD CALL SCRIPT:
"Hi [Name], this is [Name] with AI Expert Solutions. Have you had a chance to check your roof after the recent storms?

[If yes] Great, did you notice any damage? 
[If no] We offer free inspections. Would it make sense to stop by and take a look?"

Transition:
"Most roofs in [neighborhood] are 15+ years old. When was yours installed?"`,

        email: `EMAIL SEQUENCE:
Subject: Storm Damage Check - [Neighborhood]

Body:
"Hi [Name],

We noticed your area was hit by recent storms. Wanted to check if your roof is holding up.

At AI Expert Solutions, we offer:
✓ Free roof inspections
✓ No upfront costs
✓ Flexible financing

Reply to schedule your free inspection.

Best,
[Your Name]
AI Expert Solutions"`,

        checklist: `NEIGHBORHOOD DOMINATION CHECKLIST:
□ Map target neighborhoods (high elevation, older homes)
□ Check county records for roof ages
□ Knock doors within 48 hours of storm
□ Leavedoor hangers if no answer
□ Text follow-up within 24 hours
□ Book inspection before leaving street
□ Document all conversations
□ Follow up every 3 days until decision`
    };
    
    const result = scripts[script] || 'Script not found';
    alert(result);
}

// Roofing Calculator
function runRoofingCalculator() {
    const roofSize = prompt('Roof size (sq ft):', '2500');
    const pricePerSq = prompt('Price per sq ft:', '$8');
    const material = prompt('Material cost:', '$4');
    
    if (!roofSize || !pricePerSq || !material) return;
    
    const size = parseInt(roofSize);
    const price = parseFloat(pricePerSq.replace('$', ''));
    const matCost = parseFloat(material.replace('$', ''));
    
    const revenue = size * price;
    const costs = size * matCost;
    const profit = revenue - costs;
    const margin = ((profit / revenue) * 100).toFixed(1);
    
    alert(`Roofing ROI Calculator:
─────────────────
Roof Size: ${size} sq ft
Revenue: $${revenue.toLocaleString()}
Costs: $${costs.toLocaleString()}
Profit: $${profit.toLocaleString()}
Margin: ${margin}%
─────────────────`);
}

// Sales Tools
function runSalesTool(tool) {
    const tools = {
        discovery: `DISCOVERY CALL QUESTIONS:

1. "What's your biggest challenge with [current process]?"
2. "How are you currently handling that?"
3. "What's that costing you?"
4. "What would change if you could fix that?"
5. "What's your timeline to make a decision?"`,

        objections: `OBJECTION HANDLING:

Price: "I understand. Let's look at the ROI instead of just the cost. What would it be worth to 10x your results?"

Time: "What if we could automate 80% of that? Would it be worth 10 minutes a day?"

Trust: "What would it take to trust that this works? Let's address that specifically."`,

        proposal: `PROPOSAL OUTLINE:

EXECUTIVE SUMMARY
- Your current challenges
- Our recommended solution
- Expected results

SCOPE OF WORK
- Phase 1: [Deliverable]
- Phase 2: [Deliverable]
- Phase 3: [Deliverable]

INVESTMENT
- Implementation: $X
- Monthly: $Y

TIMELINE
- Week 1-2: [Deliverable]
- Week 3-4: [Deliverable]`,

        demo: `DEMO SCRIPT:

1. Show the problem (30 sec)
2. Introduce solution (1 min)
3. Live demo (3 min)
4. Success story (1 min)
5. Close: "Does this solve [their problem]?"
6. "Let's get you started - what's your timeline?"`,

        close: `CLOSE SCRIPT:

"Treatment works - you've seen that. The price is $X. 

We have 2 options:
1. Start today - we begin immediately
2. Wait - risk losing momentum

What's more important to you - speed or saving money?

Let's get you on the calendar."`,

        pricing: `PRICING CALCULATOR:

Basic Package: $2,500/mo
- 1 AI agent
- Basic workflows
- Email support

Pro Package: $5,000/mo  
- 3 AI agents
- Advanced workflows
- Priority support

Enterprise: $10,000/mo
- Unlimited agents
- Custom development
- 24/7 support

ROI: 5-10x typical return`
    };
    
    const result = tools[tool] || 'Tool not found';
    alert(result);
}

async function askSalesJarvis() {
    const input = document.getElementById('sales-prompt');
    const responseDiv = document.getElementById('sales-response');
    const message = input.value.trim();
    
    if (!message) return;
    
    responseDiv.classList.remove('hidden');
    responseDiv.textContent = 'Asking Jarvis...';
    
    try {
        const response = await fetch(`${API_BASE}/api/jarvis/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: `Sales question: ${message}. Give specific, actionable advice.`
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            responseDiv.textContent = data.content;
        } else {
            responseDiv.textContent = `Error: ${data.error}`;
        }
        
    } catch (error) {
        responseDiv.textContent = `Error: ${error.message}`;
    }
    
    input.value = '';
}

// Clone System
async function cloneSystem() {
    const name = document.getElementById('clone-client-name').value.trim();
    
    if (!name) {
        alert('Please enter a client name');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/clone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_name: name })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`System cloned for ${name}! Client ID: ${data.client_id}`);
            document.getElementById('clone-client-name').value = '';
        } else {
            alert(`Error: ${data.error}`);
        }
        
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}