// src/utils/validation.js
import { VALIDATION } from '../constants';

/**
 * Utilidades de validación reutilizables
 */

export const validateProductForm = (formData) => {
  const errors = {};

  // Validar nombre
  if (!formData.name?.trim()) {
    errors.name = 'El nombre del producto es obligatorio';
  } else if (formData.name.trim().length < VALIDATION.MIN_NAME_LENGTH) {
    errors.name = `El nombre debe tener al menos ${VALIDATION.MIN_NAME_LENGTH} caracteres`;
  } else if (formData.name.trim().length > VALIDATION.MAX_NAME_LENGTH) {
    errors.name = `El nombre no puede exceder ${VALIDATION.MAX_NAME_LENGTH} caracteres`;
  }

  // Validar descripción
  if (!formData.description?.trim()) {
    errors.description = 'La descripción es obligatoria';
  } else if (formData.description.trim().length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.description = `La descripción no puede exceder ${VALIDATION.MAX_DESCRIPTION_LENGTH} caracteres`;
  }

  // Validar categoría
  if (!formData.category_id) {
    errors.category_id = 'Debe seleccionar una categoría';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return {
    isValid: password && password.length >= VALIDATION.MIN_PASSWORD_LENGTH,
    message: password?.length < VALIDATION.MIN_PASSWORD_LENGTH 
      ? `La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`
      : null
  };
};