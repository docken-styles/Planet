# google_calendar.py

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from flask import session, request, redirect
import datetime

def credentials_to_dict(credentials):
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }

def add_event_to_google_calendar(title, description, start_time):
    try:
        credentials = Credentials(**session['credentials'])
        service = build('calendar', 'v3', credentials=credentials)
        event = {
            'summary': title,
            'description': description,
            'start': {'dateTime': start_time.isoformat(), 'timeZone': 'UTC'},
            'end': {'dateTime': (start_time + datetime.timedelta(hours=1)).isoformat(), 'timeZone': 'UTC'},
        }
        event = service.events().insert(calendarId='primary', body=event).execute()
        print('Event created: %s' % (event.get('htmlLink')))
    except HttpError as error:
        print(f'An error occurred: {error}')
        event = None
    return event

def delete_event_from_google_calendar(event_id):
    try:
        credentials = Credentials(**session['credentials'])
        service = build('calendar', 'v3', credentials=credentials)
        service.events().delete(calendarId='primary', eventId=event_id).execute()
        print(f'Event {event_id} deleted from Google Calendar')
    except HttpError as error:
        print(f'An error occurred: {error}')

def authorize():
    flow = Flow.from_client_secrets_file(
        'path/to/your/credentials.json',
        scopes=['https://www.googleapis.com/auth/calendar'],
        redirect_uri='http://localhost:5000/oauth2callback'
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session['state'] = state
    return redirect(authorization_url)

def oauth2callback():
    flow = Flow.from_client_secrets_file(
        'path/to/your/credentials.json',
        scopes=['https://www.googleapis.com/auth/calendar'],
        state=session['state']
    )
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials
    session['credentials'] = credentials_to_dict(credentials)
    return redirect('/')

