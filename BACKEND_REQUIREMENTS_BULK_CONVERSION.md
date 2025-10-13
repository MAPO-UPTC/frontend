# Requerimientos Backend - Conversión a Granel
## Endpoint Necesario para Implementar la Funcionalidad

---

## 📋 Resumen Ejecutivo

**Estado Actual**: El frontend está 100% implementado y funcional, pero requiere un nuevo endpoint en el backend para completar la funcionalidad de conversión de productos empaquetados a granel.

**Endpoint Requerido**: `GET /api/v1/inventory/presentations/{presentation_id}/lot-details`

**Prioridad**: 🔴 **ALTA** - La funcionalidad está bloqueada sin este endpoint

**Tiempo Estimado de Implementación**: 2-4 horas

---

## 🎯 Objetivo

Permitir que el frontend obtenga automáticamente el lote más antiguo disponible (FIFO) de una presentación específica para realizar la conversión a granel.

---

## 📡 Especificación del Endpoint

### **Método HTTP**: `GET`

### **URL**: `/api/v1/inventory/presentations/{presentation_id}/lot-details`

### **Descripción**: 
Retorna la lista de detalles de lotes disponibles para una presentación específica, ordenados por fecha de producción (FIFO) y filtrados por disponibilidad.

---

## 🔐 Autenticación y Permisos

### Autenticación:
```
Authorization: Bearer {token}
```

### Permisos Requeridos:
- `PRODUCTS:READ` o `PRODUCTS:UPDATE`
- Usuario debe tener acceso al módulo de inventario

---

## 📥 Request

### Path Parameters:

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `presentation_id` | UUID | ✅ Sí | ID de la presentación empaquetada |

### Query Parameters:

| Parámetro | Tipo | Requerido | Descripción | Default |
|-----------|------|-----------|-------------|---------|
| `available_only` | boolean | ❌ No | Filtrar solo lotes con cantidad disponible > 0 | `true` |
| `sort_by` | string | ❌ No | Campo para ordenar (`production_date`, `expiration_date`) | `production_date` |
| `order` | string | ❌ No | Orden de clasificación (`asc`, `desc`) | `asc` |

### Ejemplo de Request:

```http
GET /api/v1/inventory/presentations/550e8400-e29b-41d4-a716-446655440000/lot-details?available_only=true&sort_by=production_date&order=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📤 Response

### Success Response (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "lot_id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
      "lot_number": "LOT-2024-001",
      "presentation_id": "550e8400-e29b-41d4-a716-446655440000",
      "presentation_name": "Concentrado Premium 20kg",
      "product_id": "c3d4e5f6-g7h8-9012-cdef-123456789012",
      "product_name": "Concentrado Premium",
      "initial_quantity": 100,
      "quantity_available": 85,
      "quantity_sold": 15,
      "quantity_damaged": 0,
      "unit_cost": 45000.00,
      "production_date": "2024-01-15",
      "expiration_date": "2025-01-15",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-10-13T14:20:00Z"
    },
    {
      "id": "d5e6f7g8-h9i0-1234-defg-234567890123",
      "lot_id": "e6f7g8h9-i0j1-2345-efgh-345678901234",
      "lot_number": "LOT-2024-002",
      "presentation_id": "550e8400-e29b-41d4-a716-446655440000",
      "presentation_name": "Concentrado Premium 20kg",
      "product_id": "c3d4e5f6-g7h8-9012-cdef-123456789012",
      "product_name": "Concentrado Premium",
      "initial_quantity": 120,
      "quantity_available": 120,
      "quantity_sold": 0,
      "quantity_damaged": 0,
      "unit_cost": 46000.00,
      "production_date": "2024-02-10",
      "expiration_date": "2025-02-10",
      "status": "active",
      "created_at": "2024-02-10T09:15:00Z",
      "updated_at": "2024-02-10T09:15:00Z"
    }
  ],
  "count": 2,
  "metadata": {
    "presentation_id": "550e8400-e29b-41d4-a716-446655440000",
    "total_available_quantity": 205,
    "oldest_lot_date": "2024-01-15",
    "newest_lot_date": "2024-02-10"
  }
}
```

### Campos del Objeto LotDetail:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | UUID | ✅ | ID único del detalle de lote |
| `lot_id` | UUID | ✅ | ID del lote padre |
| `lot_number` | string | ✅ | Número de lote legible |
| `presentation_id` | UUID | ✅ | ID de la presentación |
| `presentation_name` | string | ✅ | Nombre de la presentación |
| `product_id` | UUID | ✅ | ID del producto |
| `product_name` | string | ✅ | Nombre del producto |
| `initial_quantity` | integer | ✅ | Cantidad inicial del lote |
| `quantity_available` | integer | ✅ | Cantidad disponible actual |
| `quantity_sold` | integer | ✅ | Cantidad vendida |
| `quantity_damaged` | integer | ✅ | Cantidad dañada/pérdida |
| `unit_cost` | decimal | ✅ | Costo unitario |
| `production_date` | date | ✅ | Fecha de producción (formato: YYYY-MM-DD) |
| `expiration_date` | date | ✅ | Fecha de vencimiento (formato: YYYY-MM-DD) |
| `status` | string | ✅ | Estado del lote (`active`, `depleted`, `expired`) |
| `created_at` | datetime | ✅ | Fecha de creación |
| `updated_at` | datetime | ✅ | Fecha de última actualización |

---

## ❌ Error Responses

### 400 Bad Request - ID Inválido:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_UUID",
    "message": "El ID de presentación proporcionado no es un UUID válido",
    "details": {
      "presentation_id": "invalid-id-format"
    }
  }
}
```

### 401 Unauthorized - Sin Autenticación:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Se requiere autenticación para acceder a este recurso",
    "details": {
      "required": "Bearer token"
    }
  }
}
```

### 403 Forbidden - Sin Permisos:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos suficientes para acceder a este recurso",
    "details": {
      "required_permissions": ["PRODUCTS:READ", "PRODUCTS:UPDATE"]
    }
  }
}
```

### 404 Not Found - Presentación No Existe:

```json
{
  "success": false,
  "error": {
    "code": "PRESENTATION_NOT_FOUND",
    "message": "No se encontró ninguna presentación con el ID proporcionado",
    "details": {
      "presentation_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

### 404 Not Found - Sin Lotes Disponibles:

```json
{
  "success": false,
  "error": {
    "code": "NO_LOTS_AVAILABLE",
    "message": "No hay lotes disponibles para esta presentación",
    "details": {
      "presentation_id": "550e8400-e29b-41d4-a716-446655440000",
      "available_only": true
    }
  }
}
```

### 500 Internal Server Error:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud",
    "details": {
      "timestamp": "2024-10-13T14:30:00Z",
      "request_id": "req_abc123xyz"
    }
  }
}
```

---

## 🔧 Lógica de Negocio Requerida

### 1. **Validación de Entrada**:
```python
def validate_presentation_id(presentation_id: str) -> UUID:
    """
    Validar que el ID sea un UUID válido
    Raise: ValidationError si no es válido
    """
    try:
        return UUID(presentation_id)
    except ValueError:
        raise ValidationError("Invalid UUID format")
```

### 2. **Filtrado de Lotes**:
```python
def get_available_lot_details(presentation_id: UUID, available_only: bool = True) -> List[LotDetail]:
    """
    Obtener lotes filtrados por:
    - presentation_id coincide
    - quantity_available > 0 (si available_only=True)
    - status = 'active'
    - expiration_date > TODAY (no vencidos)
    """
    query = LotDetail.objects.filter(
        presentation_id=presentation_id,
        status='active',
        expiration_date__gt=timezone.now().date()
    )
    
    if available_only:
        query = query.filter(quantity_available__gt=0)
    
    return query
```

### 3. **Ordenamiento FIFO**:
```python
def apply_fifo_sorting(lot_details: QuerySet) -> QuerySet:
    """
    Ordenar por fecha de producción ascendente (más antiguo primero)
    Esto implementa la lógica FIFO (First In, First Out)
    """
    return lot_details.order_by('production_date', 'created_at')
```

### 4. **Cálculo de Metadata**:
```python
def calculate_metadata(lot_details: List[LotDetail], presentation_id: UUID) -> dict:
    """
    Calcular información agregada sobre los lotes
    """
    return {
        'presentation_id': str(presentation_id),
        'total_available_quantity': sum(ld.quantity_available for ld in lot_details),
        'oldest_lot_date': min(ld.production_date for ld in lot_details) if lot_details else None,
        'newest_lot_date': max(ld.production_date for ld in lot_details) if lot_details else None
    }
```

---

## 🗄️ Modelo de Base de Datos

### Tabla: `lot_details`

Asegurarse de que existe y tiene la siguiente estructura:

```sql
CREATE TABLE lot_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
    initial_quantity INTEGER NOT NULL CHECK (initial_quantity >= 0),
    quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
    quantity_sold INTEGER NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
    quantity_damaged INTEGER NOT NULL DEFAULT 0 CHECK (quantity_damaged >= 0),
    unit_cost DECIMAL(10, 2) NOT NULL CHECK (unit_cost >= 0),
    production_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'depleted', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_dates CHECK (expiration_date > production_date),
    CONSTRAINT valid_quantities CHECK (
        quantity_available + quantity_sold + quantity_damaged <= initial_quantity
    )
);

-- Índices para optimizar consultas
CREATE INDEX idx_lot_details_presentation ON lot_details(presentation_id);
CREATE INDEX idx_lot_details_lot ON lot_details(lot_id);
CREATE INDEX idx_lot_details_production_date ON lot_details(production_date);
CREATE INDEX idx_lot_details_status ON lot_details(status);
CREATE INDEX idx_lot_details_available ON lot_details(quantity_available) WHERE quantity_available > 0;
```

---

## 🧪 Casos de Prueba

### Test 1: Obtener lotes disponibles con éxito

**Precondiciones**:
- Existe una presentación con ID `550e8400-e29b-41d4-a716-446655440000`
- Existen 2 lotes con cantidad disponible > 0
- Usuario tiene permisos `PRODUCTS:READ`

**Request**:
```http
GET /api/v1/inventory/presentations/550e8400-e29b-41d4-a716-446655440000/lot-details
Authorization: Bearer {valid_token}
```

**Expected Response**:
- Status: `200 OK`
- Body: Array con 2 objetos LotDetail
- Ordenados por `production_date` ASC
- `quantity_available > 0` en todos los elementos

---

### Test 2: Presentación sin lotes disponibles

**Precondiciones**:
- Existe una presentación con ID `660e8400-e29b-41d4-a716-446655440001`
- No hay lotes con `quantity_available > 0`

**Request**:
```http
GET /api/v1/inventory/presentations/660e8400-e29b-41d4-a716-446655440001/lot-details
Authorization: Bearer {valid_token}
```

**Expected Response**:
- Status: `404 Not Found`
- Body: Error `NO_LOTS_AVAILABLE`

---

### Test 3: Presentación no existe

**Precondiciones**:
- No existe ninguna presentación con el ID proporcionado

**Request**:
```http
GET /api/v1/inventory/presentations/999e8400-e29b-41d4-a716-446655440999/lot-details
Authorization: Bearer {valid_token}
```

**Expected Response**:
- Status: `404 Not Found`
- Body: Error `PRESENTATION_NOT_FOUND`

---

### Test 4: UUID inválido

**Request**:
```http
GET /api/v1/inventory/presentations/invalid-uuid-format/lot-details
Authorization: Bearer {valid_token}
```

**Expected Response**:
- Status: `400 Bad Request`
- Body: Error `INVALID_UUID`

---

### Test 5: Sin autenticación

**Request**:
```http
GET /api/v1/inventory/presentations/550e8400-e29b-41d4-a716-446655440000/lot-details
```

**Expected Response**:
- Status: `401 Unauthorized`
- Body: Error `UNAUTHORIZED`

---

### Test 6: Sin permisos suficientes

**Precondiciones**:
- Usuario autenticado pero sin permiso `PRODUCTS:READ` o `PRODUCTS:UPDATE`

**Request**:
```http
GET /api/v1/inventory/presentations/550e8400-e29b-41d4-a716-446655440000/lot-details
Authorization: Bearer {valid_token_without_permissions}
```

**Expected Response**:
- Status: `403 Forbidden`
- Body: Error `FORBIDDEN`

---

### Test 7: Verificar ordenamiento FIFO

**Precondiciones**:
- Existen 3 lotes con fechas de producción:
  - Lote A: `2024-03-01`
  - Lote B: `2024-01-15`
  - Lote C: `2024-02-10`

**Request**:
```http
GET /api/v1/inventory/presentations/550e8400-e29b-41d4-a716-446655440000/lot-details
Authorization: Bearer {valid_token}
```

**Expected Response**:
- Status: `200 OK`
- Body: Array ordenado por fecha de producción:
  1. Lote B (`2024-01-15`) - MÁS ANTIGUO PRIMERO
  2. Lote C (`2024-02-10`)
  3. Lote A (`2024-03-01`)

---

### Test 8: Excluir lotes vencidos

**Precondiciones**:
- Lote A: `expiration_date = 2024-09-01` (VENCIDO)
- Lote B: `expiration_date = 2025-06-01` (VÁLIDO)

**Request**:
```http
GET /api/v1/inventory/presentations/550e8400-e29b-41d4-a716-446655440000/lot-details
Authorization: Bearer {valid_token}
```

**Expected Response**:
- Status: `200 OK`
- Body: Array con solo Lote B
- Lote A no debe aparecer (está vencido)

---

## 📊 Diagramas

### Diagrama de Flujo del Endpoint:

```
┌─────────────────────────────────────────────────────────────┐
│                     START: GET Request                       │
│            /presentations/{id}/lot-details                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Validar JWT Token     │
              │  ¿Token válido?        │
              └────────┬───────────────┘
                       │
           ┌───────────┴───────────┐
           │ NO                    │ SÍ
           ▼                       ▼
    ┌─────────────┐      ┌─────────────────┐
    │ 401         │      │ Validar UUID    │
    │ UNAUTHORIZED│      │ presentation_id │
    └─────────────┘      └────────┬────────┘
                                  │
                      ┌───────────┴───────────┐
                      │ NO                    │ SÍ
                      ▼                       ▼
               ┌─────────────┐     ┌──────────────────┐
               │ 400         │     │ Verificar        │
               │ INVALID_UUID│     │ Permisos Usuario │
               └─────────────┘     └────────┬─────────┘
                                            │
                                ┌───────────┴───────────┐
                                │ NO                    │ SÍ
                                ▼                       ▼
                         ┌─────────────┐     ┌─────────────────────┐
                         │ 403         │     │ Buscar Presentación │
                         │ FORBIDDEN   │     │ en BD               │
                         └─────────────┘     └────────┬────────────┘
                                                      │
                                          ┌───────────┴───────────┐
                                          │ NO                    │ SÍ
                                          ▼                       ▼
                                   ┌──────────────┐    ┌─────────────────────┐
                                   │ 404          │    │ Obtener LotDetails  │
                                   │ PRESENTATION │    │ WHERE:              │
                                   │ _NOT_FOUND   │    │ - presentation_id   │
                                   └──────────────┘    │ - quantity > 0      │
                                                       │ - status = active   │
                                                       │ - no vencidos       │
                                                       └────────┬────────────┘
                                                                │
                                                    ┌───────────┴───────────┐
                                                    │ ¿Lotes encontrados?   │
                                                    └───────────┬───────────┘
                                                                │
                                                    ┌───────────┴───────────┐
                                                    │ NO                    │ SÍ
                                                    ▼                       ▼
                                             ┌──────────────┐    ┌─────────────────────┐
                                             │ 404          │    │ Ordenar por         │
                                             │ NO_LOTS      │    │ production_date ASC │
                                             │ _AVAILABLE   │    │ (FIFO)              │
                                             └──────────────┘    └────────┬────────────┘
                                                                          │
                                                                          ▼
                                                               ┌─────────────────────┐
                                                               │ Calcular Metadata:  │
                                                               │ - total_quantity    │
                                                               │ - oldest_date       │
                                                               │ - newest_date       │
                                                               └────────┬────────────┘
                                                                        │
                                                                        ▼
                                                             ┌─────────────────────┐
                                                             │ Serializar Respuesta│
                                                             │ JSON                │
                                                             └────────┬────────────┘
                                                                      │
                                                                      ▼
                                                           ┌─────────────────────┐
                                                           │ 200 OK              │
                                                           │ Return JSON         │
                                                           │ {success, data,     │
                                                           │  count, metadata}   │
                                                           └─────────────────────┘
```

---

## 🔄 Integración con el Frontend

### Uso desde el Frontend:

El frontend ya tiene implementado el llamado a este endpoint:

```typescript
// En src/api/client.ts
async getAvailableLotDetails(presentationId: UUID): Promise<LotDetail[]> {
  return this.request<LotDetail[]>(
    `/api/v1/inventory/presentations/${presentationId}/lot-details`
  );
}

// En src/components/BulkConversionModal/BulkConversionModal.tsx
const fetchLotDetailId = async () => {
  try {
    const lotDetails = await apiClient.getAvailableLotDetails(presentationId);
    
    if (lotDetails.length === 0) {
      setError('No hay lotes disponibles para esta presentación');
      return;
    }

    // El frontend toma el PRIMER elemento (más antiguo por FIFO)
    const oldestLot = lotDetails[0];
    setLotDetailId(oldestLot.id);
    
  } catch (err) {
    console.error('Error al obtener lote:', err);
    setError('No se pudo obtener el lote disponible');
  }
};
```

### Flujo Completo:

1. Usuario selecciona una presentación empaquetada
2. Hace clic en "Abrir a Granel"
3. **Frontend llama** → `GET /api/v1/inventory/presentations/{id}/lot-details`
4. **Backend retorna** → Lista de lotes ordenados por FIFO
5. **Frontend toma** → Primer elemento (lote más antiguo)
6. **Frontend llama** → `POST /products/open-bulk/` con el `lot_detail_id`
7. **Backend procesa** → Conversión a granel
8. **Frontend muestra** → Confirmación de éxito

---

## 📝 Checklist de Implementación

### Backend Developer Checklist:

- [ ] **1. Crear el endpoint en el router**
  - [ ] Agregar ruta `GET /api/v1/inventory/presentations/{presentation_id}/lot-details`
  - [ ] Vincular a la función/controlador correspondiente

- [ ] **2. Implementar la lógica del controlador**
  - [ ] Validar JWT token
  - [ ] Validar permisos del usuario
  - [ ] Validar formato de UUID del `presentation_id`
  - [ ] Verificar que la presentación existe
  - [ ] Obtener lot_details filtrados
  - [ ] Aplicar ordenamiento FIFO
  - [ ] Calcular metadata
  - [ ] Serializar respuesta JSON

- [ ] **3. Implementar validaciones**
  - [ ] Validación de UUID
  - [ ] Validación de permisos
  - [ ] Validación de existencia de presentación
  - [ ] Manejo de query parameters opcionales

- [ ] **4. Implementar filtros de BD**
  - [ ] Filtrar por `presentation_id`
  - [ ] Filtrar por `quantity_available > 0`
  - [ ] Filtrar por `status = 'active'`
  - [ ] Filtrar por `expiration_date > TODAY`
  - [ ] Ordenar por `production_date ASC`

- [ ] **5. Implementar manejo de errores**
  - [ ] Error 400: UUID inválido
  - [ ] Error 401: Sin autenticación
  - [ ] Error 403: Sin permisos
  - [ ] Error 404: Presentación no encontrada
  - [ ] Error 404: Sin lotes disponibles
  - [ ] Error 500: Error interno del servidor

- [ ] **6. Escribir tests unitarios**
  - [ ] Test: Obtener lotes exitosamente
  - [ ] Test: Presentación sin lotes
  - [ ] Test: Presentación no existe
  - [ ] Test: UUID inválido
  - [ ] Test: Sin autenticación
  - [ ] Test: Sin permisos
  - [ ] Test: Ordenamiento FIFO correcto
  - [ ] Test: Excluir lotes vencidos

- [ ] **7. Escribir tests de integración**
  - [ ] Test: Flujo completo desde frontend
  - [ ] Test: Verificar respuesta JSON correcta
  - [ ] Test: Verificar metadata calculada correctamente

- [ ] **8. Optimización y performance**
  - [ ] Verificar índices en base de datos
  - [ ] Optimizar queries (evitar N+1)
  - [ ] Implementar paginación si es necesario
  - [ ] Implementar caché si es necesario

- [ ] **9. Documentación**
  - [ ] Documentar endpoint en Swagger/OpenAPI
  - [ ] Actualizar README del backend
  - [ ] Documentar ejemplos de uso
  - [ ] Documentar códigos de error

- [ ] **10. Deploy y testing**
  - [ ] Hacer merge a branch de desarrollo
  - [ ] Probar en ambiente de desarrollo
  - [ ] Coordinar con frontend para testing integrado
  - [ ] Hacer deploy a producción
  - [ ] Verificar funcionamiento en producción

---

## 🚀 Ejemplo de Implementación (Python/Django)

### views.py:

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from uuid import UUID
from .models import Presentation, LotDetail
from .serializers import LotDetailSerializer
from .permissions import HasProductPermission

@api_view(['GET'])
@permission_classes([IsAuthenticated, HasProductPermission])
def get_presentation_lot_details(request, presentation_id):
    """
    Obtener detalles de lotes disponibles para una presentación específica.
    Ordenados por FIFO (First In, First Out).
    """
    
    # 1. Validar UUID
    try:
        presentation_uuid = UUID(presentation_id)
    except ValueError:
        return Response({
            'success': False,
            'error': {
                'code': 'INVALID_UUID',
                'message': 'El ID de presentación proporcionado no es un UUID válido',
                'details': {'presentation_id': presentation_id}
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 2. Verificar que la presentación existe
    try:
        presentation = Presentation.objects.get(id=presentation_uuid)
    except Presentation.DoesNotExist:
        return Response({
            'success': False,
            'error': {
                'code': 'PRESENTATION_NOT_FOUND',
                'message': 'No se encontró ninguna presentación con el ID proporcionado',
                'details': {'presentation_id': presentation_id}
            }
        }, status=status.HTTP_404_NOT_FOUND)
    
    # 3. Obtener query parameters
    available_only = request.GET.get('available_only', 'true').lower() == 'true'
    sort_by = request.GET.get('sort_by', 'production_date')
    order = request.GET.get('order', 'asc')
    
    # 4. Construir query de lot_details
    lot_details = LotDetail.objects.filter(
        presentation_id=presentation_uuid,
        status='active',
        expiration_date__gt=timezone.now().date()
    ).select_related('lot', 'presentation', 'presentation__product')
    
    # 5. Aplicar filtro de disponibilidad
    if available_only:
        lot_details = lot_details.filter(quantity_available__gt=0)
    
    # 6. Aplicar ordenamiento FIFO
    order_prefix = '' if order == 'asc' else '-'
    lot_details = lot_details.order_by(f'{order_prefix}{sort_by}', 'created_at')
    
    # 7. Verificar que hay lotes disponibles
    if not lot_details.exists():
        return Response({
            'success': False,
            'error': {
                'code': 'NO_LOTS_AVAILABLE',
                'message': 'No hay lotes disponibles para esta presentación',
                'details': {
                    'presentation_id': presentation_id,
                    'available_only': available_only
                }
            }
        }, status=status.HTTP_404_NOT_FOUND)
    
    # 8. Serializar datos
    serializer = LotDetailSerializer(lot_details, many=True)
    
    # 9. Calcular metadata
    lot_details_list = list(lot_details)
    metadata = {
        'presentation_id': presentation_id,
        'total_available_quantity': sum(ld.quantity_available for ld in lot_details_list),
        'oldest_lot_date': str(min(ld.production_date for ld in lot_details_list)),
        'newest_lot_date': str(max(ld.production_date for ld in lot_details_list))
    }
    
    # 10. Retornar respuesta exitosa
    return Response({
        'success': True,
        'data': serializer.data,
        'count': len(serializer.data),
        'metadata': metadata
    }, status=status.HTTP_200_OK)
```

### urls.py:

```python
from django.urls import path
from .views import get_presentation_lot_details

urlpatterns = [
    path(
        'api/v1/inventory/presentations/<uuid:presentation_id>/lot-details',
        get_presentation_lot_details,
        name='get_presentation_lot_details'
    ),
]
```

### serializers.py:

```python
from rest_framework import serializers
from .models import LotDetail

class LotDetailSerializer(serializers.ModelSerializer):
    lot_number = serializers.CharField(source='lot.lot_number', read_only=True)
    presentation_name = serializers.CharField(source='presentation.name', read_only=True)
    product_id = serializers.UUIDField(source='presentation.product.id', read_only=True)
    product_name = serializers.CharField(source='presentation.product.name', read_only=True)
    
    class Meta:
        model = LotDetail
        fields = [
            'id',
            'lot_id',
            'lot_number',
            'presentation_id',
            'presentation_name',
            'product_id',
            'product_name',
            'initial_quantity',
            'quantity_available',
            'quantity_sold',
            'quantity_damaged',
            'unit_cost',
            'production_date',
            'expiration_date',
            'status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
```

---

## 🔍 Verificación de Integración

### Cómo Verificar que la Implementación Funciona:

1. **Desde Postman/Thunder Client**:
   ```http
   GET http://142.93.187.32:8000/api/v1/inventory/presentations/{presentation_id}/lot-details
   Authorization: Bearer {token}
   ```
   
   Debe retornar status `200` con array de lot_details

2. **Desde el Frontend**:
   - Ir a Inventario
   - Seleccionar una presentación empaquetada
   - Hacer clic en "📦➡️🌾 Abrir a Granel"
   - El modal debe abrir correctamente
   - El error "No se pudo obtener el lote disponible" **NO debe aparecer**
   - Los campos deben llenarse automáticamente

3. **Verificar logs del backend**:
   - Debe mostrar la petición GET
   - Debe mostrar status 200
   - No debe haber errores en consola

---

## ⏱️ Tiempo Estimado de Implementación

| Tarea | Tiempo Estimado |
|-------|-----------------|
| Crear endpoint y routing | 15 min |
| Implementar lógica del controlador | 45 min |
| Implementar validaciones | 30 min |
| Implementar serializers | 20 min |
| Escribir tests unitarios | 60 min |
| Escribir tests de integración | 30 min |
| Documentación Swagger | 20 min |
| Testing manual | 20 min |
| **TOTAL** | **~4 horas** |

---

## 📞 Contacto y Coordinación

### Puntos de Contacto:

- **Frontend Team**: Implementación 100% completa, esperando este endpoint
- **Backend Team**: Implementar este endpoint según especificación
- **Testing**: Coordinar pruebas integradas después de implementación

### Siguiente Paso:

1. Backend implementa endpoint según esta especificación
2. Backend notifica a Frontend cuando esté listo
3. Frontend y Backend hacen testing integrado
4. Deploy a producción de ambos lados

---

## ✅ Criterios de Aceptación

La implementación será considerada exitosa cuando:

- ✅ El endpoint retorna `200 OK` con datos válidos para presentaciones con lotes disponibles
- ✅ El endpoint retorna `404 NOT_FOUND` para presentaciones sin lotes
- ✅ Los lotes están ordenados por `production_date` ASC (FIFO)
- ✅ Solo retorna lotes con `quantity_available > 0` y no vencidos
- ✅ La estructura JSON coincide exactamente con la especificación
- ✅ Todos los tests pasan exitosamente
- ✅ El frontend puede abrir el modal sin errores
- ✅ El flujo completo de conversión a granel funciona end-to-end

---

## 📚 Referencias

- Frontend Implementation: `src/components/BulkConversionModal/BulkConversionModal.tsx`
- API Client: `src/api/client.ts`
- Types: `src/types/index.ts`
- Documentation: `CONVERSION_GRANEL_*.md`

---

**Documento generado el**: 13 de Octubre, 2024  
**Versión**: 1.0  
**Estado**: ✅ Ready for Backend Implementation  
**Prioridad**: 🔴 ALTA - Feature bloqueada sin este endpoint

---

