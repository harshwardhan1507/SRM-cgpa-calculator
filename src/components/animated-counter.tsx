'use client';

import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
}

export function AnimatedCounter({ value, duration = 400, decimals = 2 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    
    if (startValue === endValue) return;

    const startTime = performance.now();

    const updateValue = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const ease = progress * (2 - progress);
      const current = startValue + (endValue - startValue) * ease;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setDisplayValue(endValue);
        previousValueRef.current = endValue;
      }
    };

    requestAnimationFrame(updateValue);
  }, [value, duration]);

  return <span>{displayValue.toFixed(decimals)}</span>;
}
