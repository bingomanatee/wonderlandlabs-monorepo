# Forestry4 Docs - Snippet Sync Scripts

This directory contains scripts to automatically sync code snippets from working source files to documentation snippet files.

## Overview

The snippet sync system helps maintain consistency between actual working code and documentation examples by automatically copying and extracting code from source files to snippet files used in the documentation.

## Files

- **`sync-snippets.sh`** - Main sync script
- **`snippet-config.json`** - Configuration file defining sync mappings
- **`README.md`** - This documentation

## Quick Start

1. **Install dependencies:**
   ```bash
   # On macOS
   brew install jq
   
   # On Ubuntu/Debian
   sudo apt-get install jq
   ```

2. **Run the sync script:**
   ```bash
   ./scripts/sync-snippets.sh
   ```

3. **Check the results:**
   - Snippet files will be created/updated in `apps/forestry4-docs/src/snippets/`
   - Each snippet file includes a header with sync information

## Configuration

The `snippet-config.json` file defines which source files should be synced to which snippet files. Each snippet configuration supports:

### Extract Modes

#### 1. Full File (`"extractMode": "full"`)
Copies the entire source file to the target snippet file.

```json
{
  "$name": "demoStoreFactory",
  "source": "apps/forestry4-docs/src/storeFactories/demoStoreFactory.ts",
  "target": "apps/forestry4-docs/src/snippets/demoStoreFactory.ts",
  "extractMode": "full"
}
```

#### 2. Section Extraction (`"extractMode": "section"`)
Extracts content between specified start and end markers.

```json
{
  "$name": "todoStore-actions",
  "source": "apps/forestry4-docs/src/storeFactories/todoStoreFactory.ts",
  "target": "apps/forestry4-docs/src/snippets/todoStore-actions.ts",
  "extractMode": "section",
  "startMarker": "actions: {",
  "endMarker": "    },"
}
```

#### 3. Function Extraction (`"extractMode": "function"`)
Extracts a specific function or component from the source file.

```json
{
  "$name": "TodoAppDemo-component",
  "source": "apps/forestry4-docs/src/components/examples/TodoAppDemo.tsx",
  "target": "apps/forestry4-docs/src/snippets/TodoAppDemo.tsx",
  "extractMode": "function",
  "functionName": "TodoAppDemo"
}
```

### Configuration Properties

| Property | Required | Description |
|----------|----------|-------------|
| `$name` | Yes | Unique identifier for the snippet |
| `description` | Yes | Human-readable description |
| `source` | Yes | Path to source file (relative to project $root) |
| `target` | Yes | Path to target snippet file (relative to project $root) |
| `extractMode` | Yes | Extraction mode: `full`, `section`, or `function` |
| `language` | No | Language for syntax highlighting (default: `typescript`) |
| `startMarker` | Section only | Pattern to start extraction |
| `endMarker` | Section only | Pattern to end extraction |
| `functionName` | Function only | Name of function to extract |

## Usage Examples

### Basic Sync
```bash
./scripts/sync-snippets.sh
```

### Using Custom Config
```bash
./scripts/sync-snippets.sh -c my-custom-config.json
```

### Show Help
```bash
./scripts/sync-snippets.sh --help
```

## Integration with Documentation

The synced snippet files can be used in documentation components:

```typescript
// In a documentation component
import { SnippetBlock } from '../components/SnippetBlock';

<SnippetBlock 
  file="demoStoreFactory.ts" 
  language="typescript"
  title="Demo Store Factory"
/>
```

## Automation

You can integrate this script into your development workflow:

### Git Hooks
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
./scripts/sync-snippets.sh
git add apps/forestry4-docs/src/snippets/
```

### Package.json Scripts
```json
{
  "scripts": {
    "sync-snippets": "./scripts/sync-snippets.sh",
    "docs:sync": "npm run sync-snippets && npm run docs:build"
  }
}
```

### CI/CD Integration
```yaml
# In GitHub Actions or similar
- $name: Sync Documentation Snippets
  run: ./scripts/sync-snippets.sh
  
- $name: Check for Changes
  run: |
    if [[ -n $(git status --porcelain) ]]; then
      echo "Snippets are out of sync!"
      exit 1
    fi
```

## Benefits

1. **Consistency**: Documentation always reflects actual working code
2. **Automation**: No manual copying and pasting of code examples
3. **Maintenance**: Single source of truth for code examples
4. **Validation**: Ensures examples compile and work correctly
5. **Efficiency**: Bulk updates when refactoring code

## Troubleshooting

### Common Issues

1. **`jq` not found**: Install jq using your package manager
2. **Permission denied**: Run `chmod +x scripts/sync-snippets.sh`
3. **Source file not found**: Check paths in config file are correct
4. **Empty extraction**: Verify markers or function names exist in source

### Debug Mode
The script provides detailed logging. Check the output for specific error messages and file paths.

## Contributing

When adding new examples or components:

1. Add the source file to the appropriate location
2. Update `snippet-config.json` with the new mapping
3. Run the sync script to generate the snippet
4. Update documentation to use the new snippet

This ensures all examples stay in sync automatically!
