#!/usr/bin/env python3
import os
from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime, timedelta
from dateutil.parser import parse as parse_date
from celery import Celery
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from dotenv import load_dotenv
import logging
import plivo
import pytz
import psycopg2

load_dotenv()

# Flask setup
app = Flask(__name__)
CORS(app)
#CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}})

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0',
    broker_connection_retry_on_startup=True
)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Plivo credentials
PLIVO_AUTH_ID = os.getenv('PLIVO_AUTH_ID')
PLIVO_AUTH_TOKEN = os.getenv('PLIVO_AUTH_TOKEN')
PLIVO_PHONE_NUMBER = os.getenv('PLIVO_PHONE_NUMBER')

client = plivo.RestClient(auth_id=PLIVO_AUTH_ID, auth_token=PLIVO_AUTH_TOKEN)

# Celery setup
def make_celery(app):
    celery = Celery(
        app.import_name,
        backend=app.config['result_backend'],
        broker=app.config['broker_url']
    )
    celery.conf.update(app.config)
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    celery.Task = ContextTask
    return celery

celery = make_celery(app)

# Models
class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    message = db.Column(db.String(250), nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    event_id = db.Column(db.String(250), nullable=True)

    def __repr__(self):
        return f'<Notification {self.title}>'

# Routes
@app.route('/api/notifications', methods=['POST'])
def create_notification():
    try:
        data = request.get_json()
        title = data['title']
        message = data['message']
        time = parse_date(data['time']).astimezone(pytz.timezone('America/New_York'))
        phone_number = "+12263399067"

        new_notification = Notification(title=title, message=message, time=time)
        db.session.add(new_notification)
        db.session.commit()

        # Logging before creating the event
        logging.info(f"Creating notification with ID: {new_notification.id} at {time}")
        # Immediately create the Google Calendar event
        event = create_event(
            new_notification.title,
            new_notification.message,
            new_notification.time,
            new_notification.time + timedelta(hours=1)
        )

        if event:
            new_notification.event_id = event.get('id')
            db.session.commit()
        logging.info(f"Google Calendar event created for notification ID: {new_notification.id}")

        # Commented out scheduling part for future use
        # result = schedule_notification.apply_async(args=[new_notification.id], eta=time)
        # logging.info(f"Scheduled task ID: {result.id}")

# Check the time and log it
        logging.info(f"Scheduling SMS task for time: {time}")

        # Schedule the SMS notification
        result = schedule_sms.apply_async(args=[phone_number, message], eta=time)
        logging.info(f"Scheduled SMS task ID: {result.id}")

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
        notification.time = parse_date(data['time']).astimezone(pytz.timezone('America/New_York'))
        
        # Update the event in Google Calendar
        if notification.event_id:
            update_event(
                notification.event_id,
                notification.title,
                notification.message,
                notification.time,
                notification.time + timedelta(hours=1)
            )

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

        # Delete the corresponding Google Calendar Event
        if notification.event_id:
            delete_event(notification.event_id)
            logging.info(f"Deleted Google Calendar event with ID: {notification.event_id}")

        return jsonify({'message': 'Notification deleted'}), 200
    except Exception as e:
        logging.error(f"Error deleting notification: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/oauth2callback', methods=['GET'])
def oauth2callback():
    try:
        flow = InstalledAppFlow.from_client_secrets_file('secrets/credentials.json', SCOPES, redirect_uri=url_for('oauth2callback', _external=True))
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        with open('secrets/token.json', 'w') as token:
            token.write(credentials.to_json())
        return redirect(url_for('index'))
    except Exception as e:
        logging.error(f"Error in OAuth callback: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    return jsonify({'message': 'Welcome to the Flask app with Celery and Google Calendar integration!'})


@app.route('/api/plants', methods=['GET'])
def get_plants():
    try:
        # Fetch the password from the environment variable
        db_password = os.getenv('DATABASE_PASSWORD')
        logging.info(f"Connecting to database with user mdocken")

        # Use the password in the connection string
        conn = psycopg2.connect(dbname="planet", user="mdocken", password="tTTFJg3Pla",host="localhost")
        cur = conn.cursor()

        query = request.args.get('query', '').lower()
        logging.info(f"Search query received: {query}")

        # Execute the SQL query with the search filter
        cur.execute("SELECT id, vegetable, days_to_maturity, transplant_weeks FROM vegetable_maturity WHERE LOWER(vegetable) LIKE %s;", (f"%{query}%",))
        rows = cur.fetchall()
        logging.info(f"Query executed successfully, rows fetched: {len(rows)}")

        plant_list = []
        for row in rows:
            plant = {
                "id": row[0],  # Include the ID in the response
                "vegetable": row[1],
                "days_to_maturity": row[2],
                "transplant_weeks": row[3]
            }
            plant_list.append(plant)

        cur.close()
        conn.close()

        return jsonify({"data": plant_list})

    except Exception as e:
        logging.error(f"Error processing plant search: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add a plant to 'My Plants' list
@app.route('/api/my-plants', methods=['POST'])
def add_to_my_plants():
    logging.info("Add to My Plants route hit")
    try:
        data = request.get_json()
        vegetable_id = data.get('vegetable_id')

        logging.info(f"Attempting to add plant with vegetable_id: {vegetable_id}")

# Check if vegetable_id is None
        if vegetable_id is None:
            logging.error("vegetable_id is None. Cannot proceed.")
            return jsonify({"error": "vegetable_id is missing or None"}), 400

        conn = psycopg2.connect(dbname="planet", user="mdocken", password="tTTFJg3Pla", host="localhost")
        cur = conn.cursor()

        query = "INSERT INTO my_plants (vegetable_id) VALUES (%s);"
        cur.execute(query, (vegetable_id,))
        conn.commit()

        cur.close()
        conn.close()

        logging.info("Plant successfully added to My Plants")

        return jsonify({"message": "Plant added to My Plants"}), 201

    except Exception as e:
        logging.error(f"Error adding plant: {str(e)}")
        return jsonify({"error": str(e)}), 500


# Get all plants from 'My Plants' list
@app.route('/api/my-plants', methods=['GET'])
def get_my_plants():
    try:
        conn = psycopg2.connect(dbname="planet", user="mdocken", password="tTTFJg3Pla", host="localhost")
        cur = conn.cursor()

        query = """
        SELECT my_plants.id, vegetable_maturity.vegetable, vegetable_maturity.days_to_maturity
        FROM my_plants
        JOIN vegetable_maturity ON my_plants.vegetable_id = vegetable_maturity.id;
        """
        cur.execute(query)
        rows = cur.fetchall()

        plant_list = []
        for row in rows:
            plant = {
                "id": row[0],
                "vegetable": row[1],
                "days_to_maturity": row[2]
            }
            plant_list.append(plant)

        cur.close()
        conn.close()

        return jsonify(plant_list)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Celery tasks
@celery.task(name='app.schedule_notification')
def schedule_notification(notification_id):
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

@celery.task(name='app.schedule_sms')
def schedule_sms(phone_number, message):
    try:
        client = plivo.RestClient(os.getenv('PLIVO_AUTH_ID'), os.getenv('PLIVO_AUTH_TOKEN'))
        response = client.messages.create(
            src=os.getenv('PLIVO_PHONE_NUMBER'),
            dst=phone_number,
            text=message
        )
        logging.info(f'SMS sent to {phone_number}: {message}')
    except Exception as e:
        logging.error(f"Error sending SMS: {str(e)}")

# Google Calendar integration
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_credentials():
    creds = None
    if os.path.exists('secrets/token.json'):
        creds = Credentials.from_authorized_user_file('secrets/token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('secrets/credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('secrets/token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

def create_event(summary, description, start_time, end_time):
    try:
        creds = get_credentials()
        service = build('calendar', 'v3', credentials=creds)
        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'America/New_York',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'America/New_York',
            },
        }
        event = service.events().insert(calendarId='primary', body=event).execute()
        logging.info('Event created: %s' % (event.get('htmlLink')))
        return event
    except Exception as e:
        logging.error(f"An error occurred while creating the event: {str(e)}")
        return None

def update_event(event_id, summary, description, start_time, end_time):
    try:
        creds = get_credentials()
        service = build('calendar', 'v3', credentials=creds)
        event = service.events().get(calendarId='primary', eventId=event_id).execute()
        event['summary'] = summary
        event['description'] = description
        event['start'] = {'dateTime': start_time.isoformat(), 'timeZone': 'America/New_York'}
        event['end'] = {'dateTime': end_time.isoformat(), 'timeZone': 'America/New_York'}
        updated_event = service.events().update(calendarId='primary', eventId=event['id'], body=event).execute()
        logging.info('Event updated: %s' % (updated_event.get('htmlLink')))
        return updated_event
    except Exception as e:
        logging.error(f"An error occurred while updating the event: {str(e)}")
        return None

def delete_event(event_id):
    creds = get_credentials()
    service = build('calendar', 'v3', credentials=creds)
    try:
        service.events().delete(calendarId='primary', eventId=event_id).execute()
        logging.info(f'Event deleted: {event_id}')
    except Exception as e:
        logging.error(f'Error deleting event: {event_id} - {e}')

def send_sms(phone_number, message):
    try:
        response = client.messages.create(
            src=PLIVO_PHONE_NUMBER,
            dst=phone_number,
            text=message
        )
        logging.info(f"SMS sent: {response.message_uuid}")
    except Exception as e:
        logging.error(f"Error sending SMS: {str(e)}")

if __name__ == '__main__':
    if not os.path.exists('secrets'):
        os.makedirs('secrets')
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s', handlers=[logging.FileHandler("app.log"), logging.StreamHandler()])
    app.run(debug=True)

