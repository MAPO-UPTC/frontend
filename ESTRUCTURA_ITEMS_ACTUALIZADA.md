# 📝 Estructura de Items en Ventas - Actualizada

## 🔄 Cambios Realizados

Se ha actualizado la estructura de tipos para soportar la **estructura real de items** que devuelve el backend en las ventas.

---

## 🎯 Estructura Real del Backend

### **Items en Venta**
```json
{
  "id": "uuid-venta",
  "sale_code": "VEN-20251012143000",
  "customer_id": "uuid-cliente",
  "user_id": "uuid-usuario",
  "sale_date": "2025-10-12T14:30:00",
  "total": 125000,
  "status": "completed",
  "items": [
    {
      "id": "uuid-item",
      "product_id": "uuid-producto",
      "quantity": 2,
      "unit_price": 15.50,
      "is_bulk_sale": false
    }
  ]
}
```

**Nota importante**: El backend puede devolver tanto `items` como `sale_details` dependiendo del endpoint:
- **GET /sales/** (historial) → devuelve `items`
- **POST /sales/** (crear venta) → puede devolver `sale_details`

---

## ✅ Tipos Actualizados

### **SaleDetail Interface** (`src/types/index.ts`)
```typescript
export interface SaleDetail {
  id: UUID;
  product_id: UUID;
  product_name?: string; // Opcional, puede no venir en items
  quantity: number;
  unit_price: number;
  is_bulk_sale: boolean; // ✅ NUEVO: Indicador si es venta a granel
  subtotal?: number; // Calculado en frontend
  lot_detail_id?: UUID | null;
  bulk_conversion_id?: UUID | null;
}
```

**Campos clave**:
- ✅ `is_bulk_sale`: Nuevo campo que indica si la venta es a granel
- ✅ `product_name`: Ahora es opcional (no viene en items del historial)
- ✅ `subtotal`: Opcional (se puede calcular en frontend)

---

### **Sale Interface** (`src/types/index.ts`)
```typescript
export interface Sale {
  id: UUID;
  sale_code?: string;
  customer_id: UUID;
  user_id?: UUID;
  sale_date: Timestamp;
  total_amount?: number; // Para ventas individuales
  total?: number; // Para historial de ventas
  status: string;
  notes?: string;
  sale_details?: SaleDetail[]; // ✅ Algunos endpoints devuelven sale_details
  items?: SaleDetail[]; // ✅ Otros endpoints devuelven items
  customer?: Person;
}
```

**Flexibilidad**:
- ✅ Soporta tanto `items` como `sale_details`
- ✅ El código frontend ahora verifica ambos campos

---

## 🔧 Código Actualizado

### **1. SalesHistory Component**
```typescript
// Cuenta items correctamente, verificando ambos campos
<td className="items-count">
  {(sale.items?.length || sale.sale_details?.length || 0)}
</td>
```

### **2. SalesPage Component**
```typescript
// Muestra cantidad de items de cualquier fuente
`Items: ${sale.items?.length || sale.sale_details?.length || cart.items.length}`
```

---

## 📊 Comparación: Estructura Antigua vs Nueva

### **Antigua (sale_details)** ❌
```json
{
  "sale_details": [
    {
      "id": "uuid",
      "product_id": "uuid-producto",
      "product_name": "Chunky Adulto 25kg",
      "quantity": 2,
      "unit_price": 95000,
      "subtotal": 190000,
      "lot_detail_id": null,
      "bulk_conversion_id": null
    }
  ]
}
```

### **Nueva (items)** ✅
```json
{
  "items": [
    {
      "id": "uuid-item",
      "product_id": "uuid-producto",
      "quantity": 2,
      "unit_price": 15.50,
      "is_bulk_sale": false
    }
  ]
}
```

**Diferencias clave**:
- ✅ `items` es más simple y conciso
- ✅ Incluye `is_bulk_sale` para identificar ventas a granel
- ✅ No incluye `product_name` (debe obtenerse por separado si se necesita)
- ✅ No incluye `subtotal` (se calcula multiplicando `quantity * unit_price`)

---

## 💡 Cómo Usar

### **Obtener items de una venta**
```typescript
// Función helper para obtener items de cualquier fuente
const getItemsFromSale = (sale: Sale): SaleDetail[] => {
  return sale.items || sale.sale_details || [];
};

// Uso
const items = getItemsFromSale(sale);
console.log(`Total items: ${items.length}`);
```

### **Calcular subtotal de un item**
```typescript
const calculateSubtotal = (item: SaleDetail): number => {
  return item.subtotal || (item.quantity * item.unit_price);
};
```

### **Verificar si es venta a granel**
```typescript
const isBulkSale = (item: SaleDetail): boolean => {
  return item.is_bulk_sale === true;
};
```

---

## 🎯 Compatibilidad Garantizada

El código frontend ahora es **100% compatible** con ambas estructuras:

✅ **GET /sales/** (historial) → `items`
```typescript
{
  items: [{ id, product_id, quantity, unit_price, is_bulk_sale }]
}
```

✅ **POST /sales/** (crear venta) → `sale_details`
```typescript
{
  sale_details: [{ id, product_id, product_name, quantity, unit_price, subtotal }]
}
```

El frontend detecta automáticamente qué campo está presente y lo utiliza.

---

## 📋 Checklist de Actualización

- [x] ✅ Actualizada interface `SaleDetail` con `is_bulk_sale`
- [x] ✅ `product_name` ahora es opcional
- [x] ✅ `subtotal` ahora es opcional
- [x] ✅ Interface `Sale` soporta tanto `items` como `sale_details`
- [x] ✅ Componente `SalesHistory` actualizado
- [x] ✅ Componente `SalesPage` actualizado
- [x] ✅ Sin errores de compilación
- [x] ✅ Compatibilidad garantizada con ambas estructuras

---

## 🚀 Próximos Pasos (Opcional)

### **Mejoras Sugeridas**:

1. **Normalizar Items**
   - Crear un helper que siempre devuelva la misma estructura
   - Calcular `subtotal` si no viene del backend

2. **Obtener Nombres de Productos**
   - Si `items` no incluye `product_name`, hacer lookup en el store
   - Cachear nombres de productos para mejor performance

3. **Indicador Visual de Ventas a Granel**
   - Mostrar badge especial cuando `is_bulk_sale === true`
   - Diferenciar visualmente en la tabla

---

## 📚 Archivos Modificados

1. ✅ `src/types/index.ts`
   - Interface `SaleDetail` actualizada
   - Interface `Sale` actualizada

2. ✅ `src/pages/SalesHistory/SalesHistory.tsx`
   - Conteo de items actualizado

3. ✅ `src/pages/Sales/SalesPage.tsx`
   - Mensaje de confirmación actualizado

---

## 🎉 Resumen

La estructura de tipos ahora es **totalmente flexible** y soporta:
- ✅ Campo `items` (estructura real del backend)
- ✅ Campo `sale_details` (retrocompatibilidad)
- ✅ Nuevo campo `is_bulk_sale` para identificar ventas a granel
- ✅ Campos opcionales para mayor flexibilidad

**Resultado**: El frontend está preparado para manejar **cualquier estructura** que devuelva el backend! 🚀
