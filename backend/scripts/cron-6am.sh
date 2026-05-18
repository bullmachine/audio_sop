#!/bin/bash

# Production Data Sync Script - Runs daily at 6 AM (06:00)
# No authentication required - calls system endpoint

PROJECT_DIR="/path/to/your/backend"
LOG_FILE="$PROJECT_DIR/logs/cron-sync.log"

# Load environment variables from .env file
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

# Build API URL from environment variables
SERVER_HOST="${HOST:-localhost}"
SERVER_PORT="${PORT:-5000}"
API_URL="http://${SERVER_HOST}:${SERVER_PORT}/api/system-cron/sync"
HEALTH_URL="http://${SERVER_HOST}:${SERVER_PORT}/api/system-cron/health"

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Log function
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_message "Starting 6 AM production data sync..."
log_message "Using API URL: $API_URL"

# Check if server is running
if ! curl -s --connect-timeout 5 "$HEALTH_URL" > /dev/null; then
    log_message "ERROR: Server not running at $HEALTH_URL"
    exit 1
fi

# Trigger the sync
RESPONSE=$(curl -s -w '\n%{http_code}' -X POST "$API_URL" -H "Content-Type: application/json" -d '{}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

log_message "HTTP Status: $HTTP_CODE"
log_message "Response: $RESPONSE_BODY"

if [ "$HTTP_CODE" -eq 200 ]; then
    log_message "6 AM production data sync completed successfully"
    exit 0
else
    log_message "ERROR: 6 AM production data sync failed. HTTP Code: $HTTP_CODE"
    exit 1
fi
