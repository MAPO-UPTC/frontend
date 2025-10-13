# 🚀 Guía Rápida - Página de Detalles de Venta

## ⚡ Acceso Rápido

### Desde el Historial
1. Ve a `/sales/history`
2. Haz clic en **"👁️ Ver"** en cualquier venta
3. Visualiza todos los detalles

### URL Directa
```
/sales/{sale_id}/details
```

---

## 📋 Información Mostrada

### ✅ Datos de la Venta
- Código único
- Fecha y hora
- Estado (Completada/Pendiente/Cancelada)
- Total

### ✅ Personas Involucradas
- **Cliente**: Nombre y documento
- **Vendedor**: Nombre completo

### ✅ Productos Vendidos
Tabla completa con:
- Producto y presentación
- Cantidad
- Precio de venta
- Precio de costo
- Subtotal
- Margen de ganancia (%)
- Badge "A Granel" si aplica

### ✅ Resumen Financiero
- **Costo Total**: Suma de todos los costos
- **Total Venta**: Monto total de la venta
- **Ganancia**: Total - Costo
- **Margen %**: (Ganancia / Total) × 100

---

## 🎯 Funcionalidades

### Navegación
```typescript
// Botón "Volver al Historial"
navigate('/sales/history')
```

### Impresión
```typescript
// Botón "Imprimir"
window.print()
```
- Se ocultan botones
- Se optimiza formato
- Lista para impresora o PDF

---

## 🎨 Códigos de Color

### Estados
| Estado     | Fondo         | Texto         |
|------------|---------------|---------------|
| Completada | Verde claro   | Verde oscuro  |
| Pendiente  | Amarillo claro| Amarillo oscuro|
| Cancelada  | Rojo claro    | Rojo oscuro   |

### Valores Financieros
| Tipo     | Color |
|----------|-------|
| Costo    | Rojo  |
| Venta    | Azul  |
| Ganancia | Verde |
| Pérdida  | Rojo  |

---

## 📱 Responsive

### Desktop (> 1024px)
✅ Todas las columnas visibles

### Tablet (768px - 1024px)
⚠️ Oculta columna "Costo Unit."

### Móvil (480px - 768px)
⚠️ Oculta "Costo Unit." y "Margen"

### Móvil Pequeño (< 480px)
⚠️ Oculta también "Presentación"

---

## 🧮 Fórmulas de Cálculo

### Costo Total
```javascript
totalCost = Σ(cost_price × quantity)
```

### Ganancia
```javascript
profit = total - totalCost
```

### Margen %
```javascript
margin = (profit / total) × 100
```

### Margen por Item
```javascript
itemProfit = (unit_price - cost_price) × quantity
itemMargin = (itemProfit / line_total) × 100
```

---

## 🔧 Archivos Principales

```
src/
├── pages/
│   └── SaleDetails/
│       ├── SaleDetails.tsx      # Componente principal
│       ├── SaleDetails.css      # Estilos
│       └── index.ts             # Exportación
├── types/
│   └── index.ts                 # +SaleDetailFullResponse
├── api/
│   └── client.ts                # +getSaleDetails()
└── App.js                       # +Route /sales/:id/details
```

---

## 🚨 Manejo de Errores

### Venta No Encontrada
```
🔍 Venta no encontrada
No se encontraron detalles para esta venta.
[Volver al Historial]
```

### Error de Conexión
```
❌ Error al cargar detalles
{mensaje de error}
[Volver al Historial]
```

### Cargando
```
⏳ Cargando detalles de la venta...
```

---

## 📊 Ejemplo Visual

```
┌─────────────────────────────────────────────┐
│ ← Volver    📋 Detalles de Venta    🖨️ Imprimir │
├─────────────────────────────────────────────┤
│ INFORMACIÓN GENERAL                          │
│ • Código: VEN-20251012120530                │
│ • Fecha: 12 oct 2025, 12:05                 │
│ • Estado: Completada ✅                      │
│ • Total: $87.50                             │
├─────────────────────────────────────────────┤
│ 👤 CLIENTE          👨‍💼 VENDEDOR             │
│ Juan Pérez          María García            │
│ CC: 1234567890                              │
├─────────────────────────────────────────────┤
│ 📦 PRODUCTOS VENDIDOS                       │
│ ┌──────────┬─────┬───────┬───────┬────────┐│
│ │ Producto │ Cant│ P.Vta │ Costo │ Margen ││
│ ├──────────┼─────┼───────┼───────┼────────┤│
│ │ Arroz    │  3  │ 15.50 │ 10.20 │ 34.2% ││
│ │ Azúcar🏷️ │  2  │ 20.50 │ 14.80 │ 27.8% ││
│ └──────────┴─────┴───────┴───────┴────────┘│
├─────────────────────────────────────────────┤
│ 💰 RESUMEN FINANCIERO                       │
│ • Costo Total:  $60.20                      │
│ • Total Venta:  $87.50                      │
│ • Ganancia:     $27.30 (31.2%) ✅           │
└─────────────────────────────────────────────┘
```

---

## ✅ Testing Checklist

- [x] Carga con ID válido
- [x] Error con ID inválido
- [x] Navegación desde historial
- [x] Botón "Volver" funciona
- [x] Botón "Imprimir" funciona
- [x] Cálculos son correctos
- [x] Responsive en móvil
- [x] Formato de impresión OK

---

## 🎉 ¡Listo para Usar!

La página está **completamente funcional** y lista para producción.

**Documentación completa:** `DETALLES_VENTA_IMPLEMENTADO.md`
