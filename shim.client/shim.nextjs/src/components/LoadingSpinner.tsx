// src/components/LoadingSpinner.tsx
'use client'; // This component uses useState (implicitly via React hooks) and needs to be client-side

import React, { FC } from 'react';

interface LoadingSpinnerProps {
    tip?: string; // Text to display below the spinner
    size?: 'small' | 'default' | 'large'; // Size of the spinner (will map to Tailwind classes)
    fullscreen?: boolean; // If true, covers the entire screen
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ tip = "Loading...", size = "default", fullscreen = false }) => {
    let spinnerSizeClasses = 'w-8 h-8'; // default
    let textSizeClasses = 'text-base';

    if (size === 'small') {
        spinnerSizeClasses = 'w-5 h-5';
        textSizeClasses = 'text-sm';
    } else if (size === 'large') {
        spinnerSizeClasses = 'w-12 h-12';
        textSizeClasses = 'text-lg';
    }

    // Basic spinner animation (pure CSS)
    const spinnerStyle: React.CSSProperties = {
        border: '4px solid #f3f3f3', // Light grey
        borderTop: '4px solid #3498db', // Blue
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    };

    // Define keyframes for the spin animation
    const spinKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

    if (fullscreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-[9999]">
                <style>{spinKeyframes}</style> {/* Inject keyframes */}
                <div className="flex flex-col items-center space-y-3">
                    <div className={spinnerSizeClasses} style={spinnerStyle}></div>
                    {tip && <span className={`text-gray-700 ${textSizeClasses}`}>{tip}</span>}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-5">
            <style>{spinKeyframes}</style> {/* Inject keyframes */}
            <div className="flex flex-col items-center space-y-2">
                <div className={spinnerSizeClasses} style={spinnerStyle}></div>
                {tip && <span className={`text-gray-700 ${textSizeClasses}`}>{tip}</span>}
            </div>
        </div>
    );
};

export default LoadingSpinner;