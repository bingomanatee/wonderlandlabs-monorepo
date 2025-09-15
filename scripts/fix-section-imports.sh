#!/bin/bash

# Script to fix Section import paths and clean up syntax issues

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Fixing Section import paths..."

# Fix import paths for different directory levels
find apps/forestry4-docs/src/pages -name "*.tsx" -exec sed -i.bak 's|import Section from '\''../components/Section'\'';|import Section from '\''../components/Section'\'';|g' {} \;
find apps/forestry4-docs/src/components -name "*.tsx" -exec sed -i.bak 's|import Section from '\''../components/Section'\'';|import Section from '\''../Section'\'';|g' {} \;
find apps/forestry4-docs/src/components/*/ -name "*.tsx" -exec sed -i.bak 's|import Section from '\''../components/Section'\'';|import Section from '\''../../Section'\'';|g' {} \;

# Clean up any malformed imports
find apps/forestry4-docs/src -name "*.tsx" -exec sed -i.bak 's|import Section from '\''../components/Section'\'';import|import Section from '\''../Section'\'';\nimport|g' {} \;

# Remove any leftover Card references that weren't properly replaced
find apps/forestry4-docs/src -name "*.tsx" -exec sed -i.bak 's|<Card[^>]*>|<Section>|g' {} \;
find apps/forestry4-docs/src -name "*.tsx" -exec sed -i.bak 's|</Card>|</Section>|g' {} \;

# Clean up empty fragments
find apps/forestry4-docs/src -name "*.tsx" -exec sed -i.bak 's|<></>||g' {} \;
find apps/forestry4-docs/src -name "*.tsx" -exec sed -i.bak 's|<>||g' {} \;
find apps/forestry4-docs/src -name "*.tsx" -exec sed -i.bak 's|</>||g' {} \;

# Remove backup files
find apps/forestry4-docs/src -name "*.bak" -delete

echo -e "${GREEN}[SUCCESS]${NC} Section import paths fixed!"
