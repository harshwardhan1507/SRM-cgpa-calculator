'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'sm', showText = false }: LogoProps) {
  // Dimension definitions based on size prop
  const sizeClasses = {
    sm: {
      box: 'w-8 h-8 rounded-lg text-[10px]',
      topHalf: 'h-4 text-[10px]',
      bottomHalf: 'h-4 text-[9px]',
      gap: 'gap-1.5'
    },
    md: {
      box: 'w-16 h-16 rounded-xl text-[20px]',
      topHalf: 'h-8 text-[20px]',
      bottomHalf: 'h-8 text-[18px]',
      gap: 'gap-3'
    },
    lg: {
      box: 'w-28 h-28 rounded-2xl text-[34px]',
      topHalf: 'h-14 text-[34px]',
      bottomHalf: 'h-14 text-[30px]',
      gap: 'gap-4'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center ${currentSize.gap}`}>
      {/* The Brand Icon Box */}
      <div className={`relative ${currentSize.box} bg-[#0A0A0A] border border-[#1A1A1A] flex flex-col overflow-hidden`}>
        {/* Top Half: S | A */}
        <div className={`flex ${currentSize.topHalf} border-b border-[#1A1A1A]`}>
          <div className="flex-1 flex items-center justify-center font-bold text-white border-r border-[#1A1A1A]">
            S
          </div>
          <div className="flex-1 flex items-center justify-center font-bold text-white">
            A
          </div>
        </div>
        {/* Bottom Half: 9.25 */}
        <div className={`w-full flex items-center justify-center font-mono font-bold text-white ${currentSize.bottomHalf}`}>
          9.25
        </div>
      </div>

      {/* Optional Brand Text Label */}
      {showText && (
        <span className={`font-sans text-white font-semibold tracking-tight text-center ${
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl'
        }`}>
          SRM Academic Suite
        </span>
      )}
    </div>
  );
}
