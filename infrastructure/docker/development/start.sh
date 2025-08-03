#!/bin/bash

# StudyStreaks Development Environment Startup Script
# Usage: ./start.sh [services...]
# Examples:
#   ./start.sh                    # Start core services (postgres, redis)
#   ./start.sh api                # Start core + API services
#   ./start.sh api background     # Start core + API + background services

set -e

echo "🚀 Starting StudyStreaks Development Environment"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "   Copy .env.example to .env and configure your passwords:"
    echo "   cp .env.example .env"
    echo ""
    echo "   Using default values for now (NOT recommended for production-like environments)"
    echo ""
fi

# Default to core services
SERVICES=""

# Check if specific services were requested
if [ $# -eq 0 ]; then
    echo "📦 Starting core services (PostgreSQL, Redis, Redis Commander)"
    SERVICES="postgres redis redis-commander"
else
    echo "📦 Starting core services + $@"
    SERVICES="postgres redis redis-commander"
    for service in "$@"; do
        SERVICES="$SERVICES --profile $service"
    done
fi

# Start services
echo "🔄 Running: docker compose up -d $SERVICES"
docker compose up -d $SERVICES

# Wait for health checks
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check service health
echo "🔍 Checking service health:"
docker compose ps

# Show connection information
echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📊 Service URLs:"
echo "  PostgreSQL: localhost:5432"
echo "    Database: ${POSTGRES_DB:-studystreaks_dev}"
echo "    User: ${POSTGRES_USER:-dev}"
echo "    Password: [configured via .env file]"
echo ""
echo "  Redis: localhost:6379"
echo "    Password: [configured via .env file]"
echo ""
echo "  Redis Commander (UI): http://localhost:8081"
echo "    Credentials: [configured via .env file]"
echo ""

if [[ "$*" == *"api"* ]]; then
    echo "  API Service: http://localhost:3001"
    echo ""
fi

echo "🛠️  To stop services: docker compose down"
echo "🗑️  To reset data: docker compose down -v"