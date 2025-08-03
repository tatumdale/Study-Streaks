#!/bin/bash

# StudyStreaks Development Environment Startup Script
# Usage: ./start.sh [services...]
# Examples:
#   ./start.sh                    # Start core services (postgres, redis)
#   ./start.sh api                # Start core + API services
#   ./start.sh api background     # Start core + API + background services

set -e

echo "🚀 Starting StudyStreaks Development Environment"

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
echo "    Database: studystreaks_dev"
echo "    User: dev"
echo "    Password: devpass123"
echo ""
echo "  Redis: localhost:6379"
echo "    Password: devpass123"
echo ""
echo "  Redis Commander (UI): http://localhost:8081"
echo "    User: admin / Password: admin"
echo ""

if [[ "$*" == *"api"* ]]; then
    echo "  API Service: http://localhost:3001"
    echo ""
fi

echo "🛠️  To stop services: docker compose down"
echo "🗑️  To reset data: docker compose down -v"