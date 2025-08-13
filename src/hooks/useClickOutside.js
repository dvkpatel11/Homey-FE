import { useEffect, useRef, useCallback } from 'react';

export const useClickOutside = (callback, enabled = true) => {
  const ref = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callbackRef.current(event);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [enabled]);

  return ref;
};

// Enhanced version with escape key support
export const useClickOutsideWithEscape = (callback, enabled = true, escapeKey = true) => {
  const ref = useClickOutside(callback, enabled);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !escapeKey) return;

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        callbackRef.current(event);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [enabled, escapeKey]);

  return ref;
};

// Multiple refs version for complex components
export const useMultipleClickOutside = (callback, enabled = true) => {
  const refs = useRef([]);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event) => {
      const isOutside = refs.current.every(ref => 
        ref.current && !ref.current.contains(event.target)
      );

      if (isOutside) {
        callbackRef.current(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [enabled]);

  const addRef = useCallback(() => {
    const ref = { current: null };
    refs.current.push(ref);
    return ref;
  }, []);

  const removeRef = useCallback((refToRemove) => {
    refs.current = refs.current.filter(ref => ref !== refToRemove);
  }, []);

  return { addRef, removeRef };
};

// Dropdown-specific hook with positioning
export const useDropdown = (options = {}) => {
  const {
    onClose,
    closeOnEscape = true,
    closeOnClickOutside = true,
    autoPosition = true,
  } = options;

  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Handle click outside and escape
  const handleClose = useCallback((event) => {
    onClose?.(event);
  }, [onClose]);

  const clickOutsideRef = useClickOutsideWithEscape(
    handleClose,
    closeOnClickOutside,
    closeOnEscape
  );

  // Auto-positioning logic
  const updatePosition = useCallback(() => {
    if (!autoPosition || !triggerRef.current || !dropdownRef.current) return;

    const trigger = triggerRef.current;
    const dropdown = dropdownRef.current;
    const triggerRect = trigger.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Reset position
    dropdown.style.position = 'absolute';
    dropdown.style.top = '';
    dropdown.style.bottom = '';
    dropdown.style.left = '';
    dropdown.style.right = '';

    // Determine vertical position
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const dropdownHeight = dropdownRect.height;

    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      // Position below trigger
      dropdown.style.top = `${triggerRect.bottom + window.scrollY}px`;
    } else {
      // Position above trigger
      dropdown.style.bottom = `${viewportHeight - triggerRect.top - window.scrollY}px`;
    }

    // Determine horizontal position
    const spaceRight = viewportWidth - triggerRect.left;
    const dropdownWidth = dropdownRect.width;

    if (spaceRight >= dropdownWidth) {
      // Align with left edge of trigger
      dropdown.style.left = `${triggerRect.left + window.scrollX}px`;
    } else {
      // Align with right edge of trigger
      dropdown.style.right = `${viewportWidth - triggerRect.right - window.scrollX}px`;
    }
  }, [autoPosition]);

  // Combine refs for click outside
  useEffect(() => {
    if (dropdownRef.current) {
      const element = dropdownRef.current;
      clickOutsideRef.current = element;
    }
  }, [clickOutsideRef]);

  // Update position on mount and scroll
  useEffect(() => {
    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [updatePosition]);

  return {
    triggerRef,
    dropdownRef: clickOutsideRef,
    updatePosition,
  };
};

// Modal-specific hook
export const useModal = (onClose, options = {}) => {
  const {
    closeOnEscape = true,
    closeOnBackdropClick = true,
    lockBodyScroll = true,
  } = options;

  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose?.(event);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [closeOnEscape, onClose]);

  // Handle backdrop click
  useEffect(() => {
    if (!closeOnBackdropClick) return;

    const handleBackdropClick = (event) => {
      if (backdropRef.current && event.target === backdropRef.current) {
        onClose?.(event);
      }
    };

    const backdrop = backdropRef.current;
    if (backdrop) {
      backdrop.addEventListener('click', handleBackdropClick);
      return () => backdrop.removeEventListener('click', handleBackdropClick);
    }
  }, [closeOnBackdropClick, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!lockBodyScroll) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lockBodyScroll]);

  // Focus management
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    // Trap focus within modal
    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, []);

  return {
    modalRef,
    backdropRef,
  };
};

export default useClickOutside;
