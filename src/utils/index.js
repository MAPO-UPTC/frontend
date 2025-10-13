// src/utils/index.js
/**
 * Punto de entrada para todas las utilidades
 */

export * from './validation';
export * from './formatters';
export * from './localStorage';
export * from './permissions';
export * from './salesHelpers';

// Utilidades adicionales
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};