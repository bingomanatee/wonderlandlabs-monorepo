#!/bin/bash

# Script to replace Card/CardBody with Section component across the codebase

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Starting Card/CardBody to Section replacement..."

# Find all TypeScript/TSX files that contain Card imports or usage
FILES=$(find apps/forestry4-docs/src -name "*.tsx" -o -name "*.ts" | xargs grep -l "Card" | grep -v node_modules | grep -v Section.tsx)

for file in $FILES; do
    echo -e "${BLUE}[INFO]${NC} Processing: $file"
    
    # Skip if file doesn't exist
    if [[ ! -f "$file" ]]; then
        continue
    fi
    
    # Check if file contains Card imports
    if grep -q "import.*Card" "$file"; then
        echo -e "${BLUE}[INFO]${NC}   Updating imports in $file"
        
        # Remove Card and CardBody from imports, add Section
        sed -i.bak 's/Card,//g; s/CardBody,//g; s/,Card//g; s/,CardBody//g' "$file"
        
        # Add Section import if not already present
        if ! grep -q "import.*Section" "$file"; then
            # Find the line with component imports and add Section
            sed -i.bak '/import.*from.*@chakra-ui\/react/a\
import Section from '\''../components/Section'\'';' "$file"
        fi
    fi
    
    # Replace Card/CardBody patterns with Section
    sed -i.bak 's/<Card>/<Section>/g; s/<\/Card>/<\/Section>/g' "$file"
    sed -i.bak 's/<CardBody[^>]*>/<>/g; s/<\/CardBody>/<\/>/g' "$file"
    
    # Clean up any empty fragments that might have been created
    sed -i.bak 's/<><\/>//g' "$file"
    
    # Remove backup files
    rm -f "$file.bak"
    
    echo -e "${GREEN}[SUCCESS]${NC}   Updated $file"
done

echo -e "${GREEN}[SUCCESS]${NC} Card/CardBody to Section replacement completed!"
