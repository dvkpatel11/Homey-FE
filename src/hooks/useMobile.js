// src/hooks/useMobile.js - Mobile-specific utility hooks
import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage"; // adjust path

/**
 * Hook to detect mobile device and screen orientation
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState("portrait");
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768);
      setOrientation(width > height ? "landscape" : "portrait");
      setScreenSize({ width, height });
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  return {
    isMobile,
    orientation,
    screenSize,
    isLandscape: orientation === "landscape",
    isPortrait: orientation === "portrait",
    isSmallScreen: screenSize.width < 640,
    isMediumScreen: screenSize.width >= 640 && screenSize.width < 1024,
    isLargeScreen: screenSize.width >= 1024,
  };
}

/**
 * Hook to handle keyboard visibility on mobile
 */
export function useKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;

      if (heightDifference > 150) {
        // Threshold for keyboard detection
        setIsKeyboardOpen(true);
        setKeyboardHeight(heightDifference);
      } else {
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      return () => window.visualViewport.removeEventListener("resize", handleViewportChange);
    } else {
      window.addEventListener("resize", handleViewportChange);
      return () => window.removeEventListener("resize", handleViewportChange);
    }
  }, []);

  return { isKeyboardOpen, keyboardHeight };
}

/**
 * Hook for optimized debouncing (mobile-friendly)
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for handling touch gestures
 */
export function useTouch() {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    return { isLeftSwipe, isRightSwipe, distance };
  }, [touchStart, touchEnd]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    touchStart,
    touchEnd,
  };
}

// src/hooks/useOnlineStatus.js - Network status detection
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator?.onLine ?? true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return isOnline;
}

// src/hooks/usePersistentState.js - State that persists across app restarts
export function usePersistentState(key, defaultValue) {
  const [state, setState] = useLocalStorage(key, defaultValue);
  return [state, setState];
}
