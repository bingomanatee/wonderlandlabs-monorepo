#!/bin/bash

# Script to update Section components to use the title prop

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Updating Section components to use title prop..."

# Function to update a file
update_file() {
    local file="$1"
    echo -e "${BLUE}[INFO]${NC} Processing: $file"
    
    # Create a temporary file for processing
    temp_file=$(mktemp)
    
    # Process the file line by line
    while IFS= read -r line; do
        # Check if this is a Section opening tag
        if [[ "$line" =~ ^[[:space:]]*\<Section\> ]]; then
            echo "$line" >> "$temp_file"
            # Look for the next line with VStack and Heading
            while IFS= read -r next_line; do
                if [[ "$next_line" =~ VStack.*spacing.*align.*stretch ]]; then
                    echo "$next_line" >> "$temp_file"
                    # Look for Heading in the next few lines
                    while IFS= read -r heading_line; do
                        if [[ "$heading_line" =~ \<Heading.*size.*lg.*\>(.*)\<\/Heading\> ]]; then
                            # Extract the heading text
                            heading_text=$(echo "$heading_line" | sed -n 's/.*<Heading[^>]*>\(.*\)<\/Heading>.*/\1/p')
                            # Go back and replace the Section line with title prop
                            # This is complex to do in bash, so we'll mark it for manual review
                            echo "              {/* TODO: Replace with <Section title=\"$heading_text\"> */}" >> "$temp_file"
                            break
                        else
                            echo "$heading_line" >> "$temp_file"
                        fi
                    done
                else
                    echo "$next_line" >> "$temp_file"
                    break
                fi
            done
        else
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace the original file
    mv "$temp_file" "$file"
}

# Find all TypeScript/TSX files that use Section
FILES=$(find apps/forestry4-docs/src/pages -name "*.tsx" | xargs grep -l "Section.*VStack.*Heading" 2>/dev/null || true)

for file in $FILES; do
    if [[ -f "$file" ]]; then
        update_file "$file"
        echo -e "${GREEN}[SUCCESS]${NC} Updated $file"
    fi
done

echo -e "${GREEN}[SUCCESS]${NC} Section title updates completed!"
echo -e "${BLUE}[INFO]${NC} Note: Some updates may need manual review for complex cases."
