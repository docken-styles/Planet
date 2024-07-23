# src/app/google_calendar.py
import os
import logging
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

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
    creds = get_credentials()
    service = build('calendar', 'v3', credentials=creds)
    event = {
        'summary': summary,
        'description': description,
        'start': {
            'dateTime': start_time.isoformat(),
            'timeZone': 'America/Los_Angeles',
        },
        'end': {
            'dateTime': end_time.isoformat(),
            'timeZone': 'America/Los_Angeles',
        },
    }
    event = service.events().insert(calendarId='primary', body=event).execute()
    logging.info(f'Event created: {event.get("htmlLink")}')
    return event
