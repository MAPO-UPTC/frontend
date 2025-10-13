# 🔍 Error 422 - Validation Error

## 🚨 Problema Actual

```
API Error [/sales/]: {detail: Array(1), status: 422}
```

Error **422 Unprocessable Entity** indica que el backend no puede procesar los datos enviados porque no cumplen con el esquema de validación.

---

## 🔧 Mejoras Implementadas para Debugging

### 1. Log Detallado del Error 422

En `src/api/client.ts`:
```typescript
if (response.status === 422) {
  console.error('🚨 Validation Error (422):', JSON.stringify(errorData, null, 2));
}
```

### 2. Log de Datos Enviados

En `src/store/index.ts`:
```typescript
console.log('📤 Enviando venta al backend:');
console.log('   Customer ID:', saleData.customer_id);
console.log('   Sale Items:', saleData.sale_items);
console.log('   Full Data:', JSON.stringify(saleData, null, 2));
```

### 3. Validación de product_id

Ahora se valida que `presentation.product.id` existe antes de agregar al carrito:
```typescript
if (!presentation.product?.id) {
  console.error('⚠️ Presentation sin product.id:', presentation);
  // Mostrar error y no agregar al carrito
  return false;
}
```

---

## 🎯 Cómo Diagnosticar

### Paso 1: Intenta crear una venta nuevamente

La consola ahora mostrará información detallada.

### Paso 2: Busca estos mensajes

**Error detallado (422):**
```
🚨 Validation Error (422): {
  "detail": [
    {
      "loc": ["body", "customer_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Datos enviados:**
```
📤 Enviando venta al backend:
   Customer ID: "uuid-aqui"
   Sale Items: [...]
   Full Data: { ... }
```

### Paso 3: Comparte el output completo

Copia y pega los mensajes de la consola para identificar el problema exacto.

---

## ⚠️ Posibles Causas del Error 422

### Causa 1: `customer_id` faltante o inválido

**Error esperado:**
```json
{
  "detail": [
    {
      "loc": ["body", "customer_id"],
      "msg": "field required"
    }
  ]
}
```

**Verificar:**
```javascript
console.log('Customer:', cart.customer);
console.log('Customer ID:', cart.customer?.id);
```

**Solución:** Asegurarse de seleccionar un cliente antes de procesar la venta.

---

### Causa 2: `product_id` faltante o vacío

**Error esperado:**
```json
{
  "detail": [
    {
      "loc": ["body", "sale_items", 0, "product_id"],
      "msg": "field required"
    }
  ]
}
```

**Verificar:**
```javascript
cart.items.forEach((item, index) => {
  console.log(`Item ${index}:`, {
    product_id: item.product_id,
    presentation_id: item.presentation.id
  });
});
```

**Solución:** 
- Ahora se valida que `presentation.product.id` exista antes de agregar al carrito
- Si algunos items ya están en el carrito sin `product_id`, vaciar el carrito y agregar productos nuevamente

---

### Causa 3: Tipos de datos incorrectos

**Problemas comunes:**

| Campo | Tipo Esperado | Tipo Incorrecto |
|-------|---------------|-----------------|
| `customer_id` | `string` (UUID) | `number` o `null` |
| `product_id` | `string` (UUID) | `string vacía ""` |
| `quantity` | `number` (entero) | `string "10"` |
| `unit_price` | `number` (float) | `string "2500.00"` |

**Verificar tipos:**
```javascript
console.log('customer_id type:', typeof saleData.customer_id);
console.log('quantity type:', typeof saleData.sale_items[0].quantity);
console.log('unit_price type:', typeof saleData.sale_items[0].unit_price);
```

---

### Causa 4: Estructura incorrecta

**Backend espera:**
```json
{
  "customer_id": "uuid",
  "sale_items": [
    {
      "product_id": "uuid",
      "quantity": 10,
      "unit_price": 2500.00
    }
  ],
  "notes": "opcional"
}
```

**Verifica que NO estés enviando:**
- `items` en lugar de `sale_items` ❌
- `presentation_id` en lugar de `product_id` ❌
- `client_id` en lugar de `customer_id` ❌

---

### Causa 5: Campo `notes` con valor inválido

**Posible error:**
```json
{
  "detail": [
    {
      "loc": ["body", "notes"],
      "msg": "str type expected"
    }
  ]
}
```

**Solución:** Asegurar que `notes` sea string o undefined:
```typescript
notes: `Venta procesada desde POS`  // ✅ String válido
```

---

## 🧪 Test Manual

### 1. Vaciar el carrito
```javascript
// En la consola del navegador
localStorage.clear();
// Recargar página
```

### 2. Agregar un producto de prueba

Asegúrate de que el producto tenga estructura completa:
```javascript
{
  presentation: {
    id: "uuid-presentation",
    product: {
      id: "uuid-product"  // ← IMPORTANTE
    },
    ...
  },
  product_id: "uuid-product",  // ← IMPORTANTE
  quantity: 1,
  unit_price: 2500
}
```

### 3. Verificar antes de procesar venta

```javascript
// En SalesPage, antes de createSale()
console.log('Cart items:', cart.items.map(item => ({
  product_id: item.product_id,
  quantity: item.quantity,
  unit_price: item.unit_price
})));
```

---

## 📋 Checklist de Validación

Antes de procesar una venta, verificar:

- [ ] ✅ Cliente seleccionado (`cart.customer` existe)
- [ ] ✅ Cliente tiene ID válido (`cart.customer.id` es UUID)
- [ ] ✅ Carrito no está vacío (`cart.items.length > 0`)
- [ ] ✅ Todos los items tienen `product_id` válido
- [ ] ✅ Todos los `quantity` son números enteros > 0
- [ ] ✅ Todos los `unit_price` son números > 0
- [ ] ✅ Campo `notes` es string (opcional)

---

## 🎯 Próximos Pasos

1. **Recarga la página** para aplicar los nuevos logs
2. **Intenta crear una venta**
3. **Copia y pega** todo el output de la consola
4. **Compártelo** para identificar el problema exacto

Los logs ahora mostrarán:
- ✅ Estructura completa del error 422
- ✅ Datos exactos que se están enviando
- ✅ Validación de product_id antes de agregar al carrito

---

**Fecha**: 12 de octubre de 2025  
**Archivos modificados**: `src/api/client.ts`, `src/store/index.ts`  
**Estado**: 🔍 Debugging mejorado - Esperando logs detallados
