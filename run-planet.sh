#!/bin/bash

# Set the environment variable
echo "Setting environment variable..."
export DATABASE_PASSWORD="your_database_password"

# Start Redis server
echo "Starting Redis server..."
sudo service redis-server start
if [ $? -ne 0 ]; then
    echo "Failed to start Redis server"
    exit 1
fi

# Start Flask server
echo "Starting Flask server..."
cd ~/Planet/src/app || { echo "Failed to change directory to ~/Planet/src/app"; exit 1; }
flask run &
FLASK_PID=$!

if [ $? -ne 0 ]; then
    echo "Failed to start Flask server"
    exit 1
fi

# Start Celery worker
echo "Starting Celery worker..."
celery -A app.celery worker --loglevel=info &
CELERY_PID=$!

if [ $? -ne 0 ]; then
    echo "Failed to start Celery worker"
    exit 1
fi

# Start Angular development server
echo "Starting Angular development server..."
cd ~/Planet || { echo "Failed to change directory to ~/Planet"; exit 1; }
ng serve &
ANGULAR_PID=$!

if [ $? -ne 0 ]; then
    echo "Failed to start Angular development server"
    exit 1
fi

# Wait for processes to finish
echo "Flask server PID: $FLASK_PID"
echo "Celery worker PID: $CELERY_PID"
echo "Angular development server PID: $ANGULAR_PID"

# Function to clean up background processes
cleanup() {
    echo "Stopping Flask server..."
    kill $FLASK_PID

    echo "Stopping Celery worker..."
    kill $CELERY_PID

    echo "Stopping Angular development server..."
    kill $ANGULAR_PID
}

# Trap EXIT signal to clean up background processes
trap cleanup EXIT

# Wait for all background processes to finish
wait $FLASK_PID $CELERY_PID $ANGULAR_PID

