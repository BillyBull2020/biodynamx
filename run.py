#!/usr/bin/env python3
"""
EmpireOS - Run Application
=========================
AI Business Command Center
"""

import os
import sys

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize and run the app
from app import app

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    
    print(f"\n{'='*50}")
    print(f"EmpireOS - AI Business Command Center")
    print(f"{'='*50}")
    print(f"Starting on http://localhost:{port}")
    print(f"Dashboard: http://localhost:{port}")
    print(f"API: http://localhost:{port}/api")
    print(f"{'='*50}\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)