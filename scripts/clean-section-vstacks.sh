#!/bin/bash

# Script to clean up redundant VStack wrappers in Section components
# Now that Section automatically includes VStack, we can remove manual ones

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Cleaning up redundant VStack wrappers in Section components..."

# Find all TypeScript/TSX files that use Section
FILES=$(find apps/forestry4-docs/src -name "*.tsx" | xargs grep -l "Section.*title" 2>/dev/null || true)

for file in $FILES; do
    if [[ -f "$file" ]]; then
        echo -e "${BLUE}[INFO]${NC} Processing: $file"
        
        # Create a backup
        cp "$file" "$file.backup"
        
        # Remove redundant VStack patterns after Section with title
        # Pattern: Section title="..." followed by VStack spacing={6} align="stretch"
        sed -i.tmp '
        # Look for Section with title followed by VStack
        /Section title=.*>/ {
            N
            N
            s/\(Section title=[^>]*>\)\n[[:space:]]*<VStack spacing={6} align="stretch">/\1/
        }
        # Remove closing VStack tags that are now redundant
        /^[[:space:]]*<\/VStack>[[:space:]]*$/d
        ' "$file"
        
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
    fi
done

echo -e "${GREEN}[SUCCESS]${NC} VStack cleanup completed!"
echo -e "${BLUE}[INFO]${NC} Section components now automatically include VStack with spacing={6} align='stretch'"
echo -e "${BLUE}[INFO]${NC} Use noVStack={true} prop if you need to opt out of automatic VStack wrapping"
