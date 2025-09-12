// src/constants/permissions.js
/**
 * Constantes de permisos que coinciden exactamente con el backend
 * Mantener sincronizadas con la API
 */

// Acciones disponibles en el sistema
export const Action = {
  CREATE: "CREATE",
  READ: "READ", 
  UPDATE: "UPDATE",
  DELETE: "DELETE"
};

// Entidades del sistema
export const Entity = {
  USERS: "USERS",
  PRODUCTS: "PRODUCTS",
  SUPPLIERS: "SUPPLIERS",
  CLIENTS: "CLIENTS", 
  SALES_ORDERS: "SALES_ORDERS",
  INVENTORY_STOCK: "INVENTORY_STOCK"
};

// Niveles de permisos
export const PermissionLevel = {
  NONE: "NONE",
  OWN: "OWN", 
  CONDITIONAL: "CONDITIONAL",
  ALL: "ALL"
};

// Roles del sistema
export const Role = {
  USER: "USER",
  ADMIN: "ADMIN", 
  SUPERADMIN: "SUPERADMIN"
};