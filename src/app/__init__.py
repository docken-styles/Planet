# src/app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from celery import Celery
#from flask_celery_helper import FlaskCeleryHelper
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
#flask_celery = FlaskCeleryHelper()

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}})

    database_uri = os.getenv('DATABASE_URI')
    if not database_uri:
        raise ValueError("No DATABASE_URI set for Flask application. Did you follow the setup instructions?")

    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
    app.config.update(
        broker_url='redis://localhost:6379/0',
        result_backend='redis://localhost:6379/0',
        broker_connection_retry_on_startup=True
    )

    db.init_app(app)
    migrate.init_app(app, db)
 #   flask_celery.init_app(app)

    with app.app_context():
        from . import routes, tasks, models
        db.create_all()

    return app

#celery = flask_celery.celery

