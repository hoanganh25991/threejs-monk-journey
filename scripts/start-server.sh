#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js to run this server."
    echo "Visit https://nodejs.org/ to download and install Node.js."
    exit 1
fi

# Start the server
echo "Starting local development server..."
node server.js

# This line will only be reached if the server stops
echo "Server stopped."