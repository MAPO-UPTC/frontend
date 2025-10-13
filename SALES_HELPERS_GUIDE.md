# 🛠️ Sales Helpers - Guía de Uso

## 📚 Utilidades para Trabajar con Ventas

Se han creado funciones helper en `src/utils/salesHelpers.ts` para trabajar de forma consistente con items de ventas, sin importar si vienen en formato `items` o `sale_details`.

---

## 🎯 Funciones Disponibles

### 1. **getSaleItems(sale)**
Obtiene los items de una venta, independientemente del formato.

```typescript
import { getSaleItems } from '../utils/salesHelpers';

const sale: Sale = {
  id: 'uuid',
  items: [/* ... */],
  // ... otros campos
};

const items = getSaleItems(sale);
console.log(`Número de items: ${items.length}`);
```

**Retorna**: `SaleDetail[]`

---

### 2. **calculateItemSubtotal(item)**
Calcula el subtotal de un item individual.

```typescript
import { calculateItemSubtotal } from '../utils/salesHelpers';

const item: SaleDetail = {
  id: 'uuid',
  product_id: 'uuid-producto',
  quantity: 2,
  unit_price: 15000,
  is_bulk_sale: false
};

const subtotal = calculateItemSubtotal(item);
console.log(`Subtotal: $${subtotal}`); // $30000
```

**Retorna**: `number`

---

### 3. **calculateSaleTotal(sale)**
Calcula el total de una venta completa.

```typescript
import { calculateSaleTotal } from '../utils/salesHelpers';

const sale: Sale = {
  id: 'uuid',
  items: [
    { quantity: 2, unit_price: 15000, ... },
    { quantity: 1, unit_price: 8000, ... }
  ],
  // ... otros campos
};

const total = calculateSaleTotal(sale);
console.log(`Total: $${total}`); // $38000
```

**Prioridad**:
1. Usa `sale.total` si existe
2. Usa `sale.total_amount` si existe
3. Calcula sumando `quantity * unit_price` de todos los items

**Retorna**: `number`

---

### 4. **isBulkSaleItem(item)**
Verifica si un item es una venta a granel.

```typescript
import { isBulkSaleItem } from '../utils/salesHelpers';

const item: SaleDetail = {
  id: 'uuid',
  product_id: 'uuid-producto',
  quantity: 5,
  unit_price: 3800,
  is_bulk_sale: true
};

if (isBulkSaleItem(item)) {
  console.log('Este es un item a granel');
}
```

**Retorna**: `boolean`

---

### 5. **getSaleItemsCount(sale)**
Cuenta la cantidad de items en una venta.

```typescript
import { getSaleItemsCount } from '../utils/salesHelpers';

const sale: Sale = {
  id: 'uuid',
  items: [/* 3 items */],
  // ... otros campos
};

const count = getSaleItemsCount(sale);
console.log(`Items: ${count}`); // Items: 3
```

**Retorna**: `number`

---

### 6. **getItemProductName(item, fallback?)**
Obtiene el nombre del producto con un fallback opcional.

```typescript
import { getItemProductName } from '../utils/salesHelpers';

const item: SaleDetail = {
  id: 'uuid',
  product_id: 'uuid-producto',
  // product_name puede ser undefined
  quantity: 2,
  unit_price: 15000,
  is_bulk_sale: false
};

const name = getItemProductName(item, 'Sin nombre');
console.log(`Producto: ${name}`);
```

**Retorna**: `string`

---

### 7. **formatSaleItem(item)**
Formatea un item para mostrar en UI de forma consistente.

```typescript
import { formatSaleItem } from '../utils/salesHelpers';

const item: SaleDetail = {
  id: 'uuid-item',
  product_id: 'uuid-producto',
  product_name: 'Chunky Adulto 25kg',
  quantity: 2,
  unit_price: 95000,
  is_bulk_sale: false
};

const formatted = formatSaleItem(item);
console.log(formatted);
```

**Retorna**:
```typescript
{
  id: 'uuid-item',
  productId: 'uuid-producto',
  productName: 'Chunky Adulto 25kg',
  quantity: 2,
  unitPrice: 95000,
  subtotal: 190000,
  isBulk: false
}
```

---

### 8. **formatSaleItems(sale)**
Formatea todos los items de una venta.

```typescript
import { formatSaleItems } from '../utils/salesHelpers';

const sale: Sale = {
  id: 'uuid-venta',
  items: [
    { id: '1', product_id: 'p1', quantity: 2, unit_price: 15000, is_bulk_sale: false },
    { id: '2', product_id: 'p2', quantity: 1, unit_price: 8000, is_bulk_sale: true }
  ],
  // ... otros campos
};

const formattedItems = formatSaleItems(sale);
console.log(formattedItems);
// [
//   { id: '1', productId: 'p1', productName: '...', quantity: 2, unitPrice: 15000, subtotal: 30000, isBulk: false },
//   { id: '2', productId: 'p2', productName: '...', quantity: 1, unitPrice: 8000, subtotal: 8000, isBulk: true }
// ]
```

**Retorna**: `FormattedSaleItem[]`

---

## 💡 Ejemplos de Uso Práctico

### **Ejemplo 1: Mostrar Resumen de Venta**
```typescript
import { getSaleItems, calculateSaleTotal, getSaleItemsCount } from '../utils/salesHelpers';

const SaleSummary: React.FC<{ sale: Sale }> = ({ sale }) => {
  const itemsCount = getSaleItemsCount(sale);
  const total = calculateSaleTotal(sale);
  
  return (
    <div>
      <h3>Resumen de Venta</h3>
      <p>Items: {itemsCount}</p>
      <p>Total: ${total.toLocaleString('es-CO')}</p>
    </div>
  );
};
```

---

### **Ejemplo 2: Lista de Items con Badge de Granel**
```typescript
import { formatSaleItems } from '../utils/salesHelpers';

const SaleItemsList: React.FC<{ sale: Sale }> = ({ sale }) => {
  const items = formatSaleItems(sale);
  
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          {item.productName} - {item.quantity} x ${item.unitPrice}
          {item.isBulk && <span className="badge">🔄 Granel</span>}
          <strong> = ${item.subtotal}</strong>
        </li>
      ))}
    </ul>
  );
};
```

---

### **Ejemplo 3: Calcular Estadísticas**
```typescript
import { getSaleItems, calculateItemSubtotal, isBulkSaleItem } from '../utils/salesHelpers';

const calculateStats = (sale: Sale) => {
  const items = getSaleItems(sale);
  
  const totalItems = items.length;
  const bulkItems = items.filter(isBulkSaleItem).length;
  const totalAmount = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  
  return {
    totalItems,
    bulkItems,
    regularItems: totalItems - bulkItems,
    totalAmount,
    averagePerItem: totalAmount / totalItems
  };
};
```

---

### **Ejemplo 4: Filtrar Items a Granel**
```typescript
import { getSaleItems, isBulkSaleItem } from '../utils/salesHelpers';

const BulkItemsList: React.FC<{ sale: Sale }> = ({ sale }) => {
  const allItems = getSaleItems(sale);
  const bulkItems = allItems.filter(isBulkSaleItem);
  
  return (
    <div>
      <h4>Items a Granel ({bulkItems.length})</h4>
      <ul>
        {bulkItems.map(item => (
          <li key={item.id}>
            {item.quantity} x ${item.unit_price}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

### **Ejemplo 5: Componente de Tabla Mejorado**
```typescript
import { formatSaleItems } from '../utils/salesHelpers';

const SalesTable: React.FC<{ sales: Sale[] }> = ({ sales }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Items</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {sales.map(sale => {
          const items = formatSaleItems(sale);
          const total = items.reduce((sum, item) => sum + item.subtotal, 0);
          
          return (
            <tr key={sale.id}>
              <td>{sale.sale_code}</td>
              <td>{new Date(sale.sale_date).toLocaleString('es-CO')}</td>
              <td>
                {items.length} 
                {items.some(i => i.isBulk) && ' 🔄'}
              </td>
              <td>${total.toLocaleString('es-CO')}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
```

---

## ✅ Ventajas de Usar los Helpers

1. ✅ **Código más limpio**: No necesitas verificar `items` vs `sale_details` manualmente
2. ✅ **Consistencia**: Mismo comportamiento en todo el frontend
3. ✅ **Mantenibilidad**: Si cambia la estructura, solo actualizas los helpers
4. ✅ **Type-safe**: TypeScript te ayuda a evitar errores
5. ✅ **Reutilizable**: Usa las mismas funciones en múltiples componentes
6. ✅ **Testeable**: Fácil de probar unitariamente

---

## 🎯 Componentes que Usan los Helpers

- ✅ `SalesHistory.tsx` - Lista de ventas históricas
- ✅ Próximamente en otros componentes de ventas

---

## 📋 Checklist de Implementación

- [x] ✅ Helpers creados en `src/utils/salesHelpers.ts`
- [x] ✅ Exportados desde `src/utils/index.js`
- [x] ✅ Implementados en `SalesHistory` component
- [x] ✅ Sin errores de compilación
- [x] ✅ TypeScript types correctos
- [x] ✅ Documentación completa

---

## 🚀 Próximos Pasos

Puedes usar estos helpers en:
- Modal de detalles de venta
- Página de creación de venta
- Reportes de ventas
- Exportación de datos
- Componentes de estadísticas

---

## 📚 Referencia Rápida

```typescript
// Importar helpers
import {
  getSaleItems,
  calculateItemSubtotal,
  calculateSaleTotal,
  isBulkSaleItem,
  getSaleItemsCount,
  getItemProductName,
  formatSaleItem,
  formatSaleItems
} from '../utils/salesHelpers';

// Uso básico
const items = getSaleItems(sale);
const total = calculateSaleTotal(sale);
const count = getSaleItemsCount(sale);
const formatted = formatSaleItems(sale);
```

---

¡Usa estos helpers para trabajar con ventas de forma más eficiente y consistente! 🎉
