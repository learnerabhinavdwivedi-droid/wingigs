'use client';

import React from 'react';
import Image from 'next/image';

interface BaharLogoProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

export function BaharLogo({ size = 36, className = '', withGlow = true }: BaharLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-2xl ${
        withGlow ? 'shadow-lg shadow-lime-500/20' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="Bahar Logo"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );
}
