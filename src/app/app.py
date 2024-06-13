#!/usr/bin/env python3
from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

conn = psycopg2.connect(
    dbname="planet",
    user="mdocken",
    password="@tTTFJ#g3Pla",
    host="localhost"
)
cursor = conn.cursor(cursor_factory=RealDictCursor)


@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    cursor.execute("SELECT * FROM notifications")
    notifications = cursor.fetchall()
    return jsonify(notifications)


@app.route('/api/notifications', methods=['POST'])
def create_notification():
    new_notification = request.json
    cursor.execute(
        "INSERT INTO notifications (title, message, time) VALUES (%s, %s, %s) RETURNING *",
        (new_notification['title'], new_notification['message'], new_notification['time'])
    )
    notification = cursor.fetchone()
    conn.commit()
    return jsonify(notification)


@app.route('/api/notifications/<int:id>', methods=['DELETE'])
def delete_notification(id):
    cursor.execute("DELETE FROM notifications WHERE id = %s RETURNING *", (id,))
    notification = cursor.fetchone()
    conn.commit()
    return jsonify(notification)


if __name__ == '__main__':
    app.run(debug=True)

