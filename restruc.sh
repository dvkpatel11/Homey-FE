#!/bin/bash

# Fix Missing Hook Imports
# This script adds the missing import statements to your files

echo "🔧 Fixing missing hook imports..."

# Files that need useTheme import (relative to project root)
THEME_FILES=(
    "src/components/features/tasks/TaskCard.jsx"
    "src/components/features/tasks/TaskFilters.jsx"
    "src/components/features/expenses/ExpenseSummary.jsx"
    "src/components/features/expenses/ExpenseItem.jsx"
    "src/components/layout/AuthLayout.jsx"
)

# Files that need useAuth import
AUTH_FILES=(
    "src/components/features/auth/LoginForm.jsx"
)

# Function to add import if not exists
add_import_if_missing() {
    local file="$1"
    local import_line="$2"
    local hook_name="$3"
    
    if [ ! -f "$file" ]; then
        echo "❌ File not found: $file"
        return 1
    fi
    
    # Check if import already exists
    if grep -q "$hook_name" "$file"; then
        echo "✅ $file already has $hook_name import"
        return 0
    fi
    
    # Find the last import line and add after it
    if grep -q "^import" "$file"; then
        # Get line number of last import
        last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
        
        # Create temp file with new import added
        {
            head -n "$last_import_line" "$file"
            echo "$import_line"
            tail -n +"$((last_import_line + 1))" "$file"
        } > "${file}.tmp"
        
        mv "${file}.tmp" "$file"
        echo "✅ Added $hook_name import to $file"
    else
        # No imports exist, add at the top
        {
            echo "$import_line"
            echo ""
            cat "$file"
        } > "${file}.tmp"
        
        mv "${file}.tmp" "$file"
        echo "✅ Added $hook_name import to $file (at top)"
    fi
}

# Add useTheme imports
for file in "${THEME_FILES[@]}"; do
    # Determine correct path based on file location
    case "$file" in
        *"/features/"*)
            import_line='import { useTheme } from "../../../contexts/ThemeContext.jsx";'
            ;;
        *"/layout/"*)
            import_line='import { useTheme } from "../../contexts/ThemeContext.jsx";'
            ;;
        *)
            import_line='import { useTheme } from "../../contexts/ThemeContext.jsx";'
            ;;
    esac
    
    add_import_if_missing "$file" "$import_line" "useTheme"
done

# Add useAuth imports
for file in "${AUTH_FILES[@]}"; do
    # LoginForm is in features/auth, so needs ../../../
    import_line='import { useAuth } from "../../../contexts/AuthContext.jsx";'
    add_import_if_missing "$file" "$import_line" "useAuth"
    
    # Also add useTheme to LoginForm since it needs both
    theme_import='import { useTheme } from "../../../contexts/ThemeContext.jsx";'
    add_import_if_missing "$file" "$theme_import" "useTheme"
done

echo ""
echo "🎉 Import fixes complete!"
echo ""
echo "📋 Summary of changes:"
echo "   • Added useTheme imports to ${#THEME_FILES[@]} files"
echo "   • Added useAuth import to ${#AUTH_FILES[@]} files"
echo ""
echo "🧪 Next steps:"
echo "   1. npm run dev"
echo "   2. Check browser console for any remaining errors"
echo "   3. Run ./check-hooks.sh again to verify fixes"