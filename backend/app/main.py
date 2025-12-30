from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    from app.routes.intake import intake_bp
    app.register_blueprint(intake_bp)

    from app.routes.analysis import analysis_bp
    app.register_blueprint(analysis_bp)


    return app

app = create_app()
