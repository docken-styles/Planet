# src/app/models.py
from . import db

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    message = db.Column(db.String(250), nullable=False)
    time = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f'<Notification {self.title}>'

