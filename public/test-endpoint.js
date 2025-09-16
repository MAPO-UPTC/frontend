// test-endpoint.js - Script para probar endpoints específicos
const testLogin = async () => {
  console.log('🔐 Probando endpoint de login...');
  
  try {
    const response = await fetch('http://142.93.187.32:8000/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123456'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
    // Verificar qué campo contiene el token
    if (data.token) {
      console.log('✅ Token encontrado en campo "token":', data.token);
    } else if (data.idToken) {
      console.log('✅ Token encontrado en campo "idToken":', data.idToken);
    } else {
      console.log('❌ No se encontró token en la respuesta');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

const testHealth = async () => {
  console.log('🏥 Probando health check...');
  
  try {
    const response = await fetch('http://142.93.187.32:8000/health');
    const data = await response.json();
    console.log('✅ Health:', data);
  } catch (error) {
    console.error('❌ Health Error:', error);
  }
};

const testProducts = async () => {
  console.log('📦 Probando productos...');
  
  try {
    const response = await fetch('http://142.93.187.32:8000/products/');
    const data = await response.json();
    console.log('✅ Productos:', data);
  } catch (error) {
    console.error('❌ Products Error:', error);
  }
};

// Ejecutar pruebas
console.log('🧪 Iniciando pruebas de endpoints...');
testHealth();
testProducts();
testLogin();

// Hacer disponibles las funciones globalmente
window.testLogin = testLogin;
window.testHealth = testHealth;
window.testProducts = testProducts;