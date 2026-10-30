// src/utility/accessibility.js
// Verified Accessibility & Motion utilities aligned with docs/Design.md Section 5.4 & 5.5

import {useState, useEffect} from 'react';
import {AccessibilityInfo} from 'react-native';

/**
 * Global accessibility constants and text scaling policies
 */
export const A11Y_POLICIES = {
  // Balanced max font multiplier to prevent header text clipping
  MAX_FONT_SIZE_MULTIPLIER: 1.5,
  HEADER_MAX_MULTIPLIER: 1.3,
  BADGE_MAX_MULTIPLIER: 1.2,
};

/**
 * Returns standard accessible text properties enforcing the text scaling policy
 * @param {number} [maxMultiplier=A11Y_POLICIES.MAX_FONT_SIZE_MULTIPLIER]
 */
export const getTextA11yProps = (
  maxMultiplier = A11Y_POLICIES.MAX_FONT_SIZE_MULTIPLIER,
) => ({
  allowFontScaling: true,
  maxFontSizeMultiplier: maxMultiplier,
});

/**
 * React hook to observe user's reduced-motion preference
 * @returns {boolean} isReduceMotionEnabled
 */
export const useReducedMotion = () => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check initial status
    if (AccessibilityInfo?.isReduceMotionEnabled) {
      AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
        if (isMounted) {
          setReduceMotionEnabled(Boolean(enabled));
        }
      });
    }

    // Subscribe to changes if supported
    const listener = AccessibilityInfo?.addEventListener?.(
      'reduceMotionChanged',
      enabled => {
        if (isMounted) {
          setReduceMotionEnabled(Boolean(enabled));
        }
      },
    );

    return () => {
      isMounted = false;
      if (listener?.remove) {
        listener.remove();
      }
    };
  }, []);

  return reduceMotionEnabled;
};

export default {
  A11Y_POLICIES,
  getTextA11yProps,
  useReducedMotion,
};
