import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'switch';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'md', 
  variant = 'switch',
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-10 h-6',
    md: 'w-12 h-7',
    lg: 'w-14 h-8'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center justify-center rounded-lg
          transition-all duration-200 ease-in-out
          ${size === 'sm' ? 'p-1.5' : size === 'md' ? 'p-2' : 'p-2.5'}
          bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
          text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100
          border border-gray-200 dark:border-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          shadow-sm hover:shadow-md
        `}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <div className="relative">
          {theme === 'light' ? (
            <Moon size={iconSizes[size]} className="transform transition-transform duration-200" />
          ) : (
            <Sun size={iconSizes[size]} className="transform transition-transform duration-200" />
          )}
        </div>
        {showLabel && (
          <span className="ml-2 text-sm font-medium">
            {theme === 'light' ? 'Dark' : 'Light'}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Theme
        </span>
      )}
      <button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]} relative inline-flex items-center rounded-full
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800
          ${theme === 'dark' 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-200 hover:bg-gray-300'
          }
          shadow-inner
        `}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        role="switch"
        aria-checked={theme === 'dark'}
      >
        <span className="sr-only">Toggle theme</span>
        <div
          className={`
            ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}
            inline-flex items-center justify-center rounded-full
            transition-all duration-300 ease-in-out transform
            ${theme === 'dark' 
              ? 'translate-x-full bg-white shadow-lg' 
              : 'translate-x-0 bg-white shadow-md'
            }
            ${size === 'sm' ? 'ml-0.5' : 'ml-1'}
          `}
        >
          {theme === 'light' ? (
            <Sun 
              size={iconSizes[size]} 
              className="text-yellow-500 transform transition-transform duration-200" 
            />
          ) : (
            <Moon 
              size={iconSizes[size]} 
              className="text-blue-600 transform transition-transform duration-200" 
            />
          )}
        </div>
      </button>
    </div>
  );
};
