import { 
  canPerformAction, 
  getPermissionLevel,
  canCreateProducts,
  canEditProducts,
  canDeleteProducts,
  canViewProducts,
  isAdmin,
  isSuperAdmin,
  getAllowedActions
} from './permissions';
import { Action, Entity, PermissionLevel } from '../constants/permissions';

describe('Utilidades de permisos', () => {
  const mockPermissions = {
    PRODUCTS: {
      [Action.CREATE]: PermissionLevel.ALL,
      [Action.UPDATE]: PermissionLevel.OWN,
      [Action.DELETE]: PermissionLevel.NONE,
      [Action.READ]: PermissionLevel.ALL,
    },
    USERS: {
      [Action.CREATE]: PermissionLevel.NONE,
      [Action.UPDATE]: PermissionLevel.NONE,
      [Action.DELETE]: PermissionLevel.NONE,
    }
  };

  test('debe retornar true cuando el usuario tiene permiso para crear', () => {
    expect(canPerformAction(mockPermissions, Entity.PRODUCTS, Action.CREATE)).toBe(true);
  });

  test('debe retornar false cuando el usuario no tiene permiso', () => {
    expect(canPerformAction(mockPermissions, Entity.PRODUCTS, Action.DELETE)).toBe(false);
  });

  test('debe retornar el nivel correcto de permiso', () => {
    expect(getPermissionLevel(mockPermissions, Entity.PRODUCTS, Action.UPDATE)).toBe(PermissionLevel.OWN);
  });

  test('debe retornar true cuando el usuario puede crear productos', () => {
    expect(canCreateProducts(mockPermissions)).toBe(true);
  });

  test('debe retornar true cuando el usuario puede editar productos', () => {
    expect(canEditProducts(mockPermissions)).toBe(true);
  });

  test('debe retornar false cuando el usuario no puede eliminar productos', () => {
    expect(canDeleteProducts(mockPermissions)).toBe(false);
  });

  test('debe retornar true cuando el usuario puede ver productos', () => {
    expect(canViewProducts(mockPermissions)).toBe(true);
  });

  test('debe detectar correctamente si el usuario es ADMIN', () => {
    expect(isAdmin(['ADMIN'])).toBe(true);
    expect(isAdmin(['USER'])).toBe(false);
  });

  test('debe detectar correctamente si el usuario es SUPERADMIN', () => {
    expect(isSuperAdmin(['SUPERADMIN'])).toBe(true);
    expect(isSuperAdmin(['USER'])).toBe(false);
  });

  test('debe retornar solo las acciones permitidas para una entidad', () => {
    const actions = getAllowedActions(mockPermissions, Entity.PRODUCTS);
    expect(actions).toContain(Action.CREATE);
    expect(actions).toContain(Action.UPDATE);
    expect(actions).not.toContain(Action.DELETE);
  });
});
