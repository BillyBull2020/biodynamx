"""
EmpireOS - Main Application Entry Point
================================
AI Business Command Center
"""

import os
import sys

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from flask import Flask, send_from_directory
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize database
from database import init_db


def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__, static_folder='frontend')
    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
    
    # Initialize database
    with app.app_context():
        init_db()
    
    # Register blueprints
    from backend.routes import api
    app.register_blueprint(api, url_prefix='/api')
    
    # Serve frontend files
    @app.route('/')
    def index():
        return send_from_directory('frontend', 'index.html')
    
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path and os.path.exists(os.path.join('frontend', path)):
            return send_from_directory('frontend', path)
        return send_from_directory('frontend', 'index.html')
    
    return app


# Create app instance for wsgi
app = create_app()


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"\n{'='*50}")
    print(f"EmpireOS - AI Business Command Center")
    print(f"{'='*50}")
    print(f"Starting on http://localhost:{port}")
    print(f"Dashboard: http://localhost:{port}")
    print(f"API: http://localhost:{port}/api")
    print(f"{'='*50}\n")
    
    app.run(host='0.0.0.0', port=port, debug=True)