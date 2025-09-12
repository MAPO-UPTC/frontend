// src/constants/index.js
/**
 * Punto de entrada para todas las constantes
 */

export * from './api';
export * from './permissions';

// Constantes de validación
export const VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_PASSWORD_LENGTH: 6
};

// Constantes de UI
export const UI = {
  ANIMATION_DURATION: 400,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  VALIDATION_ERROR: 'Por favor, corrige los errores en el formulario.',
  GENERIC_ERROR: 'Ocurrió un error inesperado. Inténtalo de nuevo.'
};