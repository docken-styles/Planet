# src/app/tasks.py
from app import celery, app, db
from app.models import Notification
from app.google_calendar import create_event
from datetime import timedelta
import logging

@celery.task(name='app.schedule_notification')
def schedule_notification(notification_id):
    with app.app_context():
        try:
            notification = Notification.query.get(notification_id)
            if notification:
                create_event(
                    notification.title,
                    notification.message,
                    notification.time,
                    notification.time + timedelta(hours=1)
                )
                logging.info(f"Event created in Google Calendar for notification ID: {notification_id}")
            else:
                logging.warning(f"No notification found with ID: {notification_id}")
        except Exception as e:
            logging.error(f"Error in schedule_notification task: {str(e)}")

