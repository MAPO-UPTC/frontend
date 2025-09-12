// src/api/index.js
/**
 * Punto de entrada centralizado para todos los servicios de API
 * Facilita la importación y mantiene la organización
 */

export { default as api } from './axios';
export { default as authService } from './authService';
export { default as productService } from './productService';
export { default as categoryService } from './categoryService';
export { default as permissionService } from './permissionService';

// También exportar las funciones nombradas para mayor flexibilidad
export { login, signup, logout, authGoogle, getProfile } from './authService';
export { productService as ProductAPI } from './productService';
export { categoryService as CategoryAPI } from './categoryService';