# 📦➡️🌾 Guía Rápida: Conversión a Granel

## ⚡ Inicio Rápido

### ¿Qué puedo hacer?
Convertir productos empaquetados a granel para vender en cantidades más pequeñas.

### Ejemplo:
```
Tienes: 10 bolsas de 500g de arroz
Abres: 1 bolsa para granel
Resultado: 9 bolsas + 500g suelto
Ahora vendes: 100g, 250g, o cualquier cantidad
```

---

## 🎯 Paso a Paso (3 minutos)

### 1️⃣ Ve al Inventario
- Dashboard → **Gestión de Inventario**
- Busca el producto que quieres abrir

### 2️⃣ Click en "Abrir a Granel"
- Encuentra la presentación con stock
- Click en botón **📦➡️🌾 Abrir a Granel**

### 3️⃣ Selecciona Presentación Granel
- Modal se abre automáticamente
- Selecciona presentación granel (ej: "Granel (gramos)")
- Verifica la cantidad

### 4️⃣ Confirma
- Click en **📦➡️🌾 Abrir Bulto**
- ¡Listo! Stock actualizado

---

## 📸 Capturas de Pantalla

### Vista del Dashboard

```
┌─────────────────────────────────────┐
│  🍚 Arroz Premium        [Alimentos] │
│  • Bolsa 500g                       │
│    Stock: 10  $8,500                │
│    [📦➡️🌾 Abrir a Granel]  ← AQUÍ │
└─────────────────────────────────────┘
```

### Modal de Conversión

```
┌──────────────────────────────┐
│  📦➡️🌾 Abrir Bulto     [✕] │
├──────────────────────────────┤
│  🍚 Arroz Premium            │
│  Presentación: Bolsa 500g    │
│  Contenido: 500g             │
│  Paquetes disponibles: 10    │
│                              │
│  Presentación Granel *       │
│  [ Granel (gramos) ▼ ]      │
│                              │
│  Cantidad *                  │
│  [ 500 ]                     │
│                              │
│  [Cancelar] [📦➡️🌾 Abrir] │
└──────────────────────────────┘
```

---

## ⚠️ Requisitos

### Antes de Abrir un Paquete:

✅ **Tener stock disponible**
- El producto debe tener al menos 1 paquete

✅ **Tener presentación granel**
- Debe existir una presentación tipo "granel"
- Ejemplo: "Granel (gramos)", "Granel (mililitros)"

✅ **Tener permisos**
- Necesitas permiso: `PRODUCTS:UPDATE`

---

## 🆘 Problemas Comunes

### ❌ "No hay presentaciones tipo 'granel' disponibles"

**Solución:**
1. Ve a configuración del producto
2. Crea una presentación nueva
3. Nombre: "Granel (gramos)" o "Granel (mililitros)"
4. Unidad: "g" o "ml"
5. Guarda
6. Intenta de nuevo

### ❌ "No hay paquetes disponibles para abrir"

**Solución:**
- Verifica que el stock sea > 0
- Puede que ya se abrieron todos
- Recibe más mercancía

### ❌ "No tienes permisos para realizar esta acción"

**Solución:**
- Contacta al administrador
- Necesitas permiso `PRODUCTS:UPDATE`

---

## 💡 Tips y Trucos

### 🎯 Mejor Práctica #1: Configura Presentaciones Granel
```
Para cada producto que vendes a granel:
1. Crea presentación empaquetada: "Bolsa 500g"
2. Crea presentación granel: "Granel (gramos)"
```

### 🎯 Mejor Práctica #2: Abre Solo lo Necesario
```
No abras muchos paquetes de una vez
Abre según demanda del día
Evita desperdicio
```

### 🎯 Mejor Práctica #3: Verifica Stock Granel
```
En el dashboard verás:
Stock: 9  Granel: 500g  $8,500
         ↑
    Stock granel disponible
```

---

## 🔄 Flujo Completo

```
INICIO
  ↓
Dashboard de Inventario
  ↓
Buscar producto → [📦➡️🌾 Abrir a Granel]
  ↓
Modal se abre
  ↓
Seleccionar presentación granel
  ↓
Verificar cantidad
  ↓
[📦➡️🌾 Abrir Bulto]
  ↓
✅ ¡Éxito! Stock actualizado
  ↓
FIN
```

---

## 📊 Qué Pasa Cuando Abres un Paquete

### Cambios en el Sistema:

**Antes:**
```
Bolsa 500g
├─ Stock empaquetado: 10 bolsas
├─ Stock granel: 0g
└─ Total disponible: 5000g (10 × 500g)
```

**Después:**
```
Bolsa 500g
├─ Stock empaquetado: 9 bolsas
├─ Stock granel: 500g  ← ¡NUEVO!
└─ Total disponible: 5000g (sin cambios)
```

### En el Dashboard verás:
```
Antes:  Stock: 10
Después: Stock: 9  Granel: 500g
```

---

## 🎯 Casos de Uso Reales

### Caso 1: Tienda de Abarrotes
```
Situación: Cliente pide 250g de arroz
Solución:
1. Abrir 1 bolsa de 500g
2. Vender 250g al cliente
3. Quedan 250g para otros clientes
```

### Caso 2: Panadería
```
Situación: Necesitan 750g de harina
Solución:
1. Abrir 1 bolsa de 1kg
2. Usar 750g para producción
3. Quedan 250g para próxima hornada
```

### Caso 3: Tienda de Mascotas
```
Situación: Cliente quiere probar comida nueva (100g)
Solución:
1. Abrir 1 bolsa de 500g
2. Vender muestra de 100g
3. Quedan 400g para otros clientes
```

---

## 📱 Versión Móvil

### En Dispositivos Móviles:
- ✅ Misma funcionalidad
- ✅ Botones más grandes
- ✅ Modal ocupa toda la pantalla
- ✅ Touch-friendly

### Tips para Móvil:
```
1. Scroll down para ver botones
2. Modal se cierra con "X" o "Cancelar"
3. Touch en presentación para seleccionar
```

---

## 🔐 Seguridad

### Quién Puede Usar Esta Función:
- ✅ Gerentes
- ✅ Administradores de inventario
- ✅ Usuarios con permiso `PRODUCTS:UPDATE`
- ❌ Cajeros (solo venta)
- ❌ Usuarios sin permisos

---

## 📞 Soporte

### ¿Necesitas Ayuda?
```
1. Consulta: CONVERSION_GRANEL_IMPLEMENTADO.md (guía completa)
2. Revisa: Problemas Comunes (arriba)
3. Contacta: Soporte técnico
```

### Reportar Problema:
```
Incluye:
- Nombre del producto
- Presentación
- Stock disponible
- Mensaje de error (si hay)
- Captura de pantalla
```

---

## ⏱️ Tiempo Estimado

| Tarea | Tiempo |
|-------|--------|
| Abrir 1 paquete | 30 segundos |
| Configurar presentación granel | 2 minutos |
| Resolver problema común | 5 minutos |

---

## ✅ Checklist Antes de Abrir

- [ ] Producto tiene stock > 0
- [ ] Existe presentación granel
- [ ] Tengo permisos necesarios
- [ ] Sé qué presentación granel usar
- [ ] He verificado la cantidad

---

## 🎉 ¡Felicitaciones!

Ahora puedes:
- ✅ Vender productos a granel
- ✅ Ofrecer cantidades personalizadas
- ✅ Reducir desperdicio
- ✅ Mejorar experiencia del cliente
- ✅ Gestionar inventario eficientemente

---

**Versión:** 1.0  
**Última actualización:** Enero 2025  
**Tiempo de lectura:** 5 minutos
