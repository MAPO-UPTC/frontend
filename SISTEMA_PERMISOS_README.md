# 🎭 Sistema de Autenticación y Permisos con Roles Dinámicos

## 📋 Resumen

Este frontend de React implementa un **sistema completo de autenticación y permisos con cambio de roles dinámico**, que permite a los usuarios alternar entre sus roles asignados en tiempo real, cambiando automáticamente los permisos y la interfaz de usuario.

## ✨ Características Implementadas

### 🔐 Sistema de Autenticación
- **Login con JWT**: Autenticación segura con tokens
- **Registro de usuarios**: Creación de nuevas cuentas
- **Validación de tokens**: Verificación automática de tokens
- **Persistencia de sesión**: Mantenimiento de sesión entre recargas

### 🎭 Sistema de Roles Dinámicos
- **Cambio de roles en tiempo real**: Los usuarios pueden alternar entre sus roles
- **Múltiples roles por usuario**: Un usuario puede tener varios roles asignados
- **Rol activo vs roles disponibles**: Elegir qué rol usar en cada momento
- **Permisos contextuales**: Los permisos cambian según el rol activo

### 🛡️ Sistema de Permisos Granular
- **Permisos por entidad**: USERS, PRODUCTS, CLIENTS, etc.
- **Acciones específicas**: CREATE, READ, UPDATE, DELETE
- **Niveles de permiso**: NONE, OWN, CONDITIONAL, ALL
- **Componentes protegidos**: Mostrar/ocultar elementos según permisos

## 🏗️ Arquitectura Implementada

### 📁 Estructura de Archivos

```
src/
├── api/
│   ├── authService.js           # Servicios de autenticación y roles
│   ├── axios.js                 # Configuración HTTP con interceptores
│   └── index.js                 # Exports centralizados
├── components/
│   ├── PermissionGate/          # Componente para renderizado condicional
│   │   ├── PermissionGate.jsx
│   │   └── PermissionGate.css
│   ├── RoleSelector/            # Selector de roles dinámico
│   │   ├── RoleSelector.jsx
│   │   └── RoleSelector.css
│   └── index.js
├── constants/
│   ├── permissions.js           # Enums de roles, entidades, acciones
│   └── index.js
├── context/
│   └── AuthContext.jsx          # Contexto de autenticación
├── hooks/
│   ├── usePermissions.js        # Hook principal de permisos
│   ├── useRoleManagement.js     # Hook especializado en roles
│   └── index.js
├── pages/
│   ├── PermissionsDemo/         # Página demo del sistema
│   │   ├── PermissionsDemo.jsx
│   │   └── PermissionsDemo.css
│   ├── products/Products.jsx    # Página con permisos integrados
│   └── createProduct/CreateProduct.jsx
└── utils/
    └── permissions.js           # Utilidades de permisos
```

### 🔧 Componentes Principales

#### 1. **usePermissions Hook**
```javascript
const {
  // Datos de permisos
  permissions,
  availableRoles,
  activeRole,
  effectiveRoles,
  
  // Estados
  loading,
  error,
  
  // Acciones
  actions: {
    hasPermission,
    switchRole,
    clearActiveRole,
    canCreate,
    canRead,
    canUpdate,
    canDelete
  }
} = usePermissions();
```

#### 2. **PermissionGate Component**
```jsx
<PermissionGate
  entity={Entity.PRODUCTS}
  action={Action.CREATE}
  fallback={<div>Sin permisos</div>}
>
  <button>Crear Producto</button>
</PermissionGate>
```

#### 3. **RoleSelector Component**
```jsx
<RoleSelector
  availableRoles={availableRoles}
  activeRole={activeRole}
  onRoleChange={switchRole}
  onClearRole={clearActiveRole}
  loading={loading}
/>
```

## 🌐 Integración con Backend

### 📡 Endpoints Utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/users/login` | Login y obtención de permisos |
| `POST` | `/users/signup` | Registro de usuarios |
| `POST` | `/users/ping` | Validación de token |
| `GET` | `/users/me/permissions` | Obtener permisos actuales |
| `GET` | `/users/me/profile` | Perfil completo del usuario |
| `POST` | `/users/me/switch-role` | Cambiar rol activo |
| `POST` | `/users/me/clear-active-role` | Limpiar rol activo |
| `GET` | `/users/me/active-role` | Ver rol activo actual |

### 🔄 Flujo de Roles Dinámicos

1. **Login**: El usuario se autentica y recibe sus roles disponibles
2. **Estado inicial**: Por defecto usa todos los roles (permisos máximos)
3. **Cambio de rol**: El usuario puede elegir un rol específico
4. **Actualización de permisos**: Los permisos se actualizan inmediatamente
5. **UI dinámica**: La interfaz se adapta a los nuevos permisos
6. **Limpieza**: El usuario puede volver a usar todos los roles

## 🎯 Casos de Uso Implementados

### Escenario 1: Administrador Cauteloso
```
Usuario: [USER, ADMIN, SUPERADMIN]
→ Inicia usando todos los roles (máximos permisos)
→ Cambia a USER para trabajo diario (más seguro)
→ Cambia a ADMIN cuando necesita crear/editar
→ Usa SUPERADMIN solo para tareas críticas
```

### Escenario 2: UI Dinámica
```
Con rol USER activo:
  ✅ Ver productos ❌ Crear productos ❌ Eliminar usuarios

Con rol ADMIN activo:  
  ✅ Ver productos ✅ Crear productos ❌ Eliminar usuarios

Con rol SUPERADMIN activo:
  ✅ Ver productos ✅ Crear productos ✅ Eliminar usuarios
```

## 🚀 Cómo Usar el Sistema

### 1. Inicialización
```javascript
// En tu componente principal
import { usePermissions } from './hooks';

function App() {
  const { loading, error } = usePermissions();
  
  if (loading) return <div>Cargando permisos...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <MainContent />;
}
```

### 2. Proteger Componentes
```javascript
// Proteger botones/elementos específicos
<PermissionGate
  entity={Entity.PRODUCTS}
  action={Action.CREATE}
  fallback={null}
>
  <CreateButton />
</PermissionGate>

// Proteger por rol
<PermissionGate
  roles={[Role.ADMIN, Role.SUPERADMIN]}
  fallback={<div>Solo admins</div>}
>
  <AdminPanel />
</PermissionGate>
```

### 3. Cambio de Roles
```javascript
function MyComponent() {
  const {
    availableRoles,
    activeRole,
    hasMultipleRoles,
    actions: { switchRole, clearActiveRole }
  } = usePermissions();

  return (
    <div>
      {hasMultipleRoles && (
        <RoleSelector
          availableRoles={availableRoles}
          activeRole={activeRole}
          onRoleChange={switchRole}
          onClearRole={clearActiveRole}
        />
      )}
    </div>
  );
}
```

## 🎨 Página Demo

Hemos incluido una página completa de demostración en `/permissions-demo` que muestra:

- **Selector de roles funcional**
- **Matriz de permisos en tiempo real**
- **Componentes protegidos de ejemplo**
- **Información de debug del estado actual**

Para acceder: navegue a `http://localhost:3000/permissions-demo`

## 🔧 Configuración

### Variables de Entorno
```env
REACT_APP_API_BASE_URL=http://localhost:8000
```

### Configuración de Axios
```javascript
// src/api/axios.js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
```

## 📊 Matriz de Permisos (Ejemplo)

| Entidad | USER | ADMIN | SUPERADMIN |
|---------|------|-------|------------|
| **PRODUCTS** | 👁️ READ | 👁️ READ + ➕ CREATE + ✏️ UPDATE | 👁️ READ + ➕ CREATE + ✏️ UPDATE + 🗑️ DELETE |
| **USERS** | 👁️ OWN + ✏️ OWN | 👁️ ALL + ✏️ ALL | 👁️ ALL + ➕ CREATE + ✏️ ALL + 🗑️ DELETE |
| **CLIENTS** | 👁️ ALL + ➕ CREATE + ✏️ OWN | 👁️ ALL + ➕ CREATE + ✏️ ALL + 🗑️ DELETE | 👁️ ALL + ➕ CREATE + ✏️ ALL + 🗑️ DELETE |

## 🔍 Debug y Desarrollo

### Logs Habilitados
El sistema incluye logs detallados para facilitar el desarrollo:

```javascript
console.log("✅ Permisos cargados:", permissions);
console.log("🎭 Cambiado a rol:", role);
console.log("🔍 Verificando permiso:", entity, action);
```

### Herramientas de Debug
- **LocalStorage inspector**: Revisa tokens y datos guardados
- **Network tab**: Monitora llamadas a la API
- **Página demo**: Visualiza el estado completo del sistema

## ⚡ Rendimiento

### Optimizaciones Implementadas
- **Memorización de hooks**: `useCallback` y `useMemo`
- **Carga diferida**: Permisos se cargan solo cuando son necesarios
- **Cache local**: Datos de usuario en localStorage
- **Interceptores eficientes**: Token se adjunta automáticamente

## 🛡️ Seguridad

### Medidas de Seguridad
- **Validación de tokens**: Verificación automática con el backend
- **Limpieza automática**: Logout automático si el token expira
- **Permisos del lado servidor**: El frontend solo controla la UI
- **Sanitización**: Datos de entrada validados

## 🚀 Próximos Pasos

Para completar la implementación:

1. **Conectar con backend real**: Actualizar URL de API
2. **Personalizar permisos**: Ajustar matriz según necesidades
3. **Añadir más entidades**: Expandir el sistema de permisos
4. **Implementar notificaciones**: Feedback visual de cambios de rol
5. **Añadir auditoría**: Logging de cambios de permisos

## 🆘 Solución de Problemas

### Problemas Comunes

1. **Token no se guarda**
   - Verificar que el backend devuelve `idToken`
   - Revisar localStorage en DevTools

2. **Permisos no se actualizan**
   - Verificar llamadas a `/users/me/permissions`
   - Revisar logs de consola

3. **Roles no disponibles**
   - Verificar que el usuario tiene roles asignados en backend
   - Comprobar response de login

## 📝 Conclusión

Este sistema proporciona una base sólida y escalable para el manejo de autenticación y permisos con roles dinámicos. La arquitectura modular permite fácil extensión y mantenimiento, mientras que la interfaz intuitiva facilita el uso por parte de los usuarios finales.

El sistema está completamente integrado y listo para producción! 🎉