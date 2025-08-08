#!/bin/bash

echo "🧹 Smart cleanup - removing only redundant/contradictory files..."

# Remove contradictory state management (you're using contexts)
echo "Removing redundant stores (using contexts instead)..."
rm -rf src/lib/stores/

# Remove constants that can be inline or in config
echo "Removing empty constants (use config/ instead)..."
rm -rf src/lib/constants/

# Remove redundant styles (using Tailwind + component styles)
echo "Removing empty styles directory (using Tailwind)..."
rm -rf src/styles/

# Remove contradictory contexts (consolidate notifications)
echo "Removing NotificationContext (use toast library instead)..."
rm src/contexts/NotificationContext.js

# Remove over-architected hooks that aren't core
echo "Removing non-essential empty hooks..."
rm src/hooks/useChat.js           # Chat isn't core household feature
rm src/hooks/useInfiniteScroll.js # Premature optimization
rm src/hooks/useRealtime.js       # Backend dependency

# Remove redundant config files
echo "Removing redundant config files..."
rm src/lib/config/router.js       # Router config goes in main component
rm src/lib/config/supabase.js     # Backend-specific, create when needed

# Remove non-essential feature directories
echo "Removing non-core feature directories..."
rm -rf src/components/features/chat/           # Not core household management
rm -rf src/components/features/dashboard/      # Dashboard widgets can be in pages/
rm -rf src/components/features/notifications/  # Using toast library

# Remove empty page directories that duplicate existing
echo "Removing duplicate empty pages..."
rm -rf src/pages/auth/         # Auth components exist in features/
rm -rf src/pages/chat/         # Chat removed above
rm -rf src/pages/notifications/ # Using toast library
rm -rf src/pages/settings/     # Profile covers this

# Clean up specific empty files that are redundant
echo "Removing redundant index files..."
rm src/components/features/auth/index.js       # Not needed with direct imports
rm src/components/features/tasks/index.js      # Not needed with direct imports
rm src/components/layout/index.js             # Not needed with direct imports
rm src/components/ui/index.js                 # Not needed with direct imports

echo "✅ Smart cleanup complete!"
echo ""
echo "🏗️  Kept foundational files:"
echo "  • Core layouts: AppLayout, DashboardLayout, Sidebar"
echo "  • Essential hooks: useTheme, useLocalStorage, useHousehold"  
echo "  • Form infrastructure: FormField, FormValidation, etc."
echo "  • Household management: All household components"
echo "  • Profile management: All profile components"
echo "  • Type definitions: Complete type system"
echo "  • Utilities: validations, formatters, storage"
echo "  • Auth: AuthGuard, RegisterForm (core security)"
echo ""
echo "🎯 Focused on core household management features"
echo "💪 Solid foundation without over-architecture"