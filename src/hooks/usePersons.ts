import { useState, useEffect, useCallback } from 'react';
import { personService } from '../api/personService';
import { PersonAPIResponse } from '../types';

/**
 * Hook personalizado para gestión de personas
 * Proporciona estado y funciones para manejar personas en componentes
 * @returns {Object} Estado y funciones para gestión de personas
 */
export const usePersons = () => {
  const [persons, setPersons] = useState<PersonAPIResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredPersons, setFilteredPersons] = useState<PersonAPIResponse[]>([]);

  /**
   * Cargar todas las personas del servidor
   */
  const loadPersons = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 usePersons - Cargando personas...');
      
      const data = await personService.getAllPersons();
      setPersons(data as PersonAPIResponse[]);
      setFilteredPersons(data as PersonAPIResponse[]);
      
      console.log('✅ usePersons - Personas cargadas:', data.length);
    } catch (err) {
      console.error('❌ usePersons - Error al cargar personas:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar personas';
      setError(errorMessage);
      
      // En caso de error, usar datos mock
      const mockData = personService.getMockPersons() as PersonAPIResponse[];
      setPersons(mockData);
      setFilteredPersons(mockData);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar personas por término
   */
  const searchPersons = useCallback(async (term: string) => {
    setSearchTerm(term);
    
    try {
      const filtered = await personService.searchPersons(term, persons);
      setFilteredPersons(filtered);
      
      console.log('🔍 usePersons - Búsqueda:', {
        term,
        results: filtered.length
      });
    } catch (err) {
      console.error('❌ usePersons - Error en búsqueda:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error en búsqueda';
      setError(errorMessage);
    }
  }, [persons]);

  /**
   * Obtener persona por ID
   */
  const getPersonById = useCallback((personId: string) => {
    if (!personId) return null;
    return persons.find(person => person.id === personId);
  }, [persons]);

  /**
   * Obtener persona por ID (desde servidor si no está en cache)
   */
  const fetchPersonById = useCallback(async (personId: string) => {
    try {
      // Primero buscar en cache local
      const cached = getPersonById(personId);
      if (cached) return cached;
      
      // Si no está en cache, buscar en servidor
      console.log('🔍 usePersons - Buscando persona en servidor:', personId);
      const person = await personService.getPersonById(personId);
      
      // Agregar a cache local
      setPersons((prev: PersonAPIResponse[]) => {
        const exists = prev.find(p => p.id === personId);
        if (!exists) {
          return [...prev, person as PersonAPIResponse];
        }
        return prev;
      });
      
      return person;
    } catch (err) {
      console.error('❌ usePersons - Error al obtener persona:', err);
      throw err;
    }
  }, [getPersonById]);

  /**
   * Formatear persona para mostrar
   */
  const formatPerson = useCallback((person: PersonAPIResponse) => {
    return personService.formatPersonForDisplay(person);
  }, []);

  /**
   * Validar persona
   */
  const validatePerson = useCallback((person: PersonAPIResponse) => {
    return personService.isValidPerson(person);
  }, []);

  /**
   * Limpiar búsqueda
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFilteredPersons(persons);
  }, [persons]);

  /**
   * Recargar personas
   */
  const refresh = useCallback(() => {
    loadPersons();
  }, [loadPersons]);

  // Cargar personas al montar el hook
  useEffect(() => {
    loadPersons();
  }, [loadPersons]);

  // Actualizar filteredPersons cuando cambian las personas
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPersons(persons);
    } else {
      searchPersons(searchTerm);
    }
  }, [persons, searchTerm, searchPersons]);

  return {
    // Estado
    persons: filteredPersons,
    allPersons: persons,
    loading,
    error,
    searchTerm,
    
    // Acciones
    loadPersons,
    searchPersons,
    clearSearch,
    refresh,
    
    // Utilidades
    getPersonById,
    fetchPersonById,
    formatPerson,
    validatePerson,
    
    // Estados computados
    hasPersons: persons.length > 0,
    isSearching: !!searchTerm,
    isEmpty: filteredPersons.length === 0,
    total: persons.length,
    filteredTotal: filteredPersons.length
  };
};

/**
 * Hook simplificado para solo obtener personas
 * Útil cuando solo necesitas la lista sin funcionalidad de búsqueda
 */
export const usePersonsList = () => {
  const [persons, setPersons] = useState<PersonAPIResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPersons = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await personService.getAllPersons();
      setPersons(data as PersonAPIResponse[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar personas';
      setError(errorMessage);
      // Usar datos mock en caso de error
      setPersons(personService.getMockPersons() as PersonAPIResponse[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersons();
  }, [loadPersons]);

  return { persons, loading, error, refresh: loadPersons };
};

export default usePersons;