#!/bin/bash

# Forestry4 Docs Deployment Script
# This script ensures snippets are synced before building for production

set -e  # Exit on any error

echo "🌲 Starting Forestry4 Docs deployment..."

# Navigate to the docs directory
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"

# Sync snippets from the root of the monorepo
echo "🔄 Syncing code snippets..."
cd ../..
./scripts/sync-snippets.sh

# Return to docs directory
cd apps/forestry4-docs

echo "📦 Installing dependencies..."
npm ci

echo "🏗️  Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📂 Output directory: dist/"

# Optional: Preview the build locally
if [ "$1" = "--preview" ]; then
    echo "🔍 Starting preview server..."
    npm run preview
fi
