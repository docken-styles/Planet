# src/app/routes.py
from flask import request, jsonify
from . import app, db
from .models import Notification
from dateutil.parser import parse as parse_date
from .tasks import schedule_notification
import logging

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
        logging.error(f"Error creating notification: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    try:
        notifications = Notification.query.all()
        result = [{'id': n.id, 'title': n.title, 'message': n.message, 'time': n.time} for n in notifications]
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error getting notifications: {str(e)}")
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
        logging.error(f"Error updating notification: {str(e)}")
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
        logging.error(f"Error deleting notification: {str(e)}")
        return jsonify({'error': str(e)}), 500

