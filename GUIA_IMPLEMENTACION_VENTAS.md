# 📘 Guía de Implementación - Sistema de Ventas

> **Fecha:** Octubre 12, 2025  
> **Estado:** ✅ Implementado y Funcional  
> **Versión:** 1.0

---

## 🎯 Resumen Ejecutivo

El sistema de ventas permite registrar ventas reales en el backend, con validación de stock, manejo de productos a granel y empaquetados, y actualización automática de inventario.

---

## 📋 Tabla de Contenidos

1. [Estructura de Datos](#estructura-de-datos)
2. [Endpoint del Backend](#endpoint-del-backend)
3. [Implementación en el Store](#implementación-en-el-store)
4. [Validaciones Requeridas](#validaciones-requeridas)
5. [Flujo Completo](#flujo-completo)
6. [Ejemplos de Código](#ejemplos-de-código)
7. [Manejo de Errores](#manejo-de-errores)

---

## 📊 Estructura de Datos

### **Request - Crear Venta (POST)**

```typescript
interface SaleCreate {
  customer_id: string;  // UUID del cliente
  status: "completed" | "pending" | "cancelled";
  items: SaleItem[];
}

interface SaleItem {
  presentation_id: string;  // UUID de la presentación del producto
  quantity: number;         // Cantidad (entero para empaquetado, decimal para granel)
  unit_price: number;       // Precio unitario
}
```

**Ejemplo de Request:**
```json
{
  "customer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "completed",
  "items": [
    {
      "presentation_id": "524dae29-003d-40bc-9fc9-2a7f982fd46c",
      "quantity": 2,
      "unit_price": 8300
    },
    {
      "presentation_id": "624dae29-003d-40bc-9fc9-2a7f982fd46d",
      "quantity": 3.5,
      "unit_price": 3800
    }
  ]
}
```

### **Response - Venta Creada**

```typescript
interface Sale {
  id: string;                // UUID de la venta
  sale_code: string;         // Código único: VTA-YYYYMMDD-XXXX
  sale_date: string;         // ISO 8601 timestamp
  customer_id: string;       // UUID del cliente
  user_id: string;          // UUID del usuario que realizó la venta
  total: number;            // Total de la venta
  status: "completed" | "pending" | "cancelled";
  items: SaleDetail[];      // Detalles de los items vendidos
}

interface SaleDetail {
  id: string;
  sale_id: string;
  presentation_id: string;
  lot_detail_id?: string;        // Para productos empaquetados
  bulk_conversion_id?: string;   // Para productos a granel
  quantity: number;
  unit_price: number;
  line_total: number;
}
```

**Ejemplo de Response:**
```json
{
  "id": "750e8400-e29b-41d4-a716-446655440003",
  "sale_code": "VTA-20251012-0001",
  "sale_date": "2025-10-12T10:30:00",
  "customer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "450e8400-e29b-41d4-a716-446655440004",
  "total": 30200.0,
  "status": "completed",
  "items": [
    {
      "id": "item-uuid-1",
      "sale_id": "750e8400-e29b-41d4-a716-446655440003",
      "presentation_id": "524dae29-003d-40bc-9fc9-2a7f982fd46c",
      "lot_detail_id": "lot-uuid",
      "bulk_conversion_id": null,
      "quantity": 2,
      "unit_price": 8300,
      "line_total": 16600
    },
    {
      "id": "item-uuid-2",
      "sale_id": "750e8400-e29b-41d4-a716-446655440003",
      "presentation_id": "624dae29-003d-40bc-9fc9-2a7f982fd46d",
      "lot_detail_id": null,
      "bulk_conversion_id": "bulk-uuid",
      "quantity": 3.5,
      "unit_price": 3800,
      "line_total": 13300
    }
  ]
}
```

---

## 🔗 Endpoint del Backend

### **POST /api/v1/sales/**

**URL Completa:** `http://142.93.187.32:8000/api/v1/sales/`

**Headers Requeridos:**
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Método:** `POST`

**Body:** JSON con estructura `SaleCreate`

**Respuestas:**

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| `200` | Venta creada exitosamente | Ver estructura `Sale` arriba |
| `400` | Error de validación (ej: stock insuficiente) | `{"detail": "Stock insuficiente..."}` |
| `401` | No autenticado | `{"detail": "Usuario no identificado"}` |
| `404` | Producto no encontrado | `{"detail": "Presentación con ID xxx no encontrada"}` |

---

## 💾 Implementación en el Store

### **Archivo:** `src/store/index.ts`

### **Paso 1: Importar API Client**

```typescript
import { apiClient } from '../api/client';
```

### **Paso 2: Implementar `createSale`**

```typescript
createSale: async () => {
  const state = get();
  
  // Validación 1: Verificar que hay un cliente
  if (!state.cart.customer) {
    console.error('No customer selected');
    return null;
  }
  
  // Validación 2: Verificar que hay items en el carrito
  if (state.cart.items.length === 0) {
    console.error('Cart is empty');
    return null;
  }
  
  try {
    // Preparar datos en el formato exacto que espera el backend
    const saleData = {
      customer_id: state.cart.customer.id,
      status: 'completed' as const,
      items: state.cart.items.map(item => ({
        presentation_id: item.presentation.id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };
    
    console.log('📤 Enviando venta al backend:', saleData);
    
    // Llamar al API
    const sale = await apiClient.createSale(saleData);
    
    console.log('✅ Venta creada exitosamente:', sale);
    
    // Actualizar estado: agregar venta a la lista
    set((state) => ({
      sales: {
        ...state.sales,
        sales: [sale, ...state.sales.sales],
        currentSale: sale
      }
    }));
    
    // Limpiar el carrito
    set((state) => ({
      cart: {
        ...state.cart,
        items: [],
        total: 0,
        customer: null
      }
    }));
    
    // Notificación de éxito
    get().addNotification({
      type: 'success',
      title: 'Venta Exitosa',
      message: `Venta ${sale.sale_code} procesada por $${sale.total.toLocaleString('es-CO')}`
    });
    
    return sale;
    
  } catch (error: any) {
    console.error('❌ Error al crear venta:', error);
    
    // Notificación de error
    get().addNotification({
      type: 'error',
      title: 'Error al procesar venta',
      message: error.detail || error.message || 'Error desconocido'
    });
    
    return null;
  }
}
```

---

## ✅ Validaciones Requeridas

### **1. Validación de Stock (addToCart)**

**CRÍTICO:** Debes validar el stock ANTES de agregar al carrito.

```typescript
addToCart: async (presentation, quantity, unitPrice) => {
  // Validar cantidad
  if (quantity <= 0) {
    get().addNotification({
      type: 'error',
      title: 'Cantidad inválida',
      message: 'La cantidad debe ser mayor a 0'
    });
    return false;
  }
  
  // Determinar si es producto a granel
  const isBulk = presentation.presentation_name?.toLowerCase().includes('granel') || 
                 (presentation.bulk_stock_available !== undefined && 
                  presentation.bulk_stock_available > 0);
  
  // Obtener stock disponible
  const availableStock = isBulk 
    ? (presentation.bulk_stock_available || 0)
    : (presentation.stock_available || 0);
  
  // Validar stock disponible
  if (availableStock <= 0) {
    get().addNotification({
      type: 'error',
      title: 'Sin stock',
      message: `No hay stock disponible para ${presentation.presentation_name}`
    });
    return false;
  }
  
  // Validar que no se exceda el stock
  if (quantity > availableStock) {
    get().addNotification({
      type: 'error',
      title: 'Stock insuficiente',
      message: `Stock disponible: ${availableStock} ${isBulk ? 'kg' : 'unidades'}. Solicitado: ${quantity}`
    });
    return false;
  }
  
  // Si el producto ya está en el carrito, validar stock acumulado
  const existingItemIndex = state.cart.items.findIndex(
    item => item.presentation.id === presentation.id
  );
  
  if (existingItemIndex !== -1) {
    const existingItem = state.cart.items[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;
    
    if (newQuantity > availableStock) {
      get().addNotification({
        type: 'error',
        title: 'Stock insuficiente',
        message: `No puedes agregar más. Stock disponible: ${availableStock}`
      });
      return false;
    }
    
    // Actualizar cantidad acumulada
    // ... código para actualizar
  } else {
    // Agregar nuevo item
    // ... código para agregar
  }
  
  return true;
}
```

### **2. Detección de Productos a Granel**

```typescript
// Método 1: Por nombre
const isBulk = presentation.presentation_name?.toLowerCase().includes('granel');

// Método 2: Por campo bulk_stock_available
const isBulk = presentation.bulk_stock_available !== undefined && 
               presentation.bulk_stock_available > 0;

// Método 3: Combinado (Recomendado)
const isBulk = presentation.presentation_name?.toLowerCase().includes('granel') || 
               (presentation.bulk_stock_available !== undefined && 
                presentation.bulk_stock_available > 0);
```

### **3. Obtener Stock Correcto**

```typescript
// Para productos a granel
const stockGranel = presentation.bulk_stock_available || 0;

// Para productos empaquetados
const stockEmpaquetado = presentation.stock_available || 0;

// Stock correcto según tipo
const availableStock = isBulk 
  ? (presentation.bulk_stock_available || 0)
  : (presentation.stock_available || 0);
```

---

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────────────────────┐
│          FLUJO COMPLETO DE VENTA                        │
└─────────────────────────────────────────────────────────┘

1. SELECCIÓN DE CLIENTE
   └─ CustomerSelector → setCustomer(customer)

2. BUSCAR PRODUCTOS
   └─ ProductSearch → loadProducts()
   
3. AGREGAR AL CARRITO
   ├─ Usuario ajusta cantidad
   ├─ Click "Agregar al carrito"
   ├─ addToCart(presentation, quantity, price)
   │  ├─ Validar cantidad > 0
   │  ├─ Detectar si es granel
   │  ├─ Obtener stock correcto
   │  ├─ Validar stock suficiente
   │  ├─ Si existe: acumular + revalidar
   │  └─ Agregar/Actualizar item
   └─ Mostrar notificación

4. REVISAR CARRITO
   └─ SalesCart muestra items y total

5. PROCESAR VENTA
   ├─ Click "Procesar Venta"
   ├─ Validar cliente y carrito
   ├─ createSale()
   │  ├─ Preparar saleData
   │  ├─ POST /api/v1/sales/
   │  ├─ Backend descuenta stock
   │  └─ Backend retorna sale
   ├─ Actualizar estado de ventas
   ├─ Limpiar carrito
   └─ Mostrar confirmación

6. POST-VENTA
   ├─ Recargar productos (loadProducts)
   ├─ Stock actualizado
   └─ Listo para nueva venta
```

---

## 💻 Ejemplos de Código

### **Ejemplo 1: Venta de Productos Empaquetados**

```typescript
// Cliente seleccionado
const customer = {
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  name: "Juan Pérez"
};

// Agregar productos al carrito
await addToCart(
  {
    id: "524dae29-003d-40bc-9fc9-2a7f982fd46c",
    presentation_name: "Arroz Diana 1kg",
    stock_available: 50,
    bulk_stock_available: 0,
    price: 4500
  },
  5,  // cantidad
  4500 // precio unitario
);

// Items en el carrito
cart.items = [
  {
    presentation: { id: "524dae29...", ... },
    quantity: 5,
    unit_price: 4500,
    line_total: 22500
  }
];

// Procesar venta
const sale = await createSale();

// Datos enviados al backend
{
  "customer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "completed",
  "items": [
    {
      "presentation_id": "524dae29-003d-40bc-9fc9-2a7f982fd46c",
      "quantity": 5,
      "unit_price": 4500
    }
  ]
}

// Respuesta del backend
{
  "sale_code": "VTA-20251012-0001",
  "total": 22500,
  "status": "completed",
  ...
}
```

### **Ejemplo 2: Venta de Productos a Granel**

```typescript
// Producto a granel
const presentacionGranel = {
  id: "624dae29-003d-40bc-9fc9-2a7f982fd46d",
  presentation_name: "Arroz Diana 25kg (Granel)",
  stock_available: 0,
  bulk_stock_available: 150.5,  // kg disponibles
  price: 3800  // precio por kg
};

// Agregar 7.5 kg al carrito
await addToCart(presentacionGranel, 7.5, 3800);

// Item en carrito
{
  presentation: presentacionGranel,
  quantity: 7.5,
  unit_price: 3800,
  line_total: 28500  // 7.5 * 3800
}

// Datos enviados al backend
{
  "customer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "completed",
  "items": [
    {
      "presentation_id": "624dae29-003d-40bc-9fc9-2a7f982fd46d",
      "quantity": 7.5,
      "unit_price": 3800
    }
  ]
}
```

### **Ejemplo 3: Venta Mixta**

```typescript
// Carrito con productos empaquetados y a granel
cart.items = [
  {
    presentation: { id: "...", presentation_name: "Arroz Diana 1kg" },
    quantity: 2,
    unit_price: 4500,
    line_total: 9000
  },
  {
    presentation: { id: "...", presentation_name: "Arroz Diana 25kg (Granel)" },
    quantity: 3.5,
    unit_price: 3800,
    line_total: 13300
  },
  {
    presentation: { id: "...", presentation_name: "Azúcar 500g" },
    quantity: 5,
    unit_price: 2800,
    line_total: 14000
  }
];

// Total del carrito
cart.total = 36300;

// Datos enviados al backend
{
  "customer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "completed",
  "items": [
    {
      "presentation_id": "presentation-uuid-1",
      "quantity": 2,
      "unit_price": 4500
    },
    {
      "presentation_id": "presentation-uuid-2",
      "quantity": 3.5,
      "unit_price": 3800
    },
    {
      "presentation_id": "presentation-uuid-3",
      "quantity": 5,
      "unit_price": 2800
    }
  ]
}
```

---

## 🚨 Manejo de Errores

### **Errores Comunes del Backend**

#### **Error 400: Stock Insuficiente**
```json
{
  "detail": "Stock insuficiente para Arroz Diana 1kg. Disponible: 5, Solicitado: 10"
}
```

**Solución:** Validar stock en el frontend ANTES de enviar al backend.

#### **Error 401: No Autenticado**
```json
{
  "detail": "Usuario no identificado"
}
```

**Solución:** Verificar que el token está en localStorage y en los headers.

#### **Error 404: Producto No Encontrado**
```json
{
  "detail": "Presentación con ID xxx no encontrada"
}
```

**Solución:** Validar que los UUIDs de las presentaciones son correctos.

### **Manejo en el Frontend**

```typescript
try {
  const sale = await apiClient.createSale(saleData);
  // Éxito
  
} catch (error: any) {
  // Extraer mensaje de error
  const errorMessage = error.detail || error.message || 'Error desconocido';
  
  // Clasificar error
  if (errorMessage.includes('Stock insuficiente')) {
    alert('⚠️ No hay suficiente stock. Por favor ajuste las cantidades.');
  } else if (errorMessage.includes('no encontrada')) {
    alert('❌ Producto no disponible. Recargue la página.');
  } else if (errorMessage.includes('no identificado')) {
    alert('🔒 Sesión expirada. Inicie sesión nuevamente.');
    // Redirigir a login
  } else {
    alert(`❌ Error: ${errorMessage}`);
  }
  
  console.error('Error completo:', error);
}
```

---

## 📱 Actualización de Stock Post-Venta

**IMPORTANTE:** Después de procesar una venta, debes recargar los productos para reflejar el stock actualizado.

```typescript
const handleProcessSale = async () => {
  setIsProcessing(true);
  
  try {
    // Procesar venta
    const sale = await processSale();
    
    if (sale) {
      // Mostrar confirmación
      alert(`Venta ${sale.sale_code} procesada exitosamente`);
      
      // CRÍTICO: Recargar productos
      await loadProducts();
      
      // Limpiar selección de cliente
      setSelectedCustomer(null);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsProcessing(false);
  }
};
```

---

## 🎯 Checklist de Implementación

### **Backend**
- [x] Endpoint `/api/v1/sales/` configurado
- [x] Autenticación con JWT
- [x] Validación de stock
- [x] Generación de sale_code
- [x] Descuento automático de stock

### **Frontend - Store**
- [x] `createSale` implementado
- [x] Validación de cliente y carrito
- [x] Formato correcto de datos (SaleCreate)
- [x] Manejo de errores
- [x] Limpieza de carrito post-venta
- [x] Notificaciones al usuario

### **Frontend - Validaciones**
- [x] Validar cantidad > 0
- [x] Detectar productos a granel
- [x] Validar stock disponible
- [x] Validar stock acumulado (si ya existe en carrito)
- [x] Mostrar notificaciones informativas

### **Frontend - UI**
- [x] CustomerSelector funcional
- [x] ProductSearch con grid
- [x] SalesCart con subtotales
- [x] Botón "Procesar Venta"
- [x] Confirmación detallada
- [x] Recarga de productos post-venta

---

## ✨ Puntos Clave

### **1. Estructura de Datos**
```typescript
// Enviar EXACTAMENTE esto al backend
{
  customer_id: "uuid",
  status: "completed",
  items: [
    {
      presentation_id: "uuid",
      quantity: number,
      unit_price: number
    }
  ]
}
```

### **2. Validación de Stock**
```typescript
// SIEMPRE validar antes de agregar al carrito
const availableStock = isBulk 
  ? presentation.bulk_stock_available 
  : presentation.stock_available;

if (quantity > availableStock) {
  // ERROR: Stock insuficiente
}
```

### **3. Detección de Granel**
```typescript
// Detectar por nombre O por campo bulk_stock_available
const isBulk = 
  presentation.presentation_name.toLowerCase().includes('granel') ||
  (presentation.bulk_stock_available > 0);
```

### **4. Recarga Post-Venta**
```typescript
// SIEMPRE recargar después de venta exitosa
await processSale();
await loadProducts();  // ← CRÍTICO
```

---

## 📞 Soporte

Si encuentras algún problema:

1. **Verificar estructura de datos:** Usa `console.log` para ver qué estás enviando
2. **Verificar respuesta del backend:** Revisa el Network tab en DevTools
3. **Verificar token:** Asegúrate de que el token JWT es válido
4. **Verificar stock:** Valida que hay stock antes de enviar

---

## 🎉 Resultado Final

Con esta implementación tendrás:

✅ Sistema de ventas completamente funcional  
✅ Validación de stock en tiempo real  
✅ Soporte para productos empaquetados y a granel  
✅ Manejo robusto de errores  
✅ Confirmación detallada de ventas  
✅ Actualización automática de inventario  
✅ Código limpio y mantenible  

**Estado:** 🟢 **LISTO PARA PRODUCCIÓN**

---

**Última actualización:** Octubre 12, 2025  
**Versión:** 1.0  
**Backend Base URL:** `http://142.93.187.32:8000`
