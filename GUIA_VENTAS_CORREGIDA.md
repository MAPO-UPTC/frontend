# 🚀 Guía de Implementación de Ventas - CORREGIDA

## ⚠️ ESTRUCTURA REAL DEL BACKEND

Según la documentación oficial del backend (`SWAGGER_EXAMPLES.md` y `FRONTEND_QUICK_SALE_GUIDE.md`), la estructura correcta es:

### 📤 REQUEST (Crear Venta)

```json
{
  "customer_id": "uuid-del-cliente",
  "sale_items": [
    {
      "product_id": "uuid-del-producto",
      "quantity": 10,
      "unit_price": 2500.00
    }
  ],
  "notes": "Opcional"
}
```

### ✅ CAMPOS IMPORTANTES

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `customer_id` | UUID | ⚠️ **NO** `client_id` |
| `sale_items` | Array | ⚠️ **NO** `items` |
| `product_id` | UUID | ⚠️ **NO** `presentation_id` |
| `notes` | string | Campo opcional |

### 📥 RESPONSE (Venta Creada)

```json
{
  "id": "sale-uuid-123",
  "customer_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "sale_date": "2025-10-12T10:30:00",
  "total_amount": 25000.00,
  "status": "completed",
  "notes": "Venta de prueba",
  "sale_details": [
    {
      "id": "detail-uuid-1",
      "product_id": "f7e8d9c0-b1a2-4d3e-9f8a-7b6c5d4e3f2a",
      "product_name": "Arroz Diana 1kg",
      "quantity": 10,
      "unit_price": 2500.00,
      "subtotal": 25000.00,
      "lot_detail_id": "lot-uuid",
      "bulk_conversion_id": null
    }
  ]
}
```

---

## 🔧 CAMBIOS REALIZADOS EN EL FRONTEND

### 1️⃣ Tipos Actualizados (`src/types/index.ts`)

#### **Antes (INCORRECTO):**

```typescript
export interface SaleItem {
  presentation_id: UUID;  // ❌ INCORRECTO
  quantity: number;
  unit_price: number;
}

export interface SaleCreate {
  customer_id: UUID;
  status: "completed" | "pending" | "cancelled";  // ❌ No existe en backend
  items: SaleItem[];  // ❌ INCORRECTO
}
```

#### **Ahora (CORRECTO):**

```typescript
// Estructura para CREAR una venta (request al backend)
export interface SaleItemCreate {
  product_id: UUID;      // ✅ product_id
  quantity: number;
  unit_price: number;
}

export interface SaleCreate {
  customer_id: UUID;     // ✅ customer_id
  sale_items: SaleItemCreate[];  // ✅ sale_items
  notes?: string;        // ✅ Campo opcional
}

// Estructura de RESPUESTA del backend
export interface Sale {
  id: UUID;
  customer_id: UUID;
  sale_date: Timestamp;
  total_amount: number;
  status: string;
  notes?: string;
  sale_details: SaleDetail[];
  customer?: Person;
}

export interface SaleDetail {
  id: UUID;
  product_id: UUID;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  lot_detail_id?: UUID | null;
  bulk_conversion_id?: UUID | null;
}
```

### 2️⃣ CartItem Actualizado

```typescript
export interface CartItem {
  presentation: ProductPresentation;
  product_id: UUID;  // ✅ Se agrega para facilitar la creación de ventas
  quantity: number;
  unit_price: number;
  line_total: number;
  max_available?: number;
}
```

### 3️⃣ Store - createSale() Actualizado

#### **Antes (INCORRECTO):**

```typescript
const saleData = {
  customer_id: state.cart.customer.id,
  status: 'completed',  // ❌ No existe en backend
  items: state.cart.items.map(item => ({  // ❌ INCORRECTO
    presentation_id: item.presentation.id,  // ❌ INCORRECTO
    quantity: item.quantity,
    unit_price: item.unit_price
  }))
};
```

#### **Ahora (CORRECTO):**

```typescript
const saleData = {
  customer_id: state.cart.customer.id,  // ✅ customer_id
  sale_items: state.cart.items.map(item => ({  // ✅ sale_items
    product_id: item.product_id,  // ✅ product_id
    quantity: item.quantity,
    unit_price: item.unit_price
  })),
  notes: `Venta procesada desde POS`  // ✅ Campo opcional
};
```

### 4️⃣ Store - addToCart() Actualizado

```typescript
// Agregar nuevo item
const newItem: CartItem = {
  presentation,
  product_id: presentation.product?.id || '',  // ✅ Incluir product_id
  quantity,
  unit_price: unitPrice,
  line_total: quantity * unitPrice,
  max_available: availableStock
};
```

---

## 🎯 EJEMPLOS DE USO

### Ejemplo 1: Venta Simple

```typescript
// En SalesPage.tsx o similar
const handleProcessSale = async () => {
  const sale = await createSale();
  
  if (sale) {
    console.log('Venta creada:', sale.id);
    console.log('Total:', sale.total_amount);
    console.log('Cliente:', sale.customer_id);
    console.log('Detalles:', sale.sale_details);
  }
};
```

### Ejemplo 2: Datos Enviados al Backend

```json
{
  "customer_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "sale_items": [
    {
      "product_id": "f7e8d9c0-b1a2-4d3e-9f8a-7b6c5d4e3f2a",
      "quantity": 10,
      "unit_price": 2500.00
    },
    {
      "product_id": "1a2b3c4d-5e6f-4g7h-8i9j-0k1l2m3n4o5p",
      "quantity": 5,
      "unit_price": 3500.00
    }
  ],
  "notes": "Venta procesada desde POS"
}
```

### Ejemplo 3: Respuesta del Backend

```json
{
  "id": "sale-uuid-123",
  "customer_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "sale_date": "2025-10-12T10:30:00",
  "total_amount": 42500.00,
  "status": "completed",
  "notes": "Venta procesada desde POS",
  "sale_details": [
    {
      "id": "detail-1",
      "product_id": "f7e8d9c0-b1a2-4d3e-9f8a-7b6c5d4e3f2a",
      "product_name": "Arroz Diana 1kg",
      "quantity": 10,
      "unit_price": 2500.00,
      "subtotal": 25000.00,
      "lot_detail_id": "lot-uuid",
      "bulk_conversion_id": null
    },
    {
      "id": "detail-2",
      "product_id": "1a2b3c4d-5e6f-4g7h-8i9j-0k1l2m3n4o5p",
      "product_name": "Azúcar Manuelita 500g",
      "quantity": 5,
      "unit_price": 3500.00,
      "subtotal": 17500.00,
      "lot_detail_id": "lot-uuid-2",
      "bulk_conversion_id": null
    }
  ]
}
```

---

## 🔍 VENTAS MIXTAS (Empaquetado + Granel)

### Escenario

Si vendes **150 unidades** de un producto que tiene:
- 10 unidades empaquetadas
- 200kg a granel

### Request al Backend

```json
{
  "customer_id": "customer-uuid",
  "sale_items": [
    {
      "product_id": "product-uuid",
      "quantity": 150,
      "unit_price": 2500.00
    }
  ],
  "notes": "Venta grande"
}
```

### Response del Backend

El backend **automáticamente** divide la venta:

```json
{
  "id": "sale-uuid",
  "total_amount": 375000.00,
  "sale_details": [
    {
      "id": "detail-1",
      "product_id": "product-uuid",
      "product_name": "Arroz Diana 1kg",
      "quantity": 10,
      "unit_price": 2500.00,
      "subtotal": 25000.00,
      "lot_detail_id": "lot-uuid",
      "bulk_conversion_id": null  // ← Stock empaquetado
    },
    {
      "id": "detail-2",
      "product_id": "product-uuid",
      "product_name": "Arroz Diana 1kg",
      "quantity": 140,
      "unit_price": 2500.00,
      "subtotal": 350000.00,
      "lot_detail_id": null,
      "bulk_conversion_id": "bulk-uuid"  // ← Stock a granel
    }
  ]
}
```

⚠️ **IMPORTANTE**: El mismo producto aparece **2 veces** en `sale_details`:
- Una con `lot_detail_id` → Stock empaquetado
- Otra con `bulk_conversion_id` → Stock a granel

---

## ✅ CHECKLIST DE VALIDACIÓN

- [x] ✅ Usar `customer_id` (NO `client_id`)
- [x] ✅ Usar `sale_items` (NO `items`)
- [x] ✅ Usar `product_id` (NO `presentation_id`)
- [x] ✅ Eliminar campo `status` del request (el backend lo maneja)
- [x] ✅ Agregar campo opcional `notes`
- [x] ✅ CartItem incluye `product_id`
- [x] ✅ addToCart() guarda `product_id` de presentation
- [x] ✅ createSale() envía estructura correcta
- [x] ✅ Response usa `total_amount` (NO `total`)
- [x] ✅ Response usa `sale_details` con `product_id`

---

## 📚 DOCUMENTACIÓN DE REFERENCIA

- **SWAGGER_EXAMPLES.md** - Ejemplos JSON listos para usar
- **FRONTEND_QUICK_SALE_GUIDE.md** - Guía rápida del backend
- **Swagger UI**: `http://142.93.187.32:8000/docs`

---

## 🚨 ERRORES COMUNES

### Error 422: Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "customer_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Causa**: Usaste `client_id` en lugar de `customer_id`  
**Solución**: Cambia a `customer_id`

### Error 400: Stock Insuficiente

```json
{
  "detail": "Stock insuficiente para el producto Arroz Diana 1kg. Disponible: 5, Solicitado: 10"
}
```

**Causa**: No hay suficiente stock (empaquetado + granel)  
**Solución**: Reduce la cantidad o verifica el stock

---

## 🎉 RESUMEN

### Estructura Correcta

```typescript
// REQUEST
{
  customer_id: "uuid",      // ✅ customer_id
  sale_items: [             // ✅ sale_items
    {
      product_id: "uuid",   // ✅ product_id
      quantity: 10,
      unit_price: 2500.00
    }
  ],
  notes: "Opcional"
}

// RESPONSE
{
  id: "uuid",
  customer_id: "uuid",
  sale_date: "timestamp",
  total_amount: 25000,      // ✅ total_amount
  status: "completed",
  notes: "Opcional",
  sale_details: [           // ✅ sale_details
    {
      product_id: "uuid",   // ✅ product_id
      product_name: "string",
      quantity: 10,
      unit_price: 2500,
      subtotal: 25000,
      lot_detail_id: "uuid" | null,
      bulk_conversion_id: "uuid" | null
    }
  ]
}
```

---

🎯 **¡Ahora la implementación está alineada con el backend real!**
