#!/bin/bash

echo "🧹 Cleaning up backup files..."

# Show what we're about to delete
echo "📋 Found these backup files:"
find . -name "*.bak*" -type f | sort

echo ""
read -p "❓ Delete all these backup files? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Count files before deletion
    count=$(find . -name "*.bak*" -type f | wc -l)
    
    if [[ $count -gt 0 ]]; then
        echo "🗑️  Deleting $count backup files..."
        
        # Delete all .bak files (including .bak.2, .bak.3, etc.)
        find . -name "*.bak*" -type f -delete
        
        echo "✅ Deleted $count backup files!"
    else
        echo "ℹ️  No backup files found to delete."
    fi
else
    echo "❌ Cleanup cancelled. Backup files preserved."
fi

echo ""
echo "📊 Remaining backup files:"
remaining=$(find . -name "*.bak*" -type f | wc -l)
if [[ $remaining -eq 0 ]]; then
    echo "  ✅ No backup files remaining"
else
    echo "  📁 $remaining backup files still present"
    find . -name "*.bak*" -type f | head -5
    if [[ $remaining -gt 5 ]]; then
        echo "  ... and $((remaining - 5)) more"
    fi
fi