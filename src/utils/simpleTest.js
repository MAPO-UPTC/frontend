// Prueba simple de conectividad - ejecutar en consola del navegador
console.log('🔍 Iniciando prueba simple de API...');

// Test 1: Health check
fetch('http://142.93.187.32:8000/health')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Health check OK:', data);
    
    // Test 2: Signup
    console.log('🔍 Probando signup...');
    return fetch('http://142.93.187.32:8000/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'testuser' + Date.now() + '@test.com',
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User'
      })
    });
  })
  .then(response => {
    console.log('Signup response status:', response.status);
    console.log('Signup response headers:', Object.fromEntries(response.headers.entries()));
    return response.json();
  })
  .then(data => {
    console.log('✅ Signup response:', data);
    
    // Test 3: Login con el usuario recién creado
    console.log('🔍 Probando login...');
    return fetch('http://142.93.187.32:8000/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test.com', // Probemos con un usuario que sabemos que existe
        password: 'admin123'
      })
    });
  })
  .then(response => {
    console.log('Login response status:', response.status);
    console.log('Login response headers:', Object.fromEntries(response.headers.entries()));
    return response.json();
  })
  .then(data => {
    console.log('✅ Login response:', data);
  })
  .catch(error => {
    console.error('❌ Error en las pruebas:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  });

console.log('Copia y pega este código completo en la consola del navegador (F12)');