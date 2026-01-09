# app/routes_auth.py

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import jwt
from flask import Blueprint, jsonify, request, g
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

from app import db
from app.sql_models import User

bp = Blueprint("auth", __name__, url_prefix="/auth")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-jwt-secret")
JWT_ALG = "HS256"
JWT_EXPIRES_DAYS = 7


def create_token(user: User) -> str:
    payload = {
        "user_id": str(user.id),
        "role": user.role,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRES_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


@bp.post("/register")
def register():
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = data.get("name") or ""
    role = data.get("role") or "patient"  # "patient" or "doctor"

    # Basic validation
    if not email or "@" not in email:
        return jsonify({"error": "Valid email is required"}), 400
    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"error": "Email already in use"}), 400

    password_hash = generate_password_hash(password)

    user = User(
        email=email,
        password_hash=password_hash,
        role=role,
        name=name,
    )
    db.session.add(user)
    db.session.commit()

    token = create_token(user)

    return (
        jsonify(
            {
                "token": token,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "role": user.role,
                    "name": user.name,
                },
            }
        ),
        201,
    )


@bp.post("/login")
def login():
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 400

    token = create_token(user)

    return jsonify(
        {
            "token": token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "role": user.role,
                "name": user.name,
            },
        }
    )


@bp.get("/me")
def me():
    """
    Simple 'who am I' endpoint.
    Expects Authorization: Bearer <token>.
    """
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip()

    if not token:
        return jsonify({"error": "Missing Authorization header"}), 401

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    user = User.query.get(payload.get("user_id"))
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(
        {
            "id": str(user.id),
            "email": user.email,
            "role": user.role,
            "name": user.name,
        }
    )


# ---------- Shared auth helpers for other routes ----------

def get_current_user():
    """
    Decode JWT from Authorization header and return User or None.
    """
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip()

    if not token:
        return None

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

    user = User.query.get(payload.get("user_id"))
    return user


def auth_required(fn):
    """
    Decorator to protect routes with JWT.
    Sets g.current_user when valid, else returns 401.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
        g.current_user = user
        return fn(*args, **kwargs)

    return wrapper
