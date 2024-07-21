#!/usr/bin/env python3
# ####COPY DB LINE!#####
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://mdocken:%40tTTFJ%23g3Pla@localhost/planet'
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
from dateutil.parser import parse as parse_date
from celery import Celery  # Ensure Celery is imported
import google_calendar
from datetime import timedelta
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}})  # Configure CORS

# Configurations
database_uri = os.getenv('DATABASE_URI')
if not database_uri:
    raise ValueError("No DATABASE_URI set for Flask application. Did you follow the setup instructions?")

app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
app.config.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0',
    broker_connection_retry_on_startup=True
)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

def make_celery(app):
    celery = Celery(
        app.import_name,
        backend=app.config['result_backend'],
        broker=app.config['broker_url']
    )
    celery.conf.update(app.config)
    return celery

celery = make_celery(app)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    message = db.Column(db.String(250), nullable=False)
    time = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f'<Notification {self.title}>'

@app.route('/api/notifications', methods=['POST'])
def create_notification():
    try:
        data = request.get_json()
        title = data['title']
        message = data['message']
        time = parse_date(data['time'])

        new_notification = Notification(title=title, message=message, time=time)
        db.session.add(new_notification)
        db.session.commit()

        schedule_notification.apply_async(args=[new_notification.id], eta=time)

        return jsonify({'id': new_notification.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    try:
        notifications = Notification.query.all()
        result = [{'id': n.id, 'title': n.title, 'message': n.message, 'time': n.time} for n in notifications]
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications/<int:id>', methods=['PUT'])
def update_notification(id):
    try:
        notification = Notification.query.get(id)
        if not notification:
            return jsonify({'message': 'Notification not found'}), 404

        data = request.get_json()
        notification.title = data['title']
        notification.message = data['message']
        notification.time = parse_date(data['time'])
        db.session.commit()

        return jsonify({'message': 'Notification updated'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications/<int:id>', methods=['DELETE'])
def delete_notification(id):
    try:
        notification = Notification.query.get(id)
        if not notification:
            return jsonify({'message': 'Notification not found'}), 404

        db.session.delete(notification)
        db.session.commit()
        return jsonify({'message': 'Notification deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@celery.task
def schedule_notification(notification_id):
    notification = Notification.query.get(notification_id)
    if notification:
        print(f"Notification triggered: {notification.title} - {notification.message}")
        google_calendar.create_event(
            notification.title,
            notification.message,
            notification.time,
            notification.time + timedelta(hours=1)
        )
if __name__ == '__main__':
    app.run(debug=True)

