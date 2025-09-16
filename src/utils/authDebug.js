// Diagnóstico completo de autenticación para MAPO
// Usar en la consola del navegador después del login

const authDebug = {
  // 1. Verificar estado actual del localStorage
  checkLocalStorage() {
    console.log('🔍 DIAGNÓSTICO: Estado de localStorage');
    console.log('================================');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Token existe:', !!token);
    if (token) {
      console.log('Token longitud:', token.length);
      console.log('Token preview:', token.slice(0, 50) + '...');
      
      // Verificar si es un JWT válido
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('JWT payload:', payload);
          console.log('JWT expira:', new Date(payload.exp * 1000));
          console.log('JWT aún válido:', payload.exp * 1000 > Date.now());
        }
      } catch (error) {
        console.log('❌ Token no parece ser JWT válido:', error.message);
      }
    }
    
    console.log('Usuario existe:', !!user);
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('Usuario parseado:', userData);
      } catch (error) {
        console.log('❌ Error parseando usuario:', error.message);
      }
    }
    
    console.log('');
    return { token: !!token, user: !!user };
  },

  // 2. Probar el endpoint /users/ping
  async testPing() {
    console.log('🔍 DIAGNÓSTICO: Test de /users/ping');
    console.log('==================================');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No hay token para probar');
      return false;
    }
    
    try {
      const response = await fetch('http://142.93.187.32:8000/users/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        console.log('✅ Token válido en el backend');
        return true;
      } else {
        console.log('❌ Token inválido en el backend');
        return false;
      }
    } catch (error) {
      console.log('❌ Error en ping:', error.message);
      return false;
    }
  },

  // 3. Simular el flujo completo de login
  async simulateLoginFlow(email = 'mapotest@gmail.com', password = 'MapoTest123!') {
    console.log('🔍 DIAGNÓSTICO: Simulación completa de login');
    console.log('============================================');
    
    // Limpiar localStorage
    localStorage.clear();
    console.log('1. localStorage limpiado');
    
    try {
      // Paso 1: Login
      console.log('2. Ejecutando login...');
      const loginResponse = await fetch('http://142.93.187.32:8000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const loginData = await loginResponse.json();
      console.log('   Login response:', loginData);
      
      if (!loginResponse.ok) {
        throw new Error('Login falló: ' + JSON.stringify(loginData));
      }
      
      // Paso 2: Guardar token manualmente (como lo hace authService)
      console.log('3. Guardando token...');
      if (loginData.idToken) {
        localStorage.setItem('token', loginData.idToken);
        console.log('   Token guardado');
      }
      
      if (loginData.user) {
        localStorage.setItem('user', JSON.stringify(loginData.user));
        console.log('   Usuario guardado');
      }
      
      // Paso 3: Verificar que se guardó
      console.log('4. Verificando guardado...');
      this.checkLocalStorage();
      
      // Paso 4: Probar ping
      console.log('5. Probando validación...');
      const pingResult = await this.testPing();
      
      console.log('');
      console.log('📊 RESUMEN:');
      console.log('Login:', loginResponse.ok ? '✅' : '❌');
      console.log('Token guardado:', !!localStorage.getItem('token') ? '✅' : '❌');
      console.log('Usuario guardado:', !!localStorage.getItem('user') ? '✅' : '❌');
      console.log('Token válido:', pingResult ? '✅' : '❌');
      
      return {
        login: loginResponse.ok,
        tokenSaved: !!localStorage.getItem('token'),
        userSaved: !!localStorage.getItem('user'),
        tokenValid: pingResult
      };
      
    } catch (error) {
      console.log('❌ Error en simulación:', error.message);
      return { error: error.message };
    }
  },

  // 4. Monitorear localStorage en tiempo real
  monitorLocalStorage() {
    console.log('🔍 DIAGNÓSTICO: Monitor de localStorage activo');
    console.log('=============================================');
    
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;
    
    localStorage.setItem = function(key, value) {
      console.log(`📝 localStorage.setItem('${key}', '${value.slice(0, 50)}${value.length > 50 ? '...' : ''}')`);
      return originalSetItem.apply(this, arguments);
    };
    
    localStorage.removeItem = function(key) {
      console.log(`🗑️ localStorage.removeItem('${key}')`);
      return originalRemoveItem.apply(this, arguments);
    };
    
    localStorage.clear = function() {
      console.log('🧹 localStorage.clear()');
      return originalClear.apply(this, arguments);
    };
    
    console.log('Monitor activo. Para desactivar, recarga la página.');
  },

  // 5. Test específico del AuthContext
  async testAuthContext() {
    console.log('🔍 DIAGNÓSTICO: Simulación del AuthContext');
    console.log('==========================================');
    
    // Simular lo que hace useEffect en AuthContext
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('Estado inicial:');
    console.log('  Token existe:', !!token);
    console.log('  Usuario existe:', !!savedUser);
    
    if (token && savedUser) {
      console.log('Paso AuthContext: Token y usuario encontrados');
      
      try {
        // Simular ping como lo hace AuthContext
        const pingResponse = await fetch('http://142.93.187.32:8000/users/ping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (pingResponse.ok) {
          console.log('✅ AuthContext: Token válido, usuario autenticado');
          return true;
        } else {
          console.log('❌ AuthContext: Token inválido, ejecutando logout');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return false;
        }
      } catch (error) {
        console.log('❌ AuthContext: Error en ping, ejecutando logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
    } else {
      console.log('❌ AuthContext: No hay token o usuario, no autenticado');
      return false;
    }
  },

  // 6. Función para redirigir manualmente al login
  manualLogout() {
    console.log('🔄 Ejecutando logout manual...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ localStorage limpiado');
    console.log('🔄 Redirigiendo al login...');
    window.location.href = '/login';
  },

  // 7. Función para revisar el flujo completo después del login
  postLoginCheck() {
    console.log('🔍 DIAGNÓSTICO POST-LOGIN');
    console.log('=========================');
    
    console.log('1. Estado de localStorage:');
    this.checkLocalStorage();
    
    console.log('2. Test de ping:');
    return this.testPing().then(result => {
      console.log('3. Resultado de ping:', result ? '✅' : '❌');
      
      console.log('4. Recomendaciones:');
      if (result) {
        console.log('   ✅ Todo funciona correctamente');
      } else {
        console.log('   ❌ Token inválido detectado');
        console.log('   🔧 Para logout manual: authDebug.manualLogout()');
      }
      
      return result;
    });
  }
};

// Hacer disponible globalmente
window.authDebug = authDebug;

console.log('🧪 Auth Debug cargado!');
console.log('Comandos disponibles:');
console.log('  authDebug.checkLocalStorage() - Verificar estado actual');
console.log('  authDebug.testPing() - Probar validación de token');
console.log('  authDebug.postLoginCheck() - Check completo post-login');
console.log('  authDebug.manualLogout() - Logout manual');
console.log('  authDebug.simulateLoginFlow() - Simulación completa');
console.log('  authDebug.monitorLocalStorage() - Monitor en tiempo real');
console.log('  authDebug.testAuthContext() - Simular AuthContext');

export default authDebug;