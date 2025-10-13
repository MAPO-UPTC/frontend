# 📋 Página de Detalles de Venta - Implementación Completa

## ✅ Resumen

Se ha implementado exitosamente una página completa para visualizar los detalles de cada venta individual, incluyendo información del cliente, vendedor, productos vendidos y análisis financiero.

---

## 🎯 Características Implementadas

### 1. **Información General de la Venta**
- ✅ Código de venta único
- ✅ Fecha y hora de la venta
- ✅ Estado de la venta (Completada, Pendiente, Cancelada)
- ✅ Total de la venta

### 2. **Información de Personas**
- ✅ **Cliente**: Nombre completo y documento
- ✅ **Vendedor**: Nombre completo del usuario que realizó la venta

### 3. **Tabla de Productos Vendidos**
- ✅ Nombre del producto
- ✅ Nombre de la presentación
- ✅ Cantidad vendida
- ✅ Precio unitario de venta
- ✅ Costo unitario (del lote)
- ✅ Subtotal por producto
- ✅ Margen de ganancia por producto
- ✅ Indicador visual para ventas a granel

### 4. **Resumen Financiero**
- ✅ Costo total (suma de costos de todos los productos)
- ✅ Total de venta
- ✅ Ganancia total (Total - Costo)
- ✅ Margen de ganancia en porcentaje

### 5. **Funcionalidades**
- ✅ Botón "Volver al Historial"
- ✅ Botón "Imprimir" (formato optimizado para impresión)
- ✅ Diseño responsive (desktop, tablet, móvil)
- ✅ Estados de carga y manejo de errores
- ✅ Navegación desde el historial de ventas

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

#### 1. **src/pages/SaleDetails/SaleDetails.tsx**
Componente principal de la página de detalles.

```typescript
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SaleDetailFullResponse } from '../../types';
import { MAPOAPIClient } from '../../api/client';

const SaleDetails: React.FC = () => {
  // Obtiene el ID de la URL
  // Carga los detalles de la venta
  // Calcula resumen financiero
  // Renderiza la información completa
};
```

**Características:**
- Usa `useParams` para obtener el ID de la venta desde la URL
- Gestiona estados de carga, error y datos
- Calcula automáticamente costos, ganancias y márgenes
- Formatea fechas y números según locale español (Colombia)

#### 2. **src/pages/SaleDetails/SaleDetails.css**
Estilos completos y responsivos para la página.

**Características:**
- Diseño moderno con gradientes y sombras
- Tablas responsivas con scroll horizontal
- Estados visuales para Completada/Pendiente/Cancelada
- Badges para ventas a granel
- Optimización para impresión (`@media print`)
- Breakpoints para móvil (480px, 768px, 1024px)

#### 3. **src/pages/SaleDetails/index.ts**
Archivo de exportación del componente.

---

### Archivos Modificados

#### 1. **src/types/index.ts**
Agregadas interfaces para detalles extendidos de venta:

```typescript
export interface SaleDetailExtended {
  id: UUID;
  sale_id: UUID;
  presentation_id: UUID;
  lot_detail_id: UUID | null;
  bulk_conversion_id: UUID | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_name: string;
  presentation_name: string;
  cost_price: number; // ⭐ Precio de costo del lote
}

export interface SaleDetailFullResponse {
  id: UUID;
  sale_code: string;
  sale_date: Timestamp;
  customer_id: UUID;
  user_id: UUID;
  total: number;
  status: string;
  customer_name: string; // ⭐ Nombre completo del cliente
  customer_document: string; // ⭐ Documento con tipo
  seller_name: string; // ⭐ Nombre completo del vendedor
  items: SaleDetailExtended[];
}
```

#### 2. **src/api/client.ts**
Agregado método para obtener detalles de venta:

```typescript
async getSaleDetails(saleId: UUID): Promise<SaleDetailFullResponse> {
  return this.request<SaleDetailFullResponse>(`/sales/${saleId}/details`);
}
```

#### 3. **src/App.js**
Agregada ruta para detalles de venta:

```javascript
import SaleDetails from "./pages/SaleDetails/SaleDetails";

// ...

<Route
  path="/sales/:id/details"
  element={
    <PrivateRoute>
      <SaleDetails />
    </PrivateRoute>
  }
/>
```

#### 4. **src/pages/SalesHistory/SalesHistory.tsx**
Agregada navegación al hacer clic en "Ver":

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// En el botón de la tabla:
<button
  className="view-details-btn"
  onClick={() => navigate(`/sales/${sale.id}/details`)}
  title="Ver detalles de la venta"
>
  👁️ Ver
</button>
```

---

## 🚀 Cómo Usar

### Desde el Historial de Ventas

1. Ve a **"Historial de Ventas"** (`/sales/history`)
2. Localiza la venta que deseas ver en detalle
3. Haz clic en el botón **"👁️ Ver"** en la columna "Acciones"
4. Se abrirá la página de detalles de esa venta

### URL Directa

Puedes acceder directamente a los detalles de una venta usando:
```
/sales/{sale_id}/details
```

Ejemplo:
```
/sales/550e8400-e29b-41d4-a716-446655440000/details
```

---

## 📊 Estructura de la Página

### Header
```
┌─────────────────────────────────────────────────┐
│ ← Volver al Historial  📋 Detalles de Venta  🖨️ Imprimir │
└─────────────────────────────────────────────────┘
```

### Información General
```
┌────────────────────────────────────────────┐
│ Información General                         │
├────────────────────────────────────────────┤
│ Código: VEN-20251012120530                 │
│ Fecha: 12 de octubre de 2025, 12:05       │
│ Estado: [Completada] [badge verde]         │
│ Total Venta: $87.50                        │
└────────────────────────────────────────────┘
```

### Cliente y Vendedor (lado a lado)
```
┌──────────────────────┐  ┌──────────────────────┐
│ 👤 Cliente           │  │ 👨‍💼 Vendedor          │
├──────────────────────┤  ├──────────────────────┤
│ Nombre: Juan Pérez   │  │ Nombre: María García │
│ Documento: CC: 12345 │  │                      │
└──────────────────────┘  └──────────────────────┘
```

### Tabla de Productos
```
┌───────────────────────────────────────────────────────────────────────┐
│ Producto    │ Presentación │ Cant. │ P.Unit │ Costo │ Subtotal │ Margen │
├───────────────────────────────────────────────────────────────────────┤
│ Arroz Diana │ Bolsa 500g   │   3   │ $15.50 │ $10.20│  $46.50  │  34.2% │
│ Azúcar 🏷️   │ Bolsa 1kg    │   2   │ $20.50 │ $14.80│  $41.00  │  27.8% │
└───────────────────────────────────────────────────────────────────────┘
```
*🏷️ = Badge "A Granel"*

### Resumen Financiero
```
┌────────────────────────────────────────┐
│ 💰 Resumen Financiero                  │
├────────────────────────────────────────┤
│ Costo Total:    $60.20 [rojo]         │
│ Total Venta:    $87.50 [azul]         │
│ Ganancia:       $27.30 (31.2%) [verde]│
└────────────────────────────────────────┘
```

---

## 💡 Cálculos Automáticos

### Costo Total
```javascript
const totalCost = saleDetails.items.reduce(
  (sum, item) => sum + (item.cost_price * item.quantity),
  0
);
```

### Ganancia Total
```javascript
const totalProfit = saleDetails.total - totalCost;
```

### Margen de Ganancia
```javascript
const profitMargin = ((totalProfit / saleDetails.total) * 100).toFixed(2);
```

### Margen por Item
```javascript
const itemProfit = (item.unit_price - item.cost_price) * item.quantity;
const itemMargin = ((itemProfit / item.line_total) * 100).toFixed(2);
```

---

## 🎨 Estados Visuales

### Estados de la Venta

| Estado      | Color de Fondo | Color de Texto | Ícono |
|-------------|----------------|----------------|-------|
| Completada  | Verde claro    | Verde oscuro   | ✅    |
| Pendiente   | Amarillo claro | Amarillo oscuro| ⏳    |
| Cancelada   | Rojo claro     | Rojo oscuro    | ❌    |

### Indicadores de Rentabilidad

| Valor        | Color  | Uso                          |
|--------------|--------|------------------------------|
| Costo        | Rojo   | `cost_price`, `totalCost`   |
| Venta        | Azul   | `unit_price`, `total`       |
| Ganancia (+) | Verde  | `profit`, `margin` positivo |
| Pérdida (-)  | Rojo   | `profit`, `margin` negativo |

---

## 📱 Responsive Design

### Desktop (> 1024px)
- Layout completo con todas las columnas
- Header horizontal con botones en los extremos
- Tablas con todas las columnas visibles

### Tablet (768px - 1024px)
- Header vertical (botones apilados)
- Se oculta columna de "Costo Unit." en tabla

### Móvil (480px - 768px)
- Grid de una columna
- Se ocultan columnas "Costo Unit." y "Margen"
- Botones a ancho completo

### Móvil Pequeño (< 480px)
- Se ocultan también "Presentación" y "Margen"
- Tamaños de fuente reducidos
- Padding compacto

---

## 🖨️ Funcionalidad de Impresión

### Al hacer clic en "Imprimir":

1. Se ocultan botones de acción (`.no-print`)
2. Se ajustan márgenes y padding
3. Se remueven sombras y efectos visuales
4. Se optimiza para página A4
5. Se previenen saltos de página dentro de secciones

```css
@media print {
  .no-print {
    display: none !important;
  }
  
  .info-section {
    page-break-inside: avoid;
  }
}
```

---

## ⚠️ Manejo de Errores

### Venta No Encontrada (404)
```
┌──────────────────────────┐
│      🔍                  │
│ Venta no encontrada      │
│ No se encontraron...     │
│ [Volver al Historial]    │
└──────────────────────────┘
```

### Error de Conexión
```
┌──────────────────────────┐
│      ❌                  │
│ Error al cargar detalles │
│ Error: Connection failed │
│ [Volver al Historial]    │
└──────────────────────────┘
```

### Estado de Carga
```
┌──────────────────────────┐
│      ⏳                  │
│ Cargando detalles...     │
└──────────────────────────┘
```

---

## 🔗 Integración con Backend

### Endpoint Usado
```
GET /sales/{sale_id}/details
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Respuesta Esperada
```json
{
  "id": "uuid",
  "sale_code": "VEN-20251012120530",
  "sale_date": "2025-10-12T12:05:30",
  "total": 87.50,
  "status": "completed",
  "customer_name": "Juan Pérez",
  "customer_document": "CC: 1234567890",
  "seller_name": "María García",
  "items": [
    {
      "product_name": "Arroz Diana",
      "presentation_name": "Paquete x 500g",
      "quantity": 3,
      "unit_price": 15.50,
      "cost_price": 10.20,
      "line_total": 46.50,
      "bulk_conversion_id": null
    }
  ]
}
```

---

## ✅ Checklist de Testing

- [x] ✅ Página se carga correctamente con ID válido
- [x] ✅ Muestra error 404 con ID inválido
- [x] ✅ Muestra estado de carga mientras obtiene datos
- [x] ✅ Información general se muestra correctamente
- [x] ✅ Datos de cliente y vendedor son correctos
- [x] ✅ Tabla de productos muestra todos los items
- [x] ✅ Cálculos financieros son precisos
- [x] ✅ Badges de estado tienen colores correctos
- [x] ✅ Badges "A Granel" aparecen cuando corresponde
- [x] ✅ Botón "Volver" regresa al historial
- [x] ✅ Botón "Imprimir" abre diálogo de impresión
- [x] ✅ Diseño responsive funciona en móvil
- [x] ✅ Formato de impresión es legible
- [x] ✅ Navegación desde historial funciona

---

## 🎯 Casos de Uso

### 1. **Revisar Detalles de una Venta**
Usuario quiere ver qué productos se vendieron, a qué precio y a quién.

**Flujo:**
1. Usuario va al historial de ventas
2. Hace clic en "👁️ Ver" en la venta deseada
3. Ve todos los detalles de la venta
4. Regresa al historial con "← Volver"

### 2. **Analizar Rentabilidad**
Usuario quiere saber cuánto ganó en una venta específica.

**Flujo:**
1. Usuario accede a detalles de la venta
2. Ve el resumen financiero
3. Revisa ganancia total y margen porcentual
4. Analiza margen por producto en la tabla

### 3. **Imprimir Factura Detallada**
Usuario necesita entregar factura física al cliente.

**Flujo:**
1. Usuario accede a detalles de la venta
2. Hace clic en "🖨️ Imprimir"
3. Ajusta configuración de impresión
4. Imprime o guarda como PDF

### 4. **Auditoría de Ventas**
Supervisor revisa ventas para control de calidad.

**Flujo:**
1. Supervisor accede a detalles de venta
2. Verifica datos del cliente
3. Confirma que vendedor es correcto
4. Revisa precios de venta vs. costos
5. Valida margen de ganancia

---

## 🚀 Próximas Mejoras Posibles

### Funcionalidades Adicionales
- [ ] Botón para editar venta (si está pendiente)
- [ ] Botón para cancelar venta
- [ ] Exportar a PDF
- [ ] Exportar a Excel
- [ ] Compartir por email
- [ ] Agregar notas a la venta
- [ ] Ver historial de cambios
- [ ] Link rápido a perfil del cliente
- [ ] Link rápido a perfil del vendedor
- [ ] Gráfico de rentabilidad por producto

### Mejoras de UI/UX
- [ ] Animaciones de entrada
- [ ] Tooltips informativos
- [ ] Modo oscuro
- [ ] Previsualización de impresión
- [ ] Zoom en tabla de productos
- [ ] Filtros/búsqueda en tabla de items
- [ ] Ordenamiento de columnas
- [ ] Paginación de items (si hay muchos)

---

## 📚 Documentación Relacionada

### Backend
- **SALE_DETAILS_ENDPOINT_GUIDE.md**: Guía completa del endpoint de backend
- **TEST_SALE_DETAILS.md**: Cómo probar el endpoint
- **SALE_DETAILS_SUMMARY.md**: Resumen de implementación backend

### Frontend
- **HISTORIAL_VENTAS_IMPLEMENTADO.md**: Documentación del historial de ventas
- **SALES_HELPERS_GUIDE.md**: Funciones helper para trabajar con ventas
- **ESTRUCTURA_ITEMS_ACTUALIZADA.md**: Estructura de items de venta

---

## 🎉 Resultado Final

✅ **Página completamente funcional** que permite:
- Ver información completa de cada venta
- Analizar rentabilidad en tiempo real
- Imprimir facturas detalladas
- Navegar fácilmente desde el historial
- Experiencia responsive en todos los dispositivos

**URL de acceso:**
```
/sales/{sale_id}/details
```

**Ejemplo:**
```
/sales/550e8400-e29b-41d4-a716-446655440000/details
```

---

**¡Página de Detalles de Venta implementada exitosamente! 🎉**
