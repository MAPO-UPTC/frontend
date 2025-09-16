# 🧪 MAPO - Instrucciones para Diagnóstico de API

## ✅ CAMBIOS REALIZADOS

1. **Corregida estructura de datos para API**: Los campos de registro ahora coinciden exactamente con lo esperado por el backend
2. **Actualizado debugApi.js**: Usa `name`, `last_name`, `document_type`, `document_number`
3. **Creado testSimple.js**: Script paso a paso para diagnóstico completo
4. **Componente Signup**: Ya tenía la estructura correcta ✅

## 🚀 CÓMO PROBAR LA CORRECCIÓN

### Opción 1: Test Automático Completo (RECOMENDADO)

1. **Inicia el frontend:**
   ```bash
   npm start
   ```

2. **Abre la consola del navegador:**
   - Presiona `F12`
   - Ve a la pestaña `Console`

3. **Ejecuta el test completo:**
   ```javascript
   window.mapoTest.runAll()
   ```

### Opción 2: Tests Paso a Paso

Si quieres ejecutar cada paso individualmente:

```javascript
// Paso 1: Conectividad
window.mapoTest.step1()

// Paso 2: Registro (con datos correctos)
window.mapoTest.step2()

// Paso 3: Login (usa los datos del paso 2)
window.mapoTest.step3()

// Paso 4: Endpoint protegido
window.mapoTest.step4()
```

### Opción 3: Test con datos específicos

```javascript
// Login con credenciales específicas
window.mapoTest.testLogin('tu@email.com', 'tupassword')
```

## 📝 QUÉ BUSCAR EN LOS RESULTADOS

### ✅ ÉXITO - Deberías ver:
```
✅ Conectividad OK
✅ Registro exitoso!
   User ID: ABC123
✅ Login exitoso!
   Token recibido: Sí
✅ Endpoint protegido funciona!

📊 RESUMEN FINAL:
Conectividad: ✅
Registro: ✅
Login: ✅
Endpoint Protegido: ✅
```

### ❌ ERROR - Posibles problemas:

1. **Error de conectividad**: Problema de red o backend caído
2. **Error 400 en registro**: Datos mal formateados (ya corregido)
3. **Error 409 en registro**: Email ya existe (usar email único)
4. **Error en login**: Credenciales incorrectas o formato incorrecto

## 🔧 DATOS DE PRUEBA CORRECTOS

El test ahora usa automáticamente la estructura correcta:

```javascript
{
  name: 'Test',
  last_name: 'Usuario', 
  document_type: 'CC',
  document_number: '12345678',
  email: 'test-1234567890@example.com', // Email único
  password: 'TestPassword123!'
}
```

## 🎯 SIGUIENTE PASO

**Ejecuta `window.mapoTest.runAll()` en la consola del navegador y comparte los resultados conmigo.**

Si ves errores, copia y pega la salida completa de la consola para identificar el problema específico.

## 📞 SI SIGUE FALLANDO

Si después de estos cambios aún hay problemas, necesitaré:

1. **Salida completa de la consola** después de ejecutar `window.mapoTest.runAll()`
2. **Screenshot de la pestaña Network** en F12 durante el test
3. **Respuesta específica del servidor** que aparece en los logs

---

**🚀 Los cambios deberían resolver el problema de autenticación. ¡Prueba ahora!**