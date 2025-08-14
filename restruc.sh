#!/bin/bash

# Mock Cleanup Script for React Application
# This script removes mock data, mock handlers, and mock clients from your project

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from your project root directory."
    exit 1
fi

print_status "Starting mock cleanup process..."

# Create backup directory
BACKUP_DIR="./mock-backup-$(date +%Y%m%d_%H%M%S)"
print_status "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Files and directories to remove
MOCK_FILES=(
    "src/lib/api/mock-client.js"
    "src/lib/api/mock-handlers"
    "src/mock-data"
)

# Function to backup and remove files/directories
backup_and_remove() {
    local item="$1"
    if [ -e "$item" ]; then
        print_status "Backing up and removing: $item"
        # Create backup
        cp -r "$item" "$BACKUP_DIR/" 2>/dev/null || true
        # Remove original
        rm -rf "$item"
        print_success "Removed: $item"
    else
        print_warning "Not found (skipping): $item"
    fi
}

# Backup and remove mock files
print_status "Removing mock files and directories..."
for item in "${MOCK_FILES[@]}"; do
    backup_and_remove "$item"
done

# Search for potential mock imports that need manual cleanup
print_status "Searching for potential mock imports that need manual cleanup..."

# Find files that might import mock modules
IMPORT_FILES=$(find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | xargs grep -l "mock\|Mock" 2>/dev/null || true)

if [ -n "$IMPORT_FILES" ]; then
    print_warning "Files that may contain mock imports (manual review needed):"
    echo "$IMPORT_FILES" | while read -r file; do
        echo "  - $file"
        # Show the specific lines with mock references
        grep -n "mock\|Mock" "$file" 2>/dev/null | head -3 | while read -r line; do
            echo "    $line"
        done
        echo
    done
else
    print_success "No obvious mock imports found in source files."
fi

# Check for references to mock-client specifically
print_status "Checking for mock-client imports..."
MOCK_CLIENT_REFS=$(find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | xargs grep -l "mock-client\|mockClient" 2>/dev/null || true)

if [ -n "$MOCK_CLIENT_REFS" ]; then
    print_warning "Files referencing mock-client (need to be updated to use real API client):"
    echo "$MOCK_CLIENT_REFS" | while read -r file; do
        echo "  - $file"
    done
else
    print_success "No mock-client references found."
fi

# Check API client configuration
print_status "Checking API client configuration..."
if [ -f "src/lib/api/client.js" ]; then
    if grep -q "mock" "src/lib/api/client.js" 2>/dev/null; then
        print_warning "src/lib/api/client.js contains mock references - manual review needed"
    else
        print_success "src/lib/api/client.js appears clean"
    fi
fi

# Check for environment-based client selection
if [ -f "src/lib/api/index.js" ]; then
    if grep -q "mock" "src/lib/api/index.js" 2>/dev/null; then
        print_warning "src/lib/api/index.js contains mock references - manual review needed"
    fi
fi

# Generate summary report
print_status "Generating cleanup report..."
cat > mock_cleanup_report.txt << EOF
Mock Cleanup Report - $(date)
================================

Removed Files/Directories:
$(for item in "${MOCK_FILES[@]}"; do echo "- $item"; done)

Backup Location: $BACKUP_DIR

Manual Steps Required:
1. Update API client configuration to use production endpoints
2. Remove any remaining mock imports from source files
3. Update environment variables for API endpoints
4. Test all API integrations with real backend
5. Remove mock-related npm dependencies (if any)

Files that may need manual review:
$(if [ -n "$IMPORT_FILES" ]; then echo "$IMPORT_FILES"; else echo "None found"; fi)

Next Steps:
- Review src/lib/api/client.js for proper endpoint configuration
- Update src/lib/config/api.js with production API URLs
- Test authentication flow with real backend
- Verify all API endpoints are properly configured
- Remove any mock-related environment variables

EOF

print_success "Cleanup complete!"
print_status "Report saved to: mock_cleanup_report.txt"
print_status "Backup created at: $BACKUP_DIR"

echo
print_warning "MANUAL STEPS REQUIRED:"
echo "1. Update your API client to use real endpoints"
echo "2. Configure production API URLs in src/lib/config/api.js"
echo "3. Remove any mock imports from your source files"
echo "4. Test all functionality with your real backend"
echo "5. Update environment variables for production"
echo
print_status "Review the generated report (mock_cleanup_report.txt) for detailed next steps."

# Optional: Ask if user wants to see the report
read -p "Would you like to view the cleanup report now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat mock_cleanup_report.txt
fi

print_success "Mock cleanup script completed successfully!"