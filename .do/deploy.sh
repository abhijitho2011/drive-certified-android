#!/bin/bash

# DigitalOcean Deployment Script
# This script helps deploy the Driver Certification Platform to DigitalOcean

set -e

echo "🚀 DigitalOcean Deployment Helper"
echo "=================================="
echo ""

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl CLI not found"
    echo "📦 Install it from: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if logged in
if ! doctl auth list &> /dev/null; then
    echo "🔐 Please login to DigitalOcean:"
    doctl auth init
fi

echo "✅ Authenticated with DigitalOcean"
echo ""

# Get database connection string
echo "📊 Fetching database connection details..."
DB_ID=$(doctl databases list --format ID,Name --no-header | grep "drive-certified-db" | awk '{print $1}')

if [ -z "$DB_ID" ]; then
    echo "❌ Database 'drive-certified-db' not found"
    echo "💡 Create it first:"
    echo "   doctl databases create drive-certified-db --engine pg --version 15 --region blr1 --size db-s-1vcpu-1gb"
    exit 1
fi

echo "✅ Found database: $DB_ID"

# Get connection details
DB_URI=$(doctl databases connection $DB_ID --format URI --no-header)
echo "📝 Database URI: $DB_URI"
echo ""

# Check if app exists
echo "🔍 Checking for existing app..."
APP_ID=$(doctl apps list --format ID,Spec.Name --no-header | grep "drive-certified" | awk '{print $1}')

if [ -z "$APP_ID" ]; then
    echo "📱 Creating new app..."
    doctl apps create --spec .do/app.yaml
    echo "✅ App created successfully!"
else
    echo "📱 Updating existing app: $APP_ID"
    doctl apps update $APP_ID --spec .do/app.yaml
    echo "✅ App updated successfully!"
fi

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "📊 Monitor deployment:"
echo "   doctl apps list"
echo "   doctl apps logs <APP_ID> --follow"
echo ""
echo "🌐 View in browser:"
echo "   https://cloud.digitalocean.com/apps"
echo ""
