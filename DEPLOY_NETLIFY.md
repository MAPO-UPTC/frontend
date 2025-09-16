# 🚀 Guía de Despliegue en Netlify - MAPO Frontend

## 📋 Resumen
Esta guía te ayudará a desplegar el frontend de MAPO en Netlify de manera exitosa.

## 📁 Archivos de Configuración Creados

### ✅ Archivos ya configurados:
- `netlify.toml` - Configuración principal de Netlify
- `public/_redirects` - Manejo de rutas de React Router
- `.env.production` - Variables de entorno para producción
- `package.json` - Scripts adicionales para el build

## 🛠️ Pasos para Desplegar

### Método 1: Despliegue desde Git (Recomendado)

1. **Subir código a GitHub:**
   ```bash
   git add .
   git commit -m "Configuración para despliegue en Netlify"
   git push origin main
   ```

2. **En Netlify:**
   - Ve a [netlify.com](https://netlify.com) y haz login
   - Clic en "New site from Git"
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio `MAPO-UPTC/frontend`
   - Netlify detectará automáticamente la configuración del `netlify.toml`

3. **Configuración automática:**
   - Build command: `npm run build` (ya configurado)
   - Publish directory: `build` (ya configurado)
   - Variables de entorno: (ya configuradas en netlify.toml)

### Método 2: Despliegue Manual

1. **Crear build local:**
   ```bash
   npm run build
   ```

2. **En Netlify:**
   - Ve a [netlify.com](https://netlify.com)
   - Arrastra la carpeta `build` al área de despliegue

## 🔧 Variables de Entorno en Netlify

Si necesitas configurar variables manualmente en Netlify:

1. Ve a **Site Settings** > **Environment Variables**
2. Agrega estas variables:
   ```
   REACT_APP_API_BASE_URL = http://142.93.187.32:8000
   REACT_APP_ENVIRONMENT = production
   GENERATE_SOURCEMAP = false
   CI = false
   ```

## 🌐 Configuración de Dominio

### Dominio por defecto:
Netlify te asignará un dominio como: `https://amazing-name-123456.netlify.app`

### Dominio personalizado (opcional):
1. Ve a **Domain Settings**
2. Clic en "Add custom domain"
3. Ingresa tu dominio (ej: `mapo-frontend.com`)
4. Configura DNS según las instrucciones

## 🔐 Configuración CORS

**IMPORTANTE:** Una vez desplegado, necesitarás actualizar la configuración CORS del backend para incluir tu dominio de Netlify:

```python
# En el backend, agregar a la lista de orígenes permitidos:
origins = [
    "http://localhost:3000",           # desarrollo local
    "https://tu-app.netlify.app",      # tu dominio de Netlify
    "https://tu-dominio-custom.com",   # si tienes dominio personalizado
]
```

## 🧪 Verificar Despliegue

Después del despliegue, verifica que funcionen:

1. **✅ Carga inicial:** La página principal se carga
2. **✅ Rutas:** Navegar entre páginas funciona
3. **✅ API:** Conectividad con el backend en `http://142.93.187.32:8000`
4. **✅ Login:** Sistema de autenticación funciona
5. **✅ Productos:** Listado y creación de productos

## 🐛 Solución de Problemas

### Error: "Site can't be reached"
- Verifica que el build se completó sin errores
- Revisa los logs de build en Netlify

### Error de CORS
- Actualiza la configuración CORS del backend
- Verifica que la URL del backend sea correcta

### Error 404 en rutas
- Verifica que existe el archivo `public/_redirects`
- Confirma que el contenido del archivo es correcto

### API no responde
- Verifica que `REACT_APP_API_BASE_URL` esté correcta
- Prueba la URL del backend directamente en el navegador

## 📊 Comandos Útiles

```bash
# Build local para testing
npm run build

# Servir build localmente
npm run serve

# Build específico para producción
npm run build:prod
```

## 🔗 URLs Importantes

- **Backend API:** http://142.93.187.32:8000
- **Documentación Backend:** http://142.93.187.32:8000/docs
- **Health Check:** http://142.93.187.32:8000/health

## 📞 Post-Despliegue

Una vez desplegado exitosamente:

1. **Notifica al equipo backend:** Proporciona la URL de Netlify para actualizar CORS
2. **Prueba todas las funcionalidades:** Login, productos, creación, etc.
3. **Configura dominio personalizado** (opcional)
4. **Configura analytics** (opcional)

---

**🎉 ¡Tu aplicación MAPO estará lista para usar en producción!**