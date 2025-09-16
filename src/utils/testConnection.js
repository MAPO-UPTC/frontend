// src/utils/testConnection.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://142.93.187.32:8000';

/**
 * Prueba la conectividad con el backend de MAPO
 * @returns {Promise<boolean>} true si la conexión es exitosa
 */
export async function testBackendConnection() {
  console.log('🔍 Probando conectividad con el backend MAPO...');
  console.log('📡 URL del backend:', API_URL);
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Probando health check...');
    const healthResponse = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log('✅ Health Check:', healthResponse.data);
    
    // Test 2: Productos públicos
    console.log('2️⃣ Probando endpoint de productos...');
    const productsResponse = await axios.get(`${API_URL}/products/`, { timeout: 5000 });
    console.log('✅ Productos:', productsResponse.data.length, 'productos encontrados');
    
    // Test 3: OpenAPI spec
    console.log('3️⃣ Probando documentación API...');
    const openApiResponse = await axios.get(`${API_URL}/openapi.json`, { timeout: 5000 });
    console.log('✅ OpenAPI:', openApiResponse.data.info.title, 'v' + openApiResponse.data.info.version);
    
    console.log('🎉 ¡Todas las pruebas pasaron! El backend está funcionando correctamente.');
    return true;
    
  } catch (error) {
    console.error('❌ Error conectando al backend:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 No se pudo conectar al servidor. Verifica que el backend esté ejecutándose.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏱️ Timeout - El servidor no responde. Revisa la URL o la conexión a internet.');
    } else if (error.response) {
      console.error('📝 Respuesta del servidor:', error.response.status, error.response.data);
    }
    
    return false;
  }
}

/**
 * Prueba una función específica (login, crear producto, etc.)
 */
export async function testSpecificEndpoint(endpoint, method = 'GET', data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 5000
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${endpoint}:`, response.data);
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}