import { useEffect, useRef, useCallback, useState } from 'react';

// Core keyboard hook
export const useKeyboard = (keyMap = {}, options = {}) => {
  const {
    preventDefault = true,
    stopPropagation = false,
    enabled = true,
    target = null, // null for document, or ref to specific element
  } = options;

  const keyMapRef = useRef(keyMap);
  const pressedKeysRef = useRef(new Set());

  // Update keyMap ref when it changes
  useEffect(() => {
    keyMapRef.current = keyMap;
  }, [keyMap]);

  useEffect(() => {
    if (!enabled) return;

    const targetElement = target?.current || document;

    const handleKeyDown = (event) => {
      pressedKeysRef.current.add(event.code);
      
      const key = normalizeKey(event);
      const handler = keyMapRef.current[key];

      if (handler) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        
        handler(event);
      }
    };

    const handleKeyUp = (event) => {
      pressedKeysRef.current.delete(event.code);
    };

    const handleBlur = () => {
      pressedKeysRef.current.clear();
    };

    targetElement.addEventListener('keydown', handleKeyDown);
    targetElement.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown);
      targetElement.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, target, preventDefault, stopPropagation]);

  const isKeyPressed = useCallback((keyCode) => {
    return pressedKeysRef.current.has(keyCode);
  }, []);

  const getPressedKeys = useCallback(() => {
    return Array.from(pressedKeysRef.current);
  }, []);

  return {
    isKeyPressed,
    getPressedKeys,
  };
};

// Normalize key combinations for consistent handling
const normalizeKey = (event) => {
  const parts = [];
  
  if (event.ctrlKey) parts.push('ctrl');
  if (event.metaKey) parts.push('meta');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  
  parts.push(event.key.toLowerCase());
  
  return parts.join('+');
};

// Hotkey hook for global shortcuts
export const useHotkeys = (hotkeys = {}, enabled = true) => {
  return useKeyboard(hotkeys, {
    enabled,
    preventDefault: true,
    stopPropagation: true,
  });
};

// Navigation hook for arrow keys and enter/escape
export const useKeyboardNavigation = (options = {}) => {
  const {
    onUp,
    onDown,
    onLeft,
    onRight,
    onEnter,
    onEscape,
    onTab,
    enabled = true,
    target = null,
  } = options;

  const keyMap = {
    'arrowup': onUp,
    'arrowdown': onDown,
    'arrowleft': onLeft,
    'arrowright': onRight,
    'enter': onEnter,
    'escape': onEscape,
    'tab': onTab,
  };

  // Filter out undefined handlers
  const filteredKeyMap = Object.fromEntries(
    Object.entries(keyMap).filter(([_, handler]) => handler)
  );

  return useKeyboard(filteredKeyMap, {
    enabled,
    target,
    preventDefault: true,
  });
};

// List navigation hook
export const useListNavigation = (items = [], options = {}) => {
  const {
    onSelect,
    loop = true,
    initialIndex = 0,
    enabled = true,
  } = options;

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const moveUp = useCallback(() => {
    setSelectedIndex(prev => {
      if (prev <= 0) {
        return loop ? items.length - 1 : 0;
      }
      return prev - 1;
    });
  }, [items.length, loop]);

  const moveDown = useCallback(() => {
    setSelectedIndex(prev => {
      if (prev >= items.length - 1) {
        return loop ? 0 : items.length - 1;
      }
      return prev + 1;
    });
  }, [items.length, loop]);

  const selectCurrent = useCallback(() => {
    const currentItem = items[selectedIndex];
    if (currentItem && onSelect) {
      onSelect(currentItem, selectedIndex);
    }
  }, [items, selectedIndex, onSelect]);

  useKeyboardNavigation({
    onUp: moveUp,
    onDown: moveDown,
    onEnter: selectCurrent,
    enabled: enabled && items.length > 0,
  });

  // Reset index when items change
  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, selectedIndex]);

  return {
    selectedIndex,
    setSelectedIndex,
    selectedItem: items[selectedIndex],
    moveUp,
    moveDown,
    selectCurrent,
  };
};

// Global shortcuts hook for app-wide commands
export const useGlobalShortcuts = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  // Common app shortcuts
  const shortcuts = {
    // Search
    'ctrl+k': () => {
      // Trigger global search
      const searchInput = document.querySelector('[data-search-trigger]');
      searchInput?.focus();
    },
    'meta+k': () => {
      const searchInput = document.querySelector('[data-search-trigger]');
      searchInput?.focus();
    },
    
    // Navigation
    'ctrl+shift+h': () => {
      // Go to home/dashboard
      window.location.href = '/dashboard';
    },
    'ctrl+shift+t': () => {
      // Go to tasks
      window.location.href = '/tasks';
    },
    'ctrl+shift+e': () => {
      // Go to expenses
      window.location.href = '/expenses';
    },
    
    // Quick actions
    'ctrl+n': () => {
      // Open new item dialog (context-dependent)
      const newButton = document.querySelector('[data-new-item]');
      newButton?.click();
    },
    
    // Help
    'ctrl+shift+?': () => {
      // Show help/shortcuts modal
      const helpButton = document.querySelector('[data-help-trigger]');
      helpButton?.click();
    },
  };

  useHotkeys(shortcuts, isEnabled);

  return {
    enableShortcuts: () => setIsEnabled(true),
    disableShortcuts: () => setIsEnabled(false),
    isEnabled,
  };
};

// Form navigation hook
export const useFormNavigation = (formRef, options = {}) => {
  const {
    submitOnEnter = false,
    resetOnEscape = false,
  } = options;

  useKeyboard({
    'enter': (event) => {
      if (submitOnEnter && event.target.tagName !== 'TEXTAREA') {
        const form = formRef.current;
        if (form) {
          const submitButton = form.querySelector('[type="submit"]');
          submitButton?.click();
        }
      }
    },
    'escape': () => {
      if (resetOnEscape) {
        const form = formRef.current;
        if (form) {
          form.reset();
          const firstInput = form.querySelector('input, textarea, select');
          firstInput?.focus();
        }
      }
    },
  }, {
    target: formRef,
    preventDefault: false,
  });

  const focusFirstField = useCallback(() => {
    const form = formRef.current;
    if (form) {
      const firstInput = form.querySelector('input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
      firstInput?.focus();
    }
  }, [formRef]);

  const focusNextField = useCallback(() => {
    const form = formRef.current;
    if (!form) return;

    const inputs = form.querySelectorAll('input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
    const currentIndex = Array.from(inputs).indexOf(document.activeElement);
    const nextInput = inputs[currentIndex + 1];
    
    if (nextInput) {
      nextInput.focus();
    }
  }, [formRef]);

  const focusPrevField = useCallback(() => {
    const form = formRef.current;
    if (!form) return;

    const inputs = form.querySelectorAll('input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
    const currentIndex = Array.from(inputs).indexOf(document.activeElement);
    const prevInput = inputs[currentIndex - 1];
    
    if (prevInput) {
      prevInput.focus();
    }
  }, [formRef]);

  return {
    focusFirstField,
    focusNextField,
    focusPrevField,
  };
};

// Combo/sequence detection hook
export const useKeySequence = (sequence = [], onComplete, options = {}) => {
  const { timeout = 1000, enabled = true } = options;
  const [currentSequence, setCurrentSequence] = useState([]);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      
      setCurrentSequence(prev => {
        const newSequence = [...prev, key];
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Check if sequence matches
        if (newSequence.length >= sequence.length) {
          const lastKeys = newSequence.slice(-sequence.length);
          if (lastKeys.every((key, index) => key === sequence[index])) {
            onComplete?.();
            return [];
          }
        }
        
        // Set timeout to reset sequence
        timeoutRef.current = setTimeout(() => {
          setCurrentSequence([]);
        }, timeout);
        
        return newSequence;
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [sequence, onComplete, timeout, enabled]);

  return currentSequence;
};

export default useKeyboard;
