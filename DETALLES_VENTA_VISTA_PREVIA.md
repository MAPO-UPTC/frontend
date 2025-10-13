# 🎨 Vista Previa - Página de Detalles de Venta

## 📱 Layout Completo

### Desktop View (> 1024px)
```
┌─────────────────────────────────────────────────────────────┐
│  ← Volver al Historial   📋 Detalles de Venta   🖨️ Imprimir │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Información General                                   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Código de Venta: VEN-20251012120530                 │  │
│  │  Fecha: 12 de octubre de 2025, 12:05                │  │
│  │  Estado: [Completada ✅]                              │  │
│  │  Total Venta: $87.50                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────────┐  ┌────────────────────────┐   │
│  │ 👤 Cliente              │  │ 👨‍💼 Vendedor            │   │
│  ├─────────────────────────┤  ├────────────────────────┤   │
│  │ Nombre: Juan Pérez      │  │ Nombre: María García   │   │
│  │ Documento: CC: 12345    │  │                        │   │
│  └─────────────────────────┘  └────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📦 Productos Vendidos                                 │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Producto  │Presentación│Cant│P.Unit│Costo│Subtot│Mrg│  │
│  ├───────────┼────────────┼────┼──────┼─────┼──────┼───┤  │
│  │Arroz Diana│Bolsa 500g  │ 3  │15.50 │10.20│ 46.50│34%│  │
│  │Azúcar 🏷️ │Bolsa 1kg   │ 2  │20.50 │14.80│ 41.00│28%│  │
│  └───────────┴────────────┴────┴──────┴─────┴──────┴───┘  │
│  🏷️ = A Granel                                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 💰 Resumen Financiero                                 │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Costo Total:    $60.20  [rojo]                      │  │
│  │  Total Venta:    $87.50  [azul]                      │  │
│  │  Ganancia:       $27.30 (31.2%) ✅ [verde]           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Mobile View (< 480px)
```
┌─────────────────────────┐
│ ← Volver al Historial   │
├─────────────────────────┤
│ 📋 Detalles de Venta    │
├─────────────────────────┤
│ 🖨️ Imprimir             │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │Información General  │ │
│ ├─────────────────────┤ │
│ │Código:              │ │
│ │VEN-20251012120530   │ │
│ │                     │ │
│ │Fecha:               │ │
│ │12 oct 2025, 12:05   │ │
│ │                     │ │
│ │Estado:              │ │
│ │[Completada ✅]       │ │
│ │                     │ │
│ │Total Venta:         │ │
│ │$87.50               │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │👤 Cliente           │ │
│ ├─────────────────────┤ │
│ │Juan Pérez           │ │
│ │CC: 1234567890       │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │👨‍💼 Vendedor         │ │
│ ├─────────────────────┤ │
│ │María García López   │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │📦 Productos         │ │
│ ├─────────────────────┤ │
│ │Producto│Cant│Total │ │
│ ├────────┼────┼──────┤ │
│ │Arroz   │ 3  │46.50│ │
│ │Azúcar🏷️│ 2  │41.00│ │
│ └────────┴────┴──────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │💰 Resumen           │ │
│ ├─────────────────────┤ │
│ │Costo Total:         │ │
│ │$60.20               │ │
│ │                     │ │
│ │Total Venta:         │ │
│ │$87.50               │ │
│ │                     │ │
│ │Ganancia:            │ │
│ │$27.30 (31.2%) ✅    │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

---

## 🎨 Paleta de Colores

### Badges de Estado
```css
.badge.status-completed {
  background: #d1fae5;  /* Verde claro */
  color: #065f46;       /* Verde oscuro */
}

.badge.status-pending {
  background: #fef3c7;  /* Amarillo claro */
  color: #92400e;       /* Amarillo oscuro */
}

.badge.status-cancelled {
  background: #fee2e2;  /* Rojo claro */
  color: #991b1b;       /* Rojo oscuro */
}
```

### Valores Financieros
```css
.cost {
  color: #dc2626;       /* Rojo - costos */
  font-weight: 600;
}

.value.total {
  color: #2563eb;       /* Azul - total venta */
  font-weight: 700;
}

.profit {
  color: #059669;       /* Verde - ganancias */
  font-weight: 700;
}

.loss {
  color: #dc2626;       /* Rojo - pérdidas */
  font-weight: 700;
}
```

### Fondos de Sección
```css
/* Cliente */
background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
border-left: 4px solid #3b82f6;

/* Vendedor */
background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
border-left: 4px solid #f59e0b;

/* Resumen Financiero */
background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
border-left: 4px solid #059669;
```

---

## 🔄 Estados de la Interfaz

### 1. Estado de Carga
```
┌─────────────────────────┐
│                         │
│         ⏳              │
│      ┌─────────┐        │
│      │ spinner │        │
│      └─────────┘        │
│                         │
│  Cargando detalles...   │
│                         │
└─────────────────────────┘
```

### 2. Venta No Encontrada (404)
```
┌─────────────────────────┐
│                         │
│         🔍              │
│                         │
│  Venta no encontrada    │
│                         │
│  No se encontraron      │
│  detalles para esta     │
│  venta.                 │
│                         │
│  [Volver al Historial]  │
│                         │
└─────────────────────────┘
```

### 3. Error de Conexión
```
┌─────────────────────────┐
│                         │
│         ❌              │
│                         │
│  Error al cargar        │
│  detalles               │
│                         │
│  Error: Network         │
│  connection failed      │
│                         │
│  [Volver al Historial]  │
│                         │
└─────────────────────────┘
```

### 4. Vista Normal (Con Datos)
```
┌─────────────────────────┐
│ ← Volver | 🖨️ Imprimir  │
├─────────────────────────┤
│                         │
│ [Información General]   │
│                         │
│ [Cliente | Vendedor]    │
│                         │
│ [Tabla de Productos]    │
│                         │
│ [Resumen Financiero]    │
│                         │
└─────────────────────────┘
```

---

## 📊 Ejemplos de Datos Visuales

### Badge "Completada"
```
┌──────────────┐
│ ✅ COMPLETADA │ ← Fondo verde claro
└──────────────┘   Texto verde oscuro
```

### Badge "Pendiente"
```
┌──────────────┐
│ ⏳ PENDIENTE  │ ← Fondo amarillo claro
└──────────────┘   Texto amarillo oscuro
```

### Badge "Cancelada"
```
┌──────────────┐
│ ❌ CANCELADA  │ ← Fondo rojo claro
└──────────────┘   Texto rojo oscuro
```

### Badge "A Granel"
```
┌─────────────┐
│ 🏷️ A GRANEL │ ← Fondo amarillo suave
└─────────────┘   Texto marrón oscuro
   (aparece junto al nombre del producto)
```

---

## 🧮 Ejemplos de Cálculos Visuales

### Item Individual
```
Producto: Arroz Diana
Presentación: Bolsa 500g
Cantidad: 3 unidades
Precio Venta: $15.50 c/u
Precio Costo: $10.20 c/u

┌─────────────────────────────┐
│ Subtotal = 3 × $15.50       │
│          = $46.50           │
│                             │
│ Costo = 3 × $10.20          │
│       = $30.60              │
│                             │
│ Ganancia = $46.50 - $30.60  │
│          = $15.90           │
│                             │
│ Margen = ($15.90 / $46.50)  │
│        = 34.2% ✅           │
└─────────────────────────────┘
```

### Resumen Total
```
Item 1: Arroz    → $46.50 (costo: $30.60)
Item 2: Azúcar   → $41.00 (costo: $29.60)

┌──────────────────────────────────┐
│ COSTO TOTAL                      │
│ = $30.60 + $29.60                │
│ = $60.20 [rojo]                  │
│                                  │
│ TOTAL VENTA                      │
│ = $46.50 + $41.00                │
│ = $87.50 [azul]                  │
│                                  │
│ GANANCIA                         │
│ = $87.50 - $60.20                │
│ = $27.30 [verde]                 │
│                                  │
│ MARGEN                           │
│ = ($27.30 / $87.50) × 100        │
│ = 31.2% ✅                       │
└──────────────────────────────────┘
```

---

## 🖨️ Vista de Impresión

### Cambios al Imprimir
```
ANTES (Pantalla):                 DESPUÉS (Impresión):
┌────────────────────┐           ┌────────────────────┐
│ ← Volver | Imprimir│           │                    │
├────────────────────┤           ├────────────────────┤
│ [Contenido]        │           │ [Contenido]        │
│                    │           │                    │
│ • Sombras          │    →      │ • Sin sombras      │
│ • Colores vibrantes│           │ • Colores suaves   │
│ • Botones visibles │           │ • Sin botones      │
│ • Padding amplio   │           │ • Padding reducido │
└────────────────────┘           └────────────────────┘

Se oculta: .no-print (header con botones)
Se optimiza: Márgenes, tamaños de fuente
Se ajusta: Para caber en página A4
```

---

## 🎯 Navegación Visual

### Flujo de Usuario
```
1. HISTORIAL DE VENTAS
┌─────────────────────────────┐
│ Venta 1  │ $100 │ [👁️ Ver]  │ ← Click aquí
│ Venta 2  │ $200 │ [👁️ Ver]  │
│ Venta 3  │ $150 │ [👁️ Ver]  │
└─────────────────────────────┘
          ↓
2. DETALLES DE VENTA
┌─────────────────────────────┐
│ ← Volver | 📋 | 🖨️ Imprimir │
├─────────────────────────────┤
│ [Información Completa]      │
│                             │
│ • Cliente                   │
│ • Vendedor                  │
│ • Productos                 │
│ • Resumen                   │
└─────────────────────────────┘
          ↓
   (Click en Volver)
          ↓
3. DE VUELTA AL HISTORIAL
┌─────────────────────────────┐
│ Venta 1  │ $100 │ [👁️ Ver]  │
│ Venta 2  │ $200 │ [👁️ Ver]  │
│ Venta 3  │ $150 │ [👁️ Ver]  │
└─────────────────────────────┘
```

---

## 📊 Comparación de Vistas

### Tabla Completa (Desktop)
```
┌──────────┬─────────┬────┬──────┬──────┬───────┬──────┐
│ Producto │Presenta │Cant│P.Unit│Costo │Subtot │Margen│
├──────────┼─────────┼────┼──────┼──────┼───────┼──────┤
│ Arroz    │Bolsa 500│ 3  │15.50 │10.20 │ 46.50 │ 34.2%│
│ Azúcar   │Bolsa 1kg│ 2  │20.50 │14.80 │ 41.00 │ 27.8%│
└──────────┴─────────┴────┴──────┴──────┴───────┴──────┘
       ↓ Responsive Móvil ↓
┌──────────┬────┬───────┐
│ Producto │Cant│Subtot │
├──────────┼────┼───────┤
│ Arroz    │ 3  │ 46.50 │
│ Azúcar   │ 2  │ 41.00 │
└──────────┴────┴───────┘
(Se ocultan: Presenta, P.Unit, Costo, Margen)
```

---

## ✅ Checklist Visual

### Elementos Presentes
- [x] ← Botón "Volver al Historial"
- [x] 🖨️ Botón "Imprimir"
- [x] 📋 Título "Detalles de Venta"
- [x] 🏷️ Badge de estado (Completada/Pendiente/Cancelada)
- [x] 👤 Sección de Cliente con ícono
- [x] 👨‍💼 Sección de Vendedor con ícono
- [x] 📦 Tabla de productos con header
- [x] 🏷️ Badge "A Granel" en productos aplicables
- [x] 💰 Resumen Financiero con ícono
- [x] ✅ Checkmark en ganancia positiva
- [x] ⏳ Spinner durante carga
- [x] 🔍 Ícono en "No encontrado"
- [x] ❌ Ícono en errores

### Colores Correctos
- [x] Verde para "Completada" y ganancias
- [x] Amarillo para "Pendiente" y "A Granel"
- [x] Rojo para "Cancelada" y costos
- [x] Azul para totales de venta
- [x] Gradientes en fondos de secciones

---

## 🎨 Tipografía

### Jerarquía de Texto
```
h1 (Título Principal)
├─ 28px, Bold, #1f2937
│
h2 (Títulos de Sección)
├─ 20px, Bold, #1f2937
│
.label (Etiquetas)
├─ 13px, SemiBold, #6b7280, UPPERCASE
│
.value (Valores)
├─ 16px, Medium, #1f2937
│
.value.total (Total Destacado)
├─ 24px, Bold, #059669
│
.badge (Badges)
└─ 13px, Bold, UPPERCASE
```

---

## 🎉 Resultado Final

La página está **lista y completamente funcional** con:

✅ Diseño moderno y profesional  
✅ Información completa y clara  
✅ Cálculos automáticos precisos  
✅ Responsive en todos los dispositivos  
✅ Optimizada para impresión  
✅ Manejo robusto de errores  
✅ Navegación intuitiva  

**URL:** `/sales/{sale_id}/details`

---

**¡Vista previa completada! 🎨**
