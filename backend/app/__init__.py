# app/__init__.py

from __future__ import annotations

import os

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load .env at startup
load_dotenv()

db = SQLAlchemy()


def create_app() -> Flask:
    app = Flask(__name__)

    # --- Config ---
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/health_nurse_db",
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")

    # --- Extensions ---
    db.init_app(app)

    # Allow Expo / RN to call this API during dev
    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=False,
    )

    # --- Blueprints ---
    from app.routes.routes_auth import bp as auth_bp
    from app.routes.routes_medications import bp as medications_bp
    from app.routes.routes_appointments import bp as appointments_bp
    from app.routes.routes_reports import bp as reports_bp
    from app.routes import routes_profile
    from app.routes.routes_medication_events import bp as medication_events_bp
    from app.routes.routes_nurse import bp as nurse_bp
    from app.routes.patient_ai import patient_ai_bp  # if you want /patient/ai

    app.register_blueprint(auth_bp)
    app.register_blueprint(medications_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(routes_profile.bp)
    app.register_blueprint(medication_events_bp)
    app.register_blueprint(nurse_bp)
    app.register_blueprint(patient_ai_bp)  # comment out if unused

    # --- Simple health check ---
    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app
