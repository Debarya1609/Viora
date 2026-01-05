from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    from app.routes.patient_ai import patient_ai_bp
    app.register_blueprint(patient_ai_bp)

    return app

app = create_app()
