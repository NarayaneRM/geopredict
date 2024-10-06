#!/bin/bash

usage() {
    echo "Usage: ./run.sh [command]"
    echo "Available commands:"
    echo "  setup         - Set up the complete environment (backend and frontend)"
    echo "  run           - Run backend and frontend simultaneously"
    echo "  run-backend   - Run only the backend"
    echo "  run-frontend  - Run only the frontend"
    echo "  install       - Install dependencies only (backend and frontend)"
    echo "  clean         - Clean generated files"
}

install_backend() {
    echo "Installing backend dependencies..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
}

install_frontend() {
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
}

install() {
    install_backend
    install_frontend
    echo "All dependencies have been installed."
}

run_backend() {
    echo "Starting the backend..."
    cd backend
    source venv/bin/activate
    python3 main.py
    cd ..
}

run_frontend() {
    echo "Starting the frontend..."
    cd frontend
    npm start
    cd ..
}

clean() {
    echo "Cleaning generated files..."
    rm -rf backend/venv
    rm -rf frontend/node_modules
    echo "Cleanup completed."
}

case "$1" in
    setup)
        install
        ;;
    run)
        run_backend &
        run_frontend &
        wait
        ;;
    run-backend)
        run_backend
        ;;
    run-frontend)
        run_frontend
        ;;
    install)
        install
        ;;
    clean)
        clean
        ;;
    *)
        usage
        exit 1
        ;;
esac