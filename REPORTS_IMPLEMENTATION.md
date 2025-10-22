# Implementación de Reportes de Ventas por Periodo

## 📋 Descripción

Se ha implementado un sistema completo de reportes de ventas que permite visualizar métricas por periodo (diario, semanal, mensual) utilizando el endpoint `/reports/sales` del backend.

## ✨ Características Implementadas

### 1. **Tipos de Periodo**
- **Diario**: Reporte del día específico seleccionado
- **Semanal**: Reporte de la semana (lunes a domingo) que contiene la fecha
- **Mensual**: Reporte del mes completo

### 2. **Métricas Principales**
- Ventas totales del periodo
- Ingresos totales
- Ganancia estimada (ingresos - costos)
- Margen de ganancia (porcentaje)
- Valor promedio por venta
- Total de items vendidos

### 3. **Rankings**
- Top 10 productos más vendidos (configurable)
- Top 10 mejores clientes (configurable)

### 4. **Interfaz de Usuario**
- Botones de selección de periodo (Diario/Semanal/Mensual)
- Selector de fecha de referencia
- Tarjetas resumen con las métricas principales
- Lista de productos más vendidos con ranking
- Lista de mejores clientes con ranking
- Funcionalidad de exportación de reportes
- Función de impresión del dashboard

## 🏗️ Arquitectura de la Solución

### 1. **Tipos (types/index.ts)**

```typescript
// Nuevos tipos agregados
export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface PeriodSalesReportRequest {
  period: ReportPeriod;
  reference_date: string;
  top_limit?: number;
}

export interface PeriodSalesReportResponse {
  period: ReportPeriod;
  start_date: Timestamp;
  end_date: Timestamp;
  // Campos planos (no anidados)
  total_sales: number;
  total_revenue: number;
  estimated_profit: number;
  profit_margin: number;
  average_sale_value: number;
  total_items_sold: number;
  top_products: TopProductInReport[];
  top_customers: TopCustomerInReport[];
}
```

### 2. **API Client (api/client.ts)**

Nuevo método agregado:

```typescript
async getPeriodSalesReport(
  request: PeriodSalesReportRequest
): Promise<PeriodSalesReportResponse> {
  return this.request<PeriodSalesReportResponse>('/reports/sales', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
```

### 3. **Store (store/index.ts)**

Estado actualizado:

```typescript
reports: {
  bestSelling: ProductSalesStats[];
  dailySummary: DailySalesSummary[];
  periodReport: PeriodSalesReportResponse | null; // ✅ Nuevo
}
```

Acción agregada:

```typescript
loadPeriodSalesReport: async (request) => {
  // Carga el reporte y actualiza el estado
}
```

### 4. **Hook Custom (hooks/useReports.ts)**

Nuevo método en el hook:

```typescript
const loadPeriodReport = useCallback(async (
  period: ReportPeriod,
  referenceDate: string,
  topLimit: number = 10
) => {
  // Carga el reporte del periodo
}, [loadPeriodSalesReport, addNotification]);
```

### 5. **Componente UI (components/ReportsDashboard/ReportsDashboard.tsx)**

Componente completamente refactorizado:

- **Estado Local**:
  - `selectedDate`: Fecha de referencia para el reporte
  - `reportType`: Tipo de periodo ('daily' | 'weekly' | 'monthly')

- **Efectos**:
  - Carga automática del reporte al cambiar fecha o periodo

- **Funciones**:
  - `formatCurrency()`: Formatea valores en pesos colombianos
  - `formatDate()`: Formatea fechas al español
  - `getPeriodLabel()`: Genera etiqueta descriptiva del periodo
  - `handleExportReport()`: Exporta reporte en JSON

## 🎨 Estilos (ReportsDashboard.css)

### Nuevos Componentes de UI

1. **Botones de Periodo**:
   ```css
   .period-buttons
   .period-btn
   .period-btn.active
   ```

2. **Etiqueta de Periodo**:
   ```css
   .period-label
   .period-icon
   .period-text
   ```

3. **Estado de Carga**:
   ```css
   .loading-state
   .spinner
   ```

## 📊 Flujo de Datos

```
Usuario selecciona periodo/fecha
        ↓
ReportsDashboard actualiza estado local
        ↓
useEffect detecta cambio
        ↓
loadPeriodReport() llamado desde useReports
        ↓
loadPeriodSalesReport() en el store
        ↓
apiClient.getPeriodSalesReport() hace POST a /reports/sales
        ↓
Backend procesa y retorna PeriodSalesReportResponse
        ↓
Store actualiza sales.reports.periodReport
        ↓
Componente se re-renderiza con nuevos datos
```

## 🔄 Ejemplo de Request/Response

### Request a `/reports/sales`

```json
{
  "period": "weekly",
  "reference_date": "2025-10-21",
  "top_limit": 10
}
```

### Response

```json
{
  "period": "daily",
  "start_date": "2025-10-21T00:00:00",
  "end_date": "2025-10-21T23:59:59",
  "total_sales": 45,
  "total_revenue": 2500000,
  "estimated_profit": 625000,
  "profit_margin": 25.0,
  "average_sale_value": 55555.56,
  "total_items_sold": 156,
  "top_products": [
    {
      "presentation_id": "uuid-1",
      "product_name": "Chunky Adulto",
      "presentation_name": "Bulto 25kg",
      "quantity_sold": 30,
      "total_revenue": 750000
    }
  ],
  "top_customers": [
    {
      "customer_id": "uuid-2",
      "customer_name": "Juan Pérez",
      "customer_document": "CC 1234567890",
      "total_purchases": 5,
      "total_spent": 450000
    }
  ]
}
```

**Nota**: El backend devuelve una estructura plana, sin anidar las métricas en un objeto `metrics`.

## 🎯 Buenas Prácticas Aplicadas

1. **Separación de Responsabilidades**:
   - Tipos en `types/index.ts`
   - Lógica de API en `api/client.ts`
   - Estado global en `store/index.ts`
   - Lógica de negocio en `hooks/useReports.ts`
   - UI en componente React

2. **Manejo de Errores**:
   - Try-catch en todas las llamadas async
   - Notificaciones al usuario en caso de error
   - Estados de loading apropiados

3. **TypeScript**:
   - Tipado fuerte en toda la implementación
   - Interfaces claras y descriptivas
   - Type safety en props y estado

4. **UI/UX**:
   - Loading states visuales
   - Empty states informativos
   - Responsive design
   - Formato de moneda localizado (COP)
   - Formato de fechas localizado (es-CO)

5. **Rendimiento**:
   - useCallback para memoización de funciones
   - useEffect con dependencias correctas
   - Prevención de re-renders innecesarios

## 🚀 Uso

```tsx
import { ReportsDashboard } from './components/ReportsDashboard';

function App() {
  return <ReportsDashboard />;
}
```

El componente es completamente autocontenido y maneja su propio estado y lógica de carga de datos.

## 📝 Notas Adicionales

- Los datos se cargan automáticamente al montar el componente
- Los reportes se recargan al cambiar el periodo o la fecha
- El límite de top productos/clientes está configurado en 10 pero es personalizable
- La exportación genera un archivo JSON con todos los datos del reporte
- El componente es completamente responsive
- Incluye soporte para impresión con estilos optimizados

## 🔧 Personalización

Para cambiar el límite de items en los tops:

```typescript
// En ReportsDashboard.tsx, línea del useEffect
loadPeriodReport(reportType, selectedDate, 15); // Cambia 10 por 15
```

Para agregar nuevos periodos, extender el tipo:

```typescript
// En types/index.ts
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
```
