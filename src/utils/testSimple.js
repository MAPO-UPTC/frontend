// Test simple y directo para MAPO API
// Ejecutar paso a paso en la consola del navegador

const API_URL = 'http://142.93.187.32:8000';

// =============================================
// PASO 1: Test de Conectividad
// =============================================
export const testStep1_Connectivity = async () => {
  console.log('🔍 PASO 1: Probando conectividad básica...');
  
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    console.log('✅ Conectividad OK');
    console.log('   Status:', data.status);
    console.log('   Environment:', data.environment);
    console.log('   Database:', data.services?.database);
    console.log('   Firebase:', data.services?.firebase);
    
    return true;
  } catch (error) {
    console.error('❌ Error de conectividad:', error.message);
    return false;
  }
};

// =============================================
// PASO 2: Test de Registro con Datos Correctos
// =============================================
export const testStep2_Signup = async () => {
  console.log('🔍 PASO 2: Probando registro con datos correctos...');
  
  // Datos con la estructura EXACTA que espera el backend
  const userData = {
    name: 'Test',
    last_name: 'Usuario',
    document_type: 'CC',
    document_number: Date.now().toString(), // Número único
    email: `test-${Date.now()}@example.com`, // Email único
    password: 'TestPassword123!'
  };
  
  console.log('📝 Datos a enviar:', userData);
  
  try {
    const response = await fetch(`${API_URL}/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.json();
    console.log('📡 Response Data:', responseData);
    
    if (response.ok) {
      console.log('✅ Registro exitoso!');
      console.log('   User ID:', responseData.user_id);
      console.log('   Email usado:', userData.email);
      
      // Guardar datos para el siguiente test
      window.testUserData = userData;
      
      return { success: true, userData, responseData };
    } else {
      console.error('❌ Error en registro:', responseData);
      return { success: false, error: responseData, userData };
    }
  } catch (error) {
    console.error('❌ Error de red en registro:', error.message);
    return { success: false, error: error.message, userData };
  }
};

// =============================================
// PASO 3: Test de Login
// =============================================
export const testStep3_Login = async (email, password) => {
  console.log('🔍 PASO 3: Probando login...');
  
  // Si no se proporcionan credenciales, usar las del test anterior
  if (!email && window.testUserData) {
    email = window.testUserData.email;
    password = window.testUserData.password;
  }
  
  if (!email || !password) {
    console.error('❌ No hay credenciales para probar login');
    console.log('   Ejecuta primero testStep2_Signup() o proporciona email y password');
    return { success: false, error: 'No credentials' };
  }
  
  console.log('📝 Intentando login con:', email);
  
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    console.log('📡 Response Status:', response.status);
    
    const responseData = await response.json();
    console.log('📡 Response Data:', responseData);
    
    if (response.ok) {
      console.log('✅ Login exitoso!');
      console.log('   Token recibido:', responseData.idToken ? 'Sí' : 'No');
      console.log('   User data:', responseData.user ? 'Sí' : 'No');
      
      if (responseData.idToken) {
        window.testToken = responseData.idToken;
        console.log('   Token guardado en window.testToken');
      }
      
      return { success: true, responseData };
    } else {
      console.error('❌ Error en login:', responseData);
      return { success: false, error: responseData };
    }
  } catch (error) {
    console.error('❌ Error de red en login:', error.message);
    return { success: false, error: error.message };
  }
};

// =============================================
// PASO 4: Test de Endpoint Protegido
// =============================================
export const testStep4_ProtectedEndpoint = async () => {
  console.log('🔍 PASO 4: Probando endpoint protegido...');
  
  const token = window.testToken;
  if (!token) {
    console.error('❌ No hay token disponible');
    console.log('   Ejecuta primero testStep3_Login()');
    return { success: false, error: 'No token' };
  }
  
  try {
    const response = await fetch(`${API_URL}/users/ping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Response Status:', response.status);
    
    const responseData = await response.json();
    console.log('📡 Response Data:', responseData);
    
    if (response.ok) {
      console.log('✅ Endpoint protegido funciona!');
      return { success: true, responseData };
    } else {
      console.error('❌ Error en endpoint protegido:', responseData);
      return { success: false, error: responseData };
    }
  } catch (error) {
    console.error('❌ Error de red en endpoint protegido:', error.message);
    return { success: false, error: error.message };
  }
};

// =============================================
// TEST COMPLETO AUTOMÁTICO
// =============================================
export const runCompleteTest = async () => {
  console.log('🚀 INICIANDO TEST COMPLETO DE MAPO API...');
  console.log('================================================');
  
  const results = {};
  
  // Paso 1: Conectividad
  results.connectivity = await testStep1_Connectivity();
  console.log('');
  
  if (!results.connectivity) {
    console.log('❌ Test abortado: Sin conectividad');
    return results;
  }
  
  // Paso 2: Registro
  results.signup = await testStep2_Signup();
  console.log('');
  
  // Paso 3: Login (solo si el registro fue exitoso)
  if (results.signup.success) {
    results.login = await testStep3_Login();
    console.log('');
    
    // Paso 4: Endpoint protegido (solo si login fue exitoso)
    if (results.login.success) {
      results.protected = await testStep4_ProtectedEndpoint();
      console.log('');
    }
  }
  
  // Resumen final
  console.log('📊 RESUMEN FINAL:');
  console.log('================================================');
  console.log('Conectividad:', results.connectivity ? '✅' : '❌');
  console.log('Registro:', results.signup?.success ? '✅' : '❌');
  console.log('Login:', results.login?.success ? '✅' : '❌');
  console.log('Endpoint Protegido:', results.protected?.success ? '✅' : '❌');
  
  console.log('');
  console.log('🎯 Para obtener detalles específicos de errores, revisa los logs arriba');
  
  return results;
};

// =============================================
// FUNCIONES GLOBALES PARA LA CONSOLA
// =============================================
if (typeof window !== 'undefined') {
  window.mapoTest = {
    step1: testStep1_Connectivity,
    step2: testStep2_Signup,
    step3: testStep3_Login,
    step4: testStep4_ProtectedEndpoint,
    runAll: runCompleteTest,
    
    // Funciones de utilidad
    checkConnection: testStep1_Connectivity,
    testSignup: testStep2_Signup,
    testLogin: testStep3_Login,
    testPing: testStep4_ProtectedEndpoint
  };
  
  console.log('🧪 MAPO Test Suite cargado!');
  console.log('   Usa window.mapoTest.runAll() para ejecutar todos los tests');
  console.log('   O ejecuta pasos individuales:');
  console.log('   - window.mapoTest.step1() // Conectividad');
  console.log('   - window.mapoTest.step2() // Registro');
  console.log('   - window.mapoTest.step3() // Login');
  console.log('   - window.mapoTest.step4() // Endpoint protegido');
}