#!/bin/bash

# Script to replace complex styled Text components with textStyle props

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Starting Text component style updates..."

# Find all TypeScript/TSX files that contain Text components with complex styling
FILES=$(find apps/forestry4-docs/src -name "*.tsx" -exec grep -l "Text.*fontSize.*color\|Text.*color.*fontSize" {} \;)

for file in $FILES; do
    echo -e "${BLUE}[INFO]${NC} Processing: $file"
    
    # Skip if file doesn't exist
    if [[ ! -f "$file" ]]; then
        continue
    fi
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Replace common patterns
    # Pattern 1: fontSize="sm" color="gray.600" -> textStyle="description"
    sed -i.tmp 's/fontSize="sm" color="gray\.600"/textStyle="description"/g' "$file"
    sed -i.tmp 's/color="gray\.600" fontSize="sm"/textStyle="description"/g' "$file"
    
    # Pattern 2: fontSize="lg" color="gray.600" -> textStyle="hero" (but preserve other props)
    # This is more complex, so we'll handle it manually for now
    
    # Pattern 3: color="gray.600" mb={4} -> textStyle="body" (but preserve other props)
    # This is also complex, so we'll handle it manually
    
    # Clean up temporary files
    rm -f "$file.tmp"
    
    # Check if file was actually changed
    if ! diff -q "$file" "$file.backup" > /dev/null 2>&1; then
        echo -e "${GREEN}[SUCCESS]${NC} Updated $file"
        rm "$file.backup"
    else
        echo -e "${BLUE}[INFO]${NC} No changes needed for $file"
        mv "$file.backup" "$file"
    fi
done

echo -e "${GREEN}[SUCCESS]${NC} Text style updates completed!"
echo -e "${BLUE}[INFO]${NC} Common patterns like fontSize='sm' color='gray.600' have been replaced with textStyle='description'"
