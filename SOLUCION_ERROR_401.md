# 🔧 Solución Error 401 - Authentication Required

## 🚨 Problema

```
POST http://localhost:8000/sales/ 401 (Unauthorized)
API Error [/sales/]: Error: Authentication required
```

### Causa

El token de autenticación no se estaba obteniendo dinámicamente del `localStorage`. La instancia del cliente API obtenía el token solo una vez en el constructor, por lo que si el usuario hacía login después de crear la instancia, el token no se actualizaba.

---

## ✅ Solución Implementada

### Cambio en `src/api/client.ts`

**Antes:**
```typescript
constructor(baseURL: string = ...) {
  this.baseURL = baseURL;
  this.token = localStorage.getItem('token');  // ❌ Se obtiene solo una vez
}

private getHeaders(): Record<string, string> {
  const headers = { 'Content-Type': 'application/json' };
  
  if (this.token) {  // ❌ Usa el token del constructor
    headers['Authorization'] = `Bearer ${this.token}`;
  }
  
  return headers;
}
```

**Ahora:**
```typescript
constructor(baseURL: string = ...) {
  this.baseURL = baseURL;
  // ✅ No se inicializa el token aquí
}

private getHeaders(): Record<string, string> {
  const headers = { 'Content-Type': 'application/json' };
  
  // ✅ Siempre obtener el token actualizado del localStorage
  const currentToken = localStorage.getItem('token');
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  
  return headers;
}
```

---

## 🔍 Verificación

### Paso 1: Verificar que tienes token guardado

Abre la consola del navegador y ejecuta:

```javascript
console.log('Token:', localStorage.getItem('token'));
```

**Resultado esperado:**
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Si sale `null`, necesitas hacer login primero.

---

### Paso 2: Verificar que el header se envía

En la consola del navegador, en la pestaña **Network**, busca la petición a `/sales/`:

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 🎯 Flujo Completo

### 1. Login
```typescript
await apiClient.login('user@example.com', 'password');
// Guarda el token en localStorage
```

### 2. Crear Venta
```typescript
await apiClient.createSale(saleData);
// getHeaders() obtiene el token actualizado del localStorage
// Envía: Authorization: Bearer {token}
```

---

## ⚠️ Posibles Causas si Sigue Dando Error

### Causa 1: No hay token en localStorage
**Verificar:**
```javascript
localStorage.getItem('token')
```

**Solución:** Hacer login nuevamente

---

### Causa 2: Token expirado
**Síntoma:** El token existe pero el backend lo rechaza

**Solución:** 
- Cerrar sesión
- Volver a hacer login

```javascript
// Limpiar token expirado
localStorage.removeItem('token');
localStorage.removeItem('user');
// Hacer login nuevamente
```

---

### Causa 3: Formato del token incorrecto
**Verificar:**
```javascript
const token = localStorage.getItem('token');
console.log('Token length:', token?.length);
console.log('Token starts with:', token?.substring(0, 20));
```

**Formato esperado:** JWT largo (eyJhbGc...)

---

### Causa 4: El backend rechaza el token
**Posibles razones:**
- Token firmado con clave diferente
- Token de ambiente diferente (dev vs prod)
- Endpoint de login incorrecto

**Verificar endpoint de login:**
```typescript
// En client.ts, línea ~90
async login(email: string, password: string): Promise<AuthResponse> {
  const response = await this.request<AuthResponse>('/api/v1/auth/login', {
    // ¿Esta ruta es correcta para tu backend?
    ...
  });
}
```

---

## 🔧 Debug Adicional

### Agregar logs temporales

En `src/api/client.ts`, método `getHeaders()`:

```typescript
private getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const currentToken = localStorage.getItem('token');
  console.log('🔑 Token en localStorage:', currentToken ? 'Presente ✅' : 'Ausente ❌');
  console.log('🔑 Token length:', currentToken?.length || 0);
  
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
    console.log('🔑 Authorization header agregado ✅');
  }

  return headers;
}
```

Esto te dirá exactamente qué está pasando con el token.

---

## 📋 Checklist de Solución

- [x] ✅ Modificar `getHeaders()` para obtener token dinámicamente
- [ ] 🔍 Verificar que hay token en localStorage
- [ ] 🔍 Verificar que el header Authorization se envía
- [ ] 🔍 Verificar que el token no está expirado
- [ ] 🔍 Verificar que el endpoint de login es correcto

---

## 🎉 Resultado Esperado

Después de esta corrección, el flujo debería ser:

1. ✅ Usuario hace login → Token se guarda en localStorage
2. ✅ Usuario crea venta → `getHeaders()` obtiene token del localStorage
3. ✅ Request incluye: `Authorization: Bearer {token}`
4. ✅ Backend valida el token → 200 OK

---

**Fecha**: 12 de octubre de 2025  
**Archivo modificado**: `src/api/client.ts`  
**Estado**: ✅ Corregido - Ahora obtiene token dinámicamente
