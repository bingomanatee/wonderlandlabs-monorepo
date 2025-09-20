#!/bin/bash

# Forestry4 Docs - Snippet Sync Script
# Syncs code snippets from working source files based on configuration

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/snippet-config.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if config file exists
if [[ ! -f "$CONFIG_FILE" ]]; then
    log_error "Configuration file not found: $CONFIG_FILE"
    log_info "Creating example configuration file..."
    
    cat > "$CONFIG_FILE" << 'EOF'
{
  "snippets": [
    {
      "name": "demoStoreFactory",
      "description": "Demo store factory for LiveDemo component",
      "source": "apps/forestry4-docs/src/storeFactories/demoStoreFactory.ts",
      "target": "apps/forestry4-docs/src/snippets/demoStoreFactory.ts",
      "extractMode": "full",
      "language": "typescript"
    },
    {
      "name": "useForestryLocal-hook",
      "description": "useForestryLocal hook implementation",
      "source": "apps/forestry4-docs/src/hooks/useForestryLocal.ts",
      "target": "apps/forestry4-docs/src/snippets/useForestryLocal.ts",
      "extractMode": "full",
      "language": "typescript"
    },
    {
      "name": "todoStore-actions",
      "description": "Todo store actions from TodoApp demo",
      "source": "apps/forestry4-docs/src/storeFactories/todoStoreFactory.ts",
      "target": "apps/forestry4-docs/src/snippets/todoStore-actions.ts",
      "extractMode": "section",
      "startMarker": "actions: {",
      "endMarker": "},",
      "language": "typescript"
    },
    {
      "name": "react-integration-pattern",
      "description": "React component integration pattern",
      "source": "apps/forestry4-docs/src/components/examples/TodoAppDemo.tsx",
      "target": "apps/forestry4-docs/src/snippets/react-integration.tsx",
      "extractMode": "function",
      "functionName": "TodoAppDemo",
      "language": "typescript"
    }
  ]
}
EOF
    
    log_success "Created example configuration at: $CONFIG_FILE"
    log_info "Edit the configuration file and run the script again."
    exit 0
fi

# Parse JSON config (requires jq)
if ! command -v jq &> /dev/null; then
    log_error "jq is required but not installed. Please install jq to use this script."
    log_info "On macOS: brew install jq"
    log_info "On Ubuntu: sudo apt-get install jq"
    exit 1
fi

# Function to extract full file
extract_full() {
    local source_file="$1"
    local target_file="$2"
    
    if [[ -f "$source_file" ]]; then
        cp "$source_file" "$target_file"
        return 0
    else
        log_error "Source file not found: $source_file"
        return 1
    fi
}

# Function to extract section between markers
extract_section() {
    local source_file="$1"
    local target_file="$2"
    local start_marker="$3"
    local end_marker="$4"
    
    if [[ ! -f "$source_file" ]]; then
        log_error "Source file not found: $source_file"
        return 1
    fi
    
    # Extract section between markers
    sed -n "/$start_marker/,/$end_marker/p" "$source_file" > "$target_file"
    
    if [[ ! -s "$target_file" ]]; then
        log_error "No content extracted between markers '$start_marker' and '$end_marker'"
        return 1
    fi
    
    return 0
}

# Function to extract specific function
extract_function() {
    local source_file="$1"
    local target_file="$2"
    local function_name="$3"
    
    if [[ ! -f "$source_file" ]]; then
        log_error "Source file not found: $source_file"
        return 1
    fi
    
    # Extract function (basic implementation - may need refinement for complex cases)
    awk "
    /^(export )?const $function_name|^(export )?function $function_name|^(export )?$function_name.*=/ {
        print
        brace_count = 0
        in_function = 1
        next
    }
    in_function {
        print
        # Count braces to find function end
        for (i = 1; i <= length(\$0); i++) {
            char = substr(\$0, i, 1)
            if (char == \"{\") brace_count++
            if (char == \"}\") brace_count--
        }
        if (brace_count <= 0 && in_function) {
            in_function = 0
            exit
        }
    }
    " "$source_file" > "$target_file"
    
    if [[ ! -s "$target_file" ]]; then
        log_error "Function '$function_name' not found or extracted"
        return 1
    fi
    
    return 0
}

# Main sync function
sync_snippet() {
    local config="$1"
    
    local name=$(echo "$config" | jq -r '.name')
    local description=$(echo "$config" | jq -r '.description')
    local source=$(echo "$config" | jq -r '.source')
    local target=$(echo "$config" | jq -r '.target')
    local extract_mode=$(echo "$config" | jq -r '.extractMode')
    local language=$(echo "$config" | jq -r '.language // "typescript"')
    
    # Convert relative paths to absolute
    local source_path="$PROJECT_ROOT/$source"
    local target_path="$PROJECT_ROOT/$target"
    
    log_info "Syncing snippet: $name"
    log_info "  Description: $description"
    log_info "  Source: $source"
    log_info "  Target: $target"
    log_info "  Mode: $extract_mode"
    
    # Create target directory if it doesn't exist
    mkdir -p "$(dirname "$target_path")"
    
    # Extract based on mode
    case "$extract_mode" in
        "full")
            if extract_full "$source_path" "$target_path"; then
                log_success "  ✓ Full file copied"
            else
                log_error "  ✗ Failed to copy full file"
                return 1
            fi
            ;;
        "section")
            local start_marker=$(echo "$config" | jq -r '.startMarker')
            local end_marker=$(echo "$config" | jq -r '.endMarker')
            
            if extract_section "$source_path" "$target_path" "$start_marker" "$end_marker"; then
                log_success "  ✓ Section extracted between '$start_marker' and '$end_marker'"
            else
                log_error "  ✗ Failed to extract section"
                return 1
            fi
            ;;
        "function")
            local function_name=$(echo "$config" | jq -r '.functionName')
            
            if extract_function "$source_path" "$target_path" "$function_name"; then
                log_success "  ✓ Function '$function_name' extracted"
            else
                log_error "  ✗ Failed to extract function"
                return 1
            fi
            ;;
        *)
            log_error "  ✗ Unknown extract mode: $extract_mode"
            return 1
            ;;
    esac
    
    # Add header comment to target file
    local temp_file=$(mktemp)
    cat > "$temp_file" << EOF
// Auto-generated snippet from: $source
// Description: $description
// Last synced: $(date)
// DO NOT EDIT - This file is automatically synced from the source

EOF
    cat "$target_path" >> "$temp_file"
    mv "$temp_file" "$target_path"
    
    log_success "  ✓ Added sync header"
    echo
}

# Main execution
main() {
    log_info "Starting snippet sync process..."
    log_info "Project root: $PROJECT_ROOT"
    log_info "Config file: $CONFIG_FILE"
    echo
    
    local total_snippets=$(jq '.snippets | length' "$CONFIG_FILE")
    local success_count=0
    local error_count=0
    
    log_info "Found $total_snippets snippets to sync"
    echo
    
    # Process each snippet
    for i in $(seq 0 $((total_snippets - 1))); do
        local snippet_config=$(jq ".snippets[$i]" "$CONFIG_FILE")
        
        if sync_snippet "$snippet_config"; then
            ((success_count++))
        else
            ((error_count++))
        fi
    done
    
    echo
    log_info "Sync completed!"
    log_success "Successfully synced: $success_count snippets"
    
    if [[ $error_count -gt 0 ]]; then
        log_error "Failed to sync: $error_count snippets"
        exit 1
    else
        log_success "All snippets synced successfully! 🎉"
    fi
}

# Show help
show_help() {
    cat << EOF
Forestry4 Docs - Snippet Sync Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    -h, --help      Show this help message
    -c, --config    Specify custom config file path
    --dry-run       Show what would be synced without making changes

EXAMPLES:
    $0                              # Sync all snippets using default config
    $0 -c custom-config.json        # Use custom config file
    $0 --dry-run                    # Preview what would be synced

CONFIG FILE FORMAT:
    The config file should be a JSON file with the following structure:
    {
      "snippets": [
        {
          "name": "snippet-name",
          "description": "Description of the snippet",
          "source": "path/to/source/file.ts",
          "target": "path/to/target/snippet.ts",
          "extractMode": "full|section|function",
          "language": "typescript|javascript|jsx|tsx",
          
          // For section mode:
          "startMarker": "start pattern",
          "endMarker": "end pattern",
          
          // For function mode:
          "functionName": "functionName"
        }
      ]
    }

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        --dry-run)
            log_warning "Dry run mode not implemented yet"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main
