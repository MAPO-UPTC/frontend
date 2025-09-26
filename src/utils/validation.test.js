import { validateProductForm, validateEmail, validatePassword } from './validation';
import { VALIDATION } from '../constants';

describe('Validaciones de formularios', () => {
  describe('validateProductForm', () => {
    test('retorna error si el nombre está vacío', () => {
      const result = validateProductForm({ name: '', description: 'desc', category_id: 1 });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('El nombre del producto es obligatorio');
    });

    test('retorna error si el nombre es muy corto', () => {
      const result = validateProductForm({ name: 'a', description: 'desc', category_id: 1 });
      expect(result.errors.name).toBe(`El nombre debe tener al menos ${VALIDATION.MIN_NAME_LENGTH} caracteres`);
    });

    test('retorna error si el nombre es muy largo', () => {
      const longName = 'a'.repeat(VALIDATION.MAX_NAME_LENGTH + 1);
      const result = validateProductForm({ name: longName, description: 'desc', category_id: 1 });
      expect(result.errors.name).toBe(`El nombre no puede exceder ${VALIDATION.MAX_NAME_LENGTH} caracteres`);
    });

    test('retorna error si la descripción está vacía', () => {
      const result = validateProductForm({ name: 'Producto', description: '', category_id: 1 });
      expect(result.errors.description).toBe('La descripción es obligatoria');
    });

    test('retorna error si la descripción es demasiado larga', () => {
      const longDesc = 'a'.repeat(VALIDATION.MAX_DESCRIPTION_LENGTH + 1);
      const result = validateProductForm({ name: 'Producto', description: longDesc, category_id: 1 });
      expect(result.errors.description).toBe(`La descripción no puede exceder ${VALIDATION.MAX_DESCRIPTION_LENGTH} caracteres`);
    });

    test('retorna error si no se selecciona categoría', () => {
      const result = validateProductForm({ name: 'Producto', description: 'desc' });
      expect(result.errors.category_id).toBe('Debe seleccionar una categoría');
    });

    test('retorna válido si todos los datos están correctos', () => {
      const result = validateProductForm({ name: 'Producto', description: 'desc', category_id: 1 });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('validateEmail', () => {
    test('retorna true para un email válido', () => {
      expect(validateEmail('test@mail.com')).toBe(true);
    });

    test('retorna false para un email inválido', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('retorna error si la contraseña es demasiado corta', () => {
      const result = validatePassword('123');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe(`La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`);
    });

    test('retorna válido si la contraseña cumple con la longitud', () => {
      const validPass = 'a'.repeat(VALIDATION.MIN_PASSWORD_LENGTH);
      const result = validatePassword(validPass);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe(null);
    });
  });
});
