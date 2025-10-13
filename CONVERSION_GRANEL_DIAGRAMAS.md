# 📊 Diagrama Visual - Sistema de Conversión a Granel

## 🎯 Vista General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE CONVERSIÓN A GRANEL                │
│                                                                   │
│  Permite convertir productos empaquetados a granel para venta    │
│  por peso o medida en cantidades personalizadas                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitectura de Componentes

```
┌───────────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │         InventoryDashboard (Parent Component)           │   │
│   │                                                          │   │
│   │  • Lista de productos y presentaciones                  │   │
│   │  • Botón "📦➡️🌾 Abrir a Granel"                       │   │
│   │  • Badge de stock granel                                │   │
│   │  • Gestión del estado del modal                         │   │
│   └──────────────────┬──────────────────────────────────────┘   │
│                      │                                            │
│                      │ Props: product, presentation               │
│                      ↓                                            │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │      BulkConversionModal (Child Component)              │   │
│   │                                                          │   │
│   │  • Formulario de conversión                             │   │
│   │  • Obtención automática de lote (FIFO)                  │   │
│   │  • Selección de presentación granel                     │   │
│   │  • Validaciones y manejo de errores                     │   │
│   │  • Estados de carga                                     │   │
│   └──────────────────┬──────────────────────────────────────┘   │
│                      │                                            │
└──────────────────────┼────────────────────────────────────────────┘
                       │
                       │ API Calls
                       ↓
┌───────────────────────────────────────────────────────────────────┐
│                        CAPA DE LÓGICA                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              MAPOAPIClient                               │   │
│   │                                                          │   │
│   │  ┌────────────────────────────────────────────────┐    │   │
│   │  │  openBulkConversion()                          │    │   │
│   │  │  • POST /products/open-bulk/                   │    │   │
│   │  │  • Convierte paquete a granel                  │    │   │
│   │  └────────────────────────────────────────────────┘    │   │
│   │                                                          │   │
│   │  ┌────────────────────────────────────────────────┐    │   │
│   │  │  getAvailableLotDetails()                      │    │   │
│   │  │  • GET /presentations/{id}/lot-details         │    │   │
│   │  │  • Obtiene lotes disponibles                   │    │   │
│   │  └────────────────────────────────────────────────┘    │   │
│   │                                                          │   │
│   │  ┌────────────────────────────────────────────────┐    │   │
│   │  │  getActiveBulkStock()                          │    │   │
│   │  │  • GET /products/bulk-stock/                   │    │   │
│   │  │  • Lista stock granel activo                   │    │   │
│   │  └────────────────────────────────────────────────┘    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────┬────────────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       ↓
┌───────────────────────────────────────────────────────────────────┐
│                      BACKEND API                                  │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   POST /products/open-bulk/                                      │
│   GET  /products/bulk-stock/                                     │
│   GET  /api/v1/inventory/presentations/{id}/lot-details          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Conversión Detallado

```
┌──────────────────────────────────────────────────────────────────┐
│                    INICIO DEL PROCESO                            │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│  PASO 1: Usuario ve Dashboard de Inventario                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  🍚 Arroz Premium                      [Alimentos]     │    │
│  │  • Bolsa 500g                                          │    │
│  │    Stock: 10  $8,500                                   │    │
│  │    [📦➡️🌾 Abrir a Granel] ← Usuario hace click       │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│  PASO 2: Modal se abre y obtiene información                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Estado: loading                                       │    │
│  │  Acción: fetchLotDetailId()                            │    │
│  │                                                         │    │
│  │  → apiClient.getAvailableLotDetails(presentationId)   │    │
│  │                                                         │    │
│  │  Respuesta: [                                          │    │
│  │    { id: "lot-1", quantity: 50, date: "2025-01-01" }, │    │
│  │    { id: "lot-2", quantity: 30, date: "2025-01-15" }  │    │
│  │  ]                                                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Aplicar FIFO:                                         │    │
│  │  1. Filtrar lotes con quantity > 0                     │    │
│  │  2. Ordenar por fecha (más antiguo primero)            │    │
│  │  3. Seleccionar lot-1 (2025-01-01)                     │    │
│  │                                                         │    │
│  │  lotDetailId = "lot-1"  ✅                             │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│  PASO 3: Modal muestra formulario                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  📦➡️🌾 Abrir Bulto para Granel          [✕]          │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  🍚 Arroz Premium                                      │    │
│  │  Presentación a abrir: Bolsa 500g                      │    │
│  │  Contenido: 500g                                       │    │
│  │  Paquetes disponibles: 10                              │    │
│  │                                                         │    │
│  │  ℹ️ Al abrir se restará 1 paquete y se habilitará     │    │
│  │     500g para venta a granel                           │    │
│  │                                                         │    │
│  │  Presentación Granel *                                 │    │
│  │  [ Granel (gramos) ▼ ] ← Usuario selecciona           │    │
│  │                                                         │    │
│  │  Cantidad *                                            │    │
│  │  [ 500 ]            ← Pre-llenado                      │    │
│  │                                                         │    │
│  │  [Cancelar]      [📦➡️🌾 Abrir Bulto]                 │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│  PASO 4: Usuario hace click en "Abrir Bulto"                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Validaciones:                                         │    │
│  │  ✅ lotDetailId existe                                 │    │
│  │  ✅ targetPresentationId seleccionado                  │    │
│  │  ✅ quantity > 0                                       │    │
│  │  ✅ availablePackages >= 1                            │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│  PASO 5: Envío de datos al backend                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Request:                                              │    │
│  │  POST /products/open-bulk/                             │    │
│  │                                                         │    │
│  │  Body: {                                               │    │
│  │    "source_lot_detail_id": "lot-1",                    │    │
│  │    "target_presentation_id": "granel-uuid",            │    │
│  │    "quantity": 500                                     │    │
│  │  }                                                      │    │
│  │                                                         │    │
│  │  Headers: {                                            │    │
│  │    "Authorization": "Bearer token...",                 │    │
│  │    "Content-Type": "application/json"                  │    │
│  │  }                                                      │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│  PASO 6: Backend procesa la conversión                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Validaciones Backend:                                 │    │
│  │  1. Usuario tiene permiso PRODUCTS:UPDATE             │    │
│  │  2. Lote existe y está activo                          │    │
│  │  3. Hay stock disponible                               │    │
│  │  4. Presentación destino es tipo granel                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Operaciones:                                          │    │
│  │  1. Restar 1 del stock_available                       │    │
│  │  2. Sumar 500g al bulk_stock_available                 │    │
│  │  3. Crear registro BulkConversion                      │    │
│  │  4. Actualizar tablas de inventario                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Response: {                                           │    │
│  │    "message": "Conversión exitosa",                    │    │
│  │    "bulk_conversion_id": "uuid-...",                   │    │
│  │    "converted_quantity": 500,                          │    │
│  │    "remaining_bulk": 500,                              │    │
│  │    "status": "ACTIVE"                                  │    │
│  │  }                                                      │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│  PASO 7: Modal muestra éxito                                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ✅ ¡Bulto abierto exitosamente! Redirigiendo...       │    │
│  │                                                         │    │
│  │  Espera 2 segundos...                                  │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│  PASO 8: Actualización del inventario                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  onSuccess() se ejecuta:                               │    │
│  │  • loadProducts() o loadProductsForCategory()          │    │
│  │  • Modal se cierra                                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Dashboard actualizado:                                │    │
│  │                                                         │    │
│  │  🍚 Arroz Premium                      [Alimentos]     │    │
│  │  • Bolsa 500g                                          │    │
│  │    Stock: 9  Granel: 500g  $8,500     ← ACTUALIZADO   │    │
│  │    [📦➡️🌾 Abrir a Granel]                            │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│                      FIN DEL PROCESO                             │
│                  ✅ CONVERSIÓN COMPLETADA                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔀 Diagrama de Estados del Modal

```
┌──────────┐
│  CLOSED  │ (isOpen = false)
└─────┬────┘
      │
      │ Usuario click "Abrir a Granel"
      ↓
┌──────────────┐
│   OPENING    │ (isOpen = true, loadingLotDetail = true)
└──────┬───────┘
       │
       │ fetchLotDetailId()
       ↓
┌──────────────┐         ┌───────────┐
│    READY     │────────→│  ERROR    │ (sin lotes disponibles)
└──────┬───────┘         └───────────┘
       │
       │ Usuario llena formulario
       ↓
┌──────────────┐
│  VALIDATING  │ (checking form)
└──────┬───────┘
       │
       │ handleSubmit()
       ↓
┌──────────────┐         ┌───────────┐
│  SUBMITTING  │────────→│  ERROR    │ (400, 403, 404)
└──────┬───────┘         └─────┬─────┘
       │                        │
       │ API success            │ Usuario corrige
       ↓                        ↓
┌──────────────┐         ┌──────────────┐
│   SUCCESS    │         │    READY     │
└──────┬───────┘         └──────────────┘
       │
       │ Espera 2s
       ↓
┌──────────────┐
│   CLOSING    │ (onSuccess(), onClose())
└──────┬───────┘
       │
       ↓
┌──────────┐
│  CLOSED  │
└──────────┘
```

---

## 📊 Diagrama de Datos

### Estado Antes de la Conversión

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTO: Arroz Premium                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Presentación: Bolsa 500g                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  stock_available:      10 bolsas                     │  │
│  │  bulk_stock_available: 0 g                           │  │
│  │  total_stock:          5000g (10 × 500g)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Presentación: Granel (gramos)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  unit: "g"                                           │  │
│  │  price: $17 por gramo                                │  │
│  │  bulk_stock_available: 0g                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Operación de Conversión

```
┌─────────────────────────────────────────────────────────────┐
│                  OPERACIÓN: Abrir 1 Bolsa                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input:                                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  source_lot_detail_id:     "lot-1"                   │  │
│  │  target_presentation_id:   "granel-uuid"             │  │
│  │  quantity:                 500                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Cálculos:                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  stock_available:      10 - 1 = 9 bolsas            │  │
│  │  bulk_stock_available: 0 + 500 = 500g               │  │
│  │  total_stock:          5000g (sin cambio)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Output:                                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  bulk_conversion_id:  "conv-uuid"                    │  │
│  │  converted_quantity:  500                            │  │
│  │  remaining_bulk:      500                            │  │
│  │  status:              "ACTIVE"                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Estado Después de la Conversión

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTO: Arroz Premium                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Presentación: Bolsa 500g                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  stock_available:      9 bolsas       ← -1           │  │
│  │  bulk_stock_available: 500g           ← +500g        │  │
│  │  total_stock:          5000g          ← Sin cambio   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Presentación: Granel (gramos)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  unit: "g"                                           │  │
│  │  price: $17 por gramo                                │  │
│  │  bulk_stock_available: 500g          ← NUEVO         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Registro BulkConversion:                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  id: "conv-uuid"                                     │  │
│  │  source_lot_detail_id: "lot-1"                       │  │
│  │  target_presentation_id: "granel-uuid"               │  │
│  │  converted_quantity: 500                             │  │
│  │  remaining_bulk: 500                                 │  │
│  │  status: "ACTIVE"                                    │  │
│  │  conversion_date: "2025-06-10T10:30:00Z"             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Sistema FIFO Visualizado

```
┌──────────────────────────────────────────────────────────────┐
│              SELECCIÓN AUTOMÁTICA DE LOTE (FIFO)             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Lotes Disponibles:                                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  LOT-1                                              │    │
│  │  Fecha producción: 2025-01-01  ← MÁS ANTIGUO       │    │
│  │  Cantidad disponible: 50                            │    │
│  │  Estado: ACTIVE                                     │    │
│  │                                                      │    │
│  │  → ESTE SE SELECCIONA ✅                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  LOT-2                                              │    │
│  │  Fecha producción: 2025-01-15                       │    │
│  │  Cantidad disponible: 30                            │    │
│  │  Estado: ACTIVE                                     │    │
│  │                                                      │    │
│  │  → Se usará cuando LOT-1 se agote                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  LOT-3                                              │    │
│  │  Fecha producción: 2025-02-01                       │    │
│  │  Cantidad disponible: 75                            │    │
│  │  Estado: ACTIVE                                     │    │
│  │                                                      │    │
│  │  → Se usará al final                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Lógica de Selección:                                        │
│  1. Filtrar: quantity_available > 0                          │
│  2. Ordenar: por production_date ASC                         │
│  3. Tomar: el primero de la lista                            │
│                                                               │
│  Beneficio: Reduce desperdicio usando producto más antiguo  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida del Stock Granel

```
┌──────────────────────────────────────────────────────────────┐
│                 CICLO DE VIDA: Stock Granel                   │
└──────────────────────────────────────────────────────────────┘

ETAPA 1: CREACIÓN
┌────────────────────────────────────────┐
│  • Usuario abre 1 paquete de 500g      │
│  • Sistema crea BulkConversion         │
│  • Status: ACTIVE                      │
│  • remaining_bulk: 500g                │
└────────────────────────────────────────┘
                   ↓
ETAPA 2: USO PARCIAL
┌────────────────────────────────────────┐
│  • Cliente compra 150g                 │
│  • Sistema actualiza remaining_bulk    │
│  • remaining_bulk: 350g                │
│  • Status: ACTIVE                      │
└────────────────────────────────────────┘
                   ↓
ETAPA 3: USO CONTINUO
┌────────────────────────────────────────┐
│  • Cliente compra 200g                 │
│  • remaining_bulk: 150g                │
│  • Status: ACTIVE                      │
└────────────────────────────────────────┘
                   ↓
ETAPA 4: AGOTADO
┌────────────────────────────────────────┐
│  • Cliente compra 150g                 │
│  • remaining_bulk: 0g                  │
│  • Status: COMPLETED                   │
│  • Registro se mantiene para historial│
└────────────────────────────────────────┘
```

---

## 📱 Diseño Responsive

```
┌────────────────────────────────────────────────────────┐
│                    DESKTOP (> 768px)                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │  📦➡️🌾 Abrir Bulto para Granel         [✕] │    │
│  ├──────────────────────────────────────────────┤    │
│  │                                              │    │
│  │  🍚 Arroz Premium                            │    │
│  │  Presentación: Bolsa 500g                    │    │
│  │  Contenido: 500g                             │    │
│  │  Paquetes disponibles: 10                    │    │
│  │                                              │    │
│  │  Presentación Granel *                       │    │
│  │  [ Granel (gramos)            ▼ ]          │    │
│  │                                              │    │
│  │  Cantidad *                                  │    │
│  │  [ 500                           ]          │    │
│  │                                              │    │
│  │  [Cancelar]        [📦➡️🌾 Abrir Bulto]    │    │
│  └──────────────────────────────────────────────┘    │
│                Width: 500px                          │
│                Centered on screen                    │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                 TABLET (480px - 768px)                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │  📦➡️🌾 Abrir Bulto             [✕]         │    │
│  ├──────────────────────────────────────────────┤    │
│  │                                              │    │
│  │  🍚 Arroz Premium                            │    │
│  │  Presentación: Bolsa 500g                    │    │
│  │  Contenido: 500g                             │    │
│  │  Paquetes: 10                                │    │
│  │                                              │    │
│  │  Presentación Granel *                       │    │
│  │  [ Granel (gramos)      ▼ ]                │    │
│  │                                              │    │
│  │  Cantidad *                                  │    │
│  │  [ 500                     ]                │    │
│  │                                              │    │
│  │  [Cancelar] [📦➡️🌾 Abrir]                 │    │
│  └──────────────────────────────────────────────┘    │
│                Width: 90%                            │
│                Padding reducido                      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                   MOBILE (< 480px)                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │  📦➡️🌾 Abrir      [✕]                      │    │
│  ├──────────────────────────────────────────────┤    │
│  │                                              │    │
│  │  🍚 Arroz Premium                            │    │
│  │  Bolsa 500g                                  │    │
│  │  Contenido: 500g                             │    │
│  │  Paquetes: 10                                │    │
│  │                                              │    │
│  │  Presentación *                              │    │
│  │  [ Granel (gramos) ▼ ]                     │    │
│  │                                              │    │
│  │  Cantidad *                                  │    │
│  │  [ 500              ]                       │    │
│  │                                              │    │
│  │  ┌────────────────────────────┐            │    │
│  │  │       Cancelar             │            │    │
│  │  └────────────────────────────┘            │    │
│  │  ┌────────────────────────────┐            │    │
│  │  │  📦➡️🌾 Abrir Bulto        │            │    │
│  │  └────────────────────────────┘            │    │
│  └──────────────────────────────────────────────┘    │
│                Width: 95%                            │
│                Botones apilados                      │
│                Touch-friendly (44px min)             │
└────────────────────────────────────────────────────────┘
```

---

## 🔐 Diagrama de Seguridad

```
┌──────────────────────────────────────────────────────────────┐
│                     CAPA DE SEGURIDAD                         │
└──────────────────────────────────────────────────────────────┘

Usuario hace request
         ↓
┌────────────────────────────────────────┐
│  1. Verificar Autenticación            │
│     • Token Bearer válido              │
│     • Token no expirado                │
│     • Usuario existe en sistema        │
└─────────────┬──────────────────────────┘
              │ ✅ Autenticado
              ↓
┌────────────────────────────────────────┐
│  2. Verificar Autorización             │
│     • Usuario tiene rol adecuado       │
│     • Permiso PRODUCTS:UPDATE          │
│     • Rol: Admin, Manager, Inventory   │
└─────────────┬──────────────────────────┘
              │ ✅ Autorizado
              ↓
┌────────────────────────────────────────┐
│  3. Validar Datos de Entrada           │
│     • source_lot_detail_id: UUID       │
│     • target_presentation_id: UUID     │
│     • quantity: integer > 0            │
└─────────────┬──────────────────────────┘
              │ ✅ Datos válidos
              ↓
┌────────────────────────────────────────┐
│  4. Verificar Recursos Existen         │
│     • Lote existe en BD                │
│     • Presentación existe en BD        │
│     • Producto está activo             │
└─────────────┬──────────────────────────┘
              │ ✅ Recursos válidos
              ↓
┌────────────────────────────────────────┐
│  5. Validar Reglas de Negocio          │
│     • Stock disponible >= 1            │
│     • Lote está activo                 │
│     • Presentación es tipo granel      │
│     • Cantidad <= stock disponible     │
└─────────────┬──────────────────────────┘
              │ ✅ Reglas cumplidas
              ↓
┌────────────────────────────────────────┐
│  6. Ejecutar Transacción               │
│     • BEGIN TRANSACTION                │
│     • UPDATE stock_available           │
│     • UPDATE bulk_stock_available      │
│     • INSERT bulk_conversion           │
│     • COMMIT                           │
└─────────────┬──────────────────────────┘
              │ ✅ Transacción exitosa
              ↓
┌────────────────────────────────────────┐
│  7. Respuesta al Cliente               │
│     • Status: 200 OK                   │
│     • Body: BulkConversionResponse     │
└────────────────────────────────────────┘

Si falla en cualquier paso:
         ↓
┌────────────────────────────────────────┐
│  Manejo de Error                       │
│  • 401: No autenticado                 │
│  • 403: Sin permisos                   │
│  • 400: Datos inválidos                │
│  • 404: Recurso no encontrado          │
│  • 500: Error interno                  │
└────────────────────────────────────────┘
```

---

## 📈 Diagrama de Rendimiento

```
┌──────────────────────────────────────────────────────────────┐
│            OPTIMIZACIONES DE RENDIMIENTO                      │
└──────────────────────────────────────────────────────────────┘

FRONTEND
┌────────────────────────────────────────┐
│  1. Carga Inicial                      │
│     • Tiempo: ~200ms                   │
│     • GET /products                    │
│     • Cache en memoria (Zustand)       │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│  2. Apertura de Modal                  │
│     • Tiempo: ~50ms                    │
│     • Renderizado React                │
│     • Sin llamadas API                 │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│  3. Obtención de Lotes                 │
│     • Tiempo: ~300ms                   │
│     • GET /lot-details                 │
│     • Procesamiento FIFO: ~10ms        │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│  4. Conversión                         │
│     • Tiempo: ~400ms                   │
│     • POST /open-bulk/                 │
│     • Transacción BD: ~200ms           │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│  5. Actualización UI                   │
│     • Tiempo: ~300ms                   │
│     • GET /products                    │
│     • Re-render: ~50ms                 │
└────────────────────────────────────────┘

TOTAL: ~1.3 segundos (experiencia fluida)

OPTIMIZACIONES APLICADAS:
✅ Lazy loading de componentes
✅ Memoización de cálculos FIFO
✅ Debounce en búsqueda
✅ Cache de productos en store
✅ Transacciones optimizadas en BD
✅ Índices en tablas principales
```

---

## 🎨 Paleta de Colores

```
┌──────────────────────────────────────────────────────────────┐
│                      SISTEMA DE COLORES                       │
└──────────────────────────────────────────────────────────────┘

PRIMARIOS
┌────────────────────────────────────────┐
│  Azul Principal   #0066cc  ████████    │  Botón primario
│  Azul Hover       #0052a3  ████████    │  Hover state
│  Azul Claro       #dbeafe  ████████    │  Badge granel
│  Azul Oscuro      #1e40af  ████████    │  Texto badge
└────────────────────────────────────────┘

ESTADOS
┌────────────────────────────────────────┐
│  Verde Éxito      #10b981  ████████    │  Conversión exitosa
│  Verde Claro      #dcfce7  ████████    │  Stock disponible
│  Amarillo         #f59e0b  ████████    │  Stock bajo
│  Amarillo Claro   #fef3c7  ████████    │  Badge advertencia
│  Rojo Error       #ef4444  ████████    │  Error, sin stock
│  Rojo Claro       #fee2e2  ████████    │  Badge error
└────────────────────────────────────────┘

NEUTROS
┌────────────────────────────────────────┐
│  Gris Oscuro      #333333  ████████    │  Texto principal
│  Gris Medio       #666666  ████████    │  Texto secundario
│  Gris Claro       #f1f3f4  ████████    │  Bordes
│  Gris Muy Claro   #f8f9fa  ████████    │  Fondo
│  Blanco           #ffffff  ████████    │  Tarjetas
└────────────────────────────────────────┘
```

---

**Documento creado:** Enero 2025  
**Versión:** 1.0  
**Propósito:** Visualización completa del sistema de conversión a granel
