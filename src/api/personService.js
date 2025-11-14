import api from './axios';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Servicio para gestión de personas en el sistema
 * Maneja todas las operaciones relacionadas con el endpoint /persons
 */
class PersonService {
  /**
   * Obtener todas las personas del sistema
   * @returns {Promise<Array>} Lista de personas
   */
  async getAllPersons() {
    try {
      console.log('🔍 PersonService - Obteniendo todas las personas...');
      
      const response = await api.get(API_ENDPOINTS.PERSONS.BASE);
      
      // ✅ Validar que response.data sea un array (fix para error .map is not a function)
      if (!Array.isArray(response.data)) {
        console.error('❌ PersonService - Response no es un array:', response.data);
        
        // Si el backend devuelve un objeto de error
        if (response.data?.detail) {
          throw new Error(response.data.detail);
        }
        
        throw new Error('Formato de respuesta inválido del servidor');
      }
      
      console.log('✅ PersonService - Personas obtenidas desde API:', {
        total: response.data.length,
        personas: response.data.map(p => ({
          id: p.id,
          name: p.full_name || `${p.name} ${p.last_name}`,
          document: `${p.document_type}: ${p.document_number}`
        }))
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ PersonService - Error al obtener personas:', error);
      
      // Extraer mensaje de error específico del backend
      if (error.response?.data?.detail) {
        const errorMessage = error.response.data.detail;
        console.error('❌ Error del backend:', errorMessage);
        
        // Si es error de autenticación, lanzar error específico
        if (errorMessage.includes('token') || error.response?.status === 401) {
          throw new Error('No autorizado - Token inválido o expirado');
        }
        
        throw new Error(errorMessage);
      }
      
      // Si el endpoint no existe (404) o hay error de red, usar datos mock
      if (error.response?.status === 404 || error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        console.warn('⚠️ Endpoint /persons no disponible. Usando datos mock para desarrollo.');
        const mockData = this.getMockPersons();
        
        console.log('✅ PersonService - Usando datos mock:', {
          total: mockData.length,
          personas: mockData.map(p => ({
            id: p.id,
            name: p.full_name || `${p.name} ${p.last_name}`,
            document: `${p.document_type}: ${p.document_number}`
          }))
        });
        
        return mockData;
      }
      
      throw error;
    }
  }

  /**
   * Obtener una persona por ID
   * @param {string} personId - UUID de la persona
   * @returns {Promise<Object>} Datos de la persona
   */
  async getPersonById(personId) {
    try {
      console.log('🔍 PersonService - Obteniendo persona por ID:', personId);
      
      const response = await api.get(API_ENDPOINTS.PERSONS.BY_ID(personId));
      
      console.log('✅ PersonService - Persona obtenida desde API:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PersonService - Error al obtener persona:', error);
      
      // Si el endpoint no existe, buscar en datos mock
      if (error.response?.status === 404 || error.code === 'NETWORK_ERROR') {
        console.warn('⚠️ Endpoint no disponible, buscando en datos mock...');
        const mockPersons = this.getMockPersons();
        const person = mockPersons.find(p => p.id === personId);
        
        if (person) {
          console.log('✅ PersonService - Persona encontrada en mock:', person);
          return person;
        } else {
          throw new Error(`Persona con ID ${personId} no encontrada`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Crear una nueva persona en el sistema
   * @param {Object} personData - Datos de la persona a crear
   * @returns {Promise<Object>} Persona creada
   */
  async createPerson(personData) {
    try {
      console.log('➕ PersonService - Creando nueva persona:', personData);
      
      // Validar campos requeridos
      const requiredFields = ['name', 'last_name', 'document_type', 'document_number'];
      for (const field of requiredFields) {
        if (!personData[field]) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      const response = await api.post(API_ENDPOINTS.PERSONS.CREATE, personData);
      
      console.log('✅ PersonService - Persona creada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PersonService - Error al crear persona:', error);
      
      // Si el endpoint no existe, simular creación en mock
      if (error.response?.status === 404 || error.code === 'NETWORK_ERROR') {
        console.warn('⚠️ Endpoint no disponible, simulando creación...');
        const newPerson = {
          id: `mock-${Date.now()}`,
          ...personData,
          full_name: `${personData.name} ${personData.last_name}`,
          created_at: new Date().toISOString()
        };
        
        console.log('✅ PersonService - Persona simulada creada:', newPerson);
        return newPerson;
      }
      
      throw error;
    }
  }

  /**
   * Buscar personas por término de búsqueda
   * @param {string} searchTerm - Término de búsqueda
   * @param {Array} persons - Lista de personas (opcional, si no se provee se obtienen del servidor)
   * @returns {Promise<Array>} Lista de personas filtradas
   */
  async searchPersons(searchTerm, persons = null) {
    try {
      // Si no se proveen personas, obtenerlas primero
      if (!persons) {
        persons = await this.getAllPersons();
      }

      if (!searchTerm || searchTerm.trim() === '') {
        return persons;
      }

      const term = searchTerm.toLowerCase().trim();
      
      const filtered = persons.filter(person => {
        const fullName = person.full_name || `${person.name} ${person.last_name}`;
        return (
          fullName.toLowerCase().includes(term) ||
          person.document_number?.includes(term) ||
          person.name?.toLowerCase().includes(term) ||
          person.last_name?.toLowerCase().includes(term) ||
          person.document_type?.toLowerCase().includes(term)
        );
      });

      console.log('🔍 PersonService - Búsqueda:', {
        term: searchTerm,
        total: persons.length,
        results: filtered.length
      });

      return filtered;
    } catch (error) {
      console.error('❌ PersonService - Error en búsqueda:', error);
      throw error;
    }
  }

  /**
   * Formatear persona para mostrar en UI
   * @param {Object} person - Objeto persona
   * @returns {string} Texto formateado para mostrar
   */
  formatPersonForDisplay(person) {
    if (!person) return '';
    
    const fullName = person.full_name || `${person.name} ${person.last_name}`;
    const document = person.document_type && person.document_number 
      ? `${person.document_type}: ${person.document_number}`
      : '';
    
    return document ? `${fullName} (${document})` : fullName;
  }

  /**
   * Validar si una persona tiene los campos mínimos requeridos
   * @param {Object} person - Objeto persona
   * @returns {boolean} True si es válida
   */
  isValidPerson(person) {
    return !!(
      person &&
      person.id &&
      (person.full_name || (person.name && person.last_name))
    );
  }

  /**
   * Obtener datos mock para desarrollo/fallback
   * @returns {Array} Lista de personas mock
   */
  getMockPersons() {
    return [
      {
        id: "67825f4c-e43f-4871-8b46-6016ceebbecf",
        name: "Juan Carlos",
        last_name: "Pérez García",
        document_type: "CC",
        document_number: "12345678",
        full_name: "Juan Carlos Pérez García"
      },
      {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        name: "María Elena",
        last_name: "Rodríguez López",
        document_type: "CE",
        document_number: "87654321",
        full_name: "María Elena Rodríguez López"
      },
      {
        id: "b2c3d4e5-f6g7-8901-2345-678901bcdefg",
        name: "Luis Fernando",
        last_name: "González Martínez",
        document_type: "CC",
        document_number: "11223344",
        full_name: "Luis Fernando González Martínez"
      },
      {
        id: "c3d4e5f6-g7h8-9012-3456-789012cdefgh",
        name: "Ana Patricia",
        last_name: "Morales Vega",
        document_type: "CC",
        document_number: "99887766",
        full_name: "Ana Patricia Morales Vega"
      },
      {
        id: "d4e5f6g7-h8i9-0123-4567-890123defghi",
        name: "Carlos Eduardo",
        last_name: "Silva Ramírez",
        document_type: "CE",
        document_number: "55443322",
        full_name: "Carlos Eduardo Silva Ramírez"
      }
    ];
  }
}

// Crear instancia única del servicio
export const personService = new PersonService();

// Export por defecto para import directo
export default personService;