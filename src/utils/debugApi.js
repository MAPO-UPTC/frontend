// src/utils/debugApi.js
import axios from 'axios';

const API_URL = 'http://142.93.187.32:8000';

// Test básico de conectividad sin axios personalizado
export const basicConnectivityTest = async () => {
  console.log('🔍 Probando conectividad básica...');
  
  try {
    // Test con fetch nativo (más básico)
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('✅ Fetch nativo exitoso:', data);
    
    // Test con axios directo
    const axiosResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Axios directo exitoso:', axiosResponse.data);
    
    return true;
  } catch (error) {
    console.error('❌ Error de conectividad:', error);
    return false;
  }
};

/**
 * Función para probar la conectividad y endpoints específicos
 */
export const debugApi = {
  async testHealth() {
    try {
      console.log('🔍 Probando Health Check...');
      const response = await axios.get(`${API_URL}/health`);
      console.log('✅ Health Check exitoso:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Health Check falló:', error);
      return { success: false, error: error.message, details: error.response?.data };
    }
  },

  async testLogin(email = 'mapotest@gmail.com', password = 'MapoTest123!') {
    try {
      console.log('🔍 Probando Login...');
      console.log('URL:', `${API_URL}/users/login`);
      console.log('Datos enviados:', { email, password });
      
      // Test 1: Con fetch nativo
      console.log('--- Test con fetch nativo ---');
      const fetchResponse = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Fetch Response Status:', fetchResponse.status);
      console.log('Fetch Response Headers:', Object.fromEntries(fetchResponse.headers.entries()));
      
      const fetchData = await fetchResponse.json();
      console.log('Fetch Response Data:', fetchData);
      
      if (!fetchResponse.ok) {
        throw new Error(`HTTP ${fetchResponse.status}: ${JSON.stringify(fetchData)}`);
      }
      
      // Test 2: Con axios
      console.log('--- Test con axios ---');
      const axiosResponse = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Login exitoso (ambos métodos)');
      console.log('Axios response:', axiosResponse.data);
      return { success: true, data: axiosResponse.data, fetchData };
      
    } catch (error) {
      console.error('❌ Login falló:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request method:', error.config?.method);
      console.error('Request headers:', error.config?.headers);
      console.error('Request data:', error.config?.data);
      
      return { 
        success: false, 
        error: error.message, 
        status: error.response?.status,
        details: error.response?.data,
        config: error.config
      };
    }
  },

  async testSignup(userData = {
    name: 'Test',
    last_name: 'User',
    document_type: 'CC',
    document_number: '12345678',
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!'
  }) {
    try {
      console.log('🔍 Probando Signup...');
      console.log('URL:', `${API_URL}/users/signup`);
      console.log('Datos:', userData);
      
      const response = await axios.post(`${API_URL}/users/signup`, userData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Signup exitoso:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Signup falló:', error);
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      return { 
        success: false, 
        error: error.message, 
        status: error.response?.status,
        details: error.response?.data 
      };
    }
  },

  async testEndpoints() {
    console.log('🚀 Iniciando pruebas de API...');
    
    const healthResult = await this.testHealth();
    const loginResult = await this.testLogin();
    const signupResult = await this.testSignup();
    
    console.log('📊 Resumen de pruebas:');
    console.log('Health:', healthResult.success ? '✅' : '❌');
    console.log('Login:', loginResult.success ? '✅' : '❌');
    console.log('Signup:', signupResult.success ? '✅' : '❌');
    
    return {
      health: healthResult,
      login: loginResult,
      signup: signupResult
    };
  },

  // Función específica para probar endpoints disponibles
  async testAvailableEndpoints() {
    console.log('🔍 Probando endpoints disponibles...');
    
    const endpoints = [
      '/health',
      '/docs',
      '/openapi.json',
      '/users/login',
      '/users/signup',
      '/users/',
      '/products/'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}`, { timeout: 5000 });
        console.log(`✅ ${endpoint}: ${response.status} - ${response.statusText}`);
      } catch (error) {
        const status = error.response?.status || 'No response';
        const statusText = error.response?.statusText || error.message;
        console.log(`❌ ${endpoint}: ${status} - ${statusText}`);
        
        if (error.response?.data) {
          console.log(`   Detalles:`, error.response.data);
        }
      }
    }
  },

  // Test específico con datos de un usuario que sabemos que existe
  async testWithRealCredentials() {
    console.log('🔍 Probando con credenciales de ejemplo...');
    
    // Primero intentemos crear un usuario
    const testUser = {
      name: 'Debug',
      last_name: 'User',
      document_type: 'CC',
      document_number: '87654321',
      email: 'debug@mapo.com',
      password: 'DebugPassword123!'
    };
    
    console.log('1. Intentando crear usuario de prueba...');
    const signupResult = await this.testSignup(testUser);
    
    console.log('2. Intentando hacer login con el usuario...');
    const loginResult = await this.testLogin(testUser.email, testUser.password);
    
    return { signup: signupResult, login: loginResult };
  }
};

// Función global para usar en la consola del navegador
window.debugMAPO = debugApi;
window.basicTest = basicConnectivityTest;