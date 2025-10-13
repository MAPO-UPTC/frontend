# 🔧 Conversión a Granel - Guía Técnica para Desarrolladores

## 📋 Índice
1. [Arquitectura](#arquitectura)
2. [Instalación y Configuración](#instalación)
3. [Uso del Componente](#uso-del-componente)
4. [API Reference](#api-reference)
5. [Ejemplos de Código](#ejemplos)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Extensiones](#extensiones)

---

## 🏗️ Arquitectura

### Diagrama de Componentes
```
┌─────────────────────────────────────────┐
│     InventoryDashboard (Parent)        │
│  - Gestiona lista de productos         │
│  - Maneja estado del modal             │
│  - Actualiza inventario tras conversión│
└────────────┬────────────────────────────┘
             │
             │ onClick("Abrir a Granel")
             ↓
┌─────────────────────────────────────────┐
│    BulkConversionModal (Child)         │
│  - Obtiene lotDetailId automáticamente │
│  - Filtra presentaciones granel        │
│  - Valida y envía conversión           │
│  - Notifica éxito/error al padre       │
└────────────┬────────────────────────────┘
             │
             │ API Calls
             ↓
┌─────────────────────────────────────────┐
│         MAPOAPIClient                   │
│  - openBulkConversion()                │
│  - getAvailableLotDetails()            │
│  - getActiveBulkStock()                │
└─────────────────────────────────────────┘
```

### Flujo de Datos
```typescript
User Click
  ↓
handleOpenBulkConversion(product, presentation)
  ↓
setBulkConversionModal({ isOpen: true, ...data })
  ↓
<BulkConversionModal /> renders
  ↓
useEffect → fetchLotDetailId()
  ↓
apiClient.getAvailableLotDetails(presentationId)
  ↓
setLotDetailId(oldestLot.id)
  ↓
User submits form
  ↓
handleSubmit()
  ↓
apiClient.openBulkConversion(data)
  ↓
onSuccess() → loadProducts()
  ↓
Modal closes, inventory updated
```

---

## 📦 Instalación y Configuración

### 1. Archivos Requeridos

```bash
src/
├── components/
│   ├── BulkConversionModal/
│   │   ├── BulkConversionModal.tsx
│   │   ├── BulkConversionModal.css
│   │   └── index.ts
│   └── InventoryManagement/
│       ├── InventoryDashboard.tsx
│       └── InventoryDashboard.css
├── api/
│   └── client.ts
└── types/
    └── index.ts
```

### 2. Dependencias

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "typescript": "^5.0.0"
  }
}
```

### 3. Configuración TypeScript

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "module": "esnext",
    "target": "es2015",
    "lib": ["es2015", "dom"]
  }
}
```

---

## 🎯 Uso del Componente

### Integración Básica

```typescript
import React, { useState } from 'react';
import { BulkConversionModal } from '../BulkConversionModal';
import { Product, ProductPresentation, UUID } from '../../types';

function MyInventoryComponent() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    presentationId: UUID | null;
    productName: string;
    presentationName: string;
    presentationQuantity: number;
    presentationUnit: string;
    availablePackages: number;
    productId: UUID | null;
  }>({
    isOpen: false,
    presentationId: null,
    productName: '',
    presentationName: '',
    presentationQuantity: 0,
    presentationUnit: '',
    availablePackages: 0,
    productId: null
  });

  const handleOpenModal = (
    product: Product,
    presentation: ProductPresentation
  ) => {
    setModalState({
      isOpen: true,
      presentationId: presentation.id,
      productName: product.name,
      presentationName: presentation.presentation_name,
      presentationQuantity: presentation.quantity,
      presentationUnit: presentation.unit,
      availablePackages: presentation.stock_available || 0,
      productId: product.id
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      presentationId: null,
      productName: '',
      presentationName: '',
      presentationQuantity: 0,
      presentationUnit: '',
      availablePackages: 0,
      productId: null
    });
  };

  const handleSuccess = () => {
    // Recargar inventario
    loadInventory();
    handleCloseModal();
  };

  return (
    <>
      {/* Tu UI aquí */}
      <button onClick={() => handleOpenModal(product, presentation)}>
        📦➡️🌾 Abrir a Granel
      </button>

      {/* Modal */}
      {modalState.isOpen && modalState.presentationId && modalState.productId && (
        <BulkConversionModal
          presentationId={modalState.presentationId}
          productName={modalState.productName}
          presentationName={modalState.presentationName}
          presentationQuantity={modalState.presentationQuantity}
          presentationUnit={modalState.presentationUnit}
          availablePackages={modalState.availablePackages}
          productId={modalState.productId}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
```

### Props del Modal

```typescript
interface BulkConversionModalProps {
  // OPCIONAL: Si proporcionas lotDetailId, se usa directamente
  lotDetailId?: string;
  
  // OPCIONAL: Si proporcionas presentationId, se obtiene lotDetailId automáticamente
  presentationId?: UUID;
  
  // REQUERIDO: Información del producto
  productName: string;              // "Arroz Premium"
  presentationName: string;         // "Bolsa 500g"
  presentationQuantity: number;     // 500
  presentationUnit: string;         // "g"
  availablePackages: number;        // 10
  productId: string;                // UUID del producto
  
  // REQUERIDO: Callbacks
  onClose: () => void;              // Llamado al cerrar modal
  onSuccess: () => void;            // Llamado tras conversión exitosa
}
```

---

## 📡 API Reference

### MAPOAPIClient Methods

#### 1. openBulkConversion()

```typescript
async openBulkConversion(
  data: BulkConversionCreate
): Promise<BulkConversionResponse>
```

**Parameters:**
```typescript
interface BulkConversionCreate {
  source_lot_detail_id: UUID;      // ID del lote a abrir
  target_presentation_id: UUID;    // ID de presentación granel
  quantity: number;                // Cantidad en el paquete (entero)
}
```

**Returns:**
```typescript
interface BulkConversionResponse {
  message: string;                 // Mensaje de éxito
  bulk_conversion_id: UUID;        // ID de la conversión creada
  converted_quantity: number;      // Cantidad convertida
  remaining_bulk: number;          // Cantidad granel restante
  status: string;                  // "ACTIVE" | "COMPLETED" | "CANCELLED"
}
```

**Ejemplo:**
```typescript
const apiClient = new MAPOAPIClient();

try {
  const result = await apiClient.openBulkConversion({
    source_lot_detail_id: 'uuid-del-lote',
    target_presentation_id: 'uuid-presentacion-granel',
    quantity: 500
  });
  
  console.log('Conversión exitosa:', result);
  // {
  //   message: "Conversión a granel creada exitosamente",
  //   bulk_conversion_id: "uuid-...",
  //   converted_quantity: 500,
  //   remaining_bulk: 500,
  //   status: "ACTIVE"
  // }
} catch (error) {
  console.error('Error:', error);
  // Maneja errores 400, 403, 404
}
```

#### 2. getActiveBulkStock()

```typescript
async getActiveBulkStock(): Promise<BulkStockItem[]>
```

**Returns:**
```typescript
interface BulkStockItem {
  bulk_conversion_id: UUID;
  remaining_bulk: number;          // Cantidad restante
  converted_quantity: number;      // Cantidad original convertida
  target_presentation_id: UUID;
  conversion_date: Timestamp;      // ISO 8601
  status: string;                  // "ACTIVE" | "COMPLETED" | "CANCELLED"
}
```

**Ejemplo:**
```typescript
const apiClient = new MAPOAPIClient();

const bulkStock = await apiClient.getActiveBulkStock();
console.log('Stock granel activo:', bulkStock);
// [
//   {
//     bulk_conversion_id: "uuid-...",
//     remaining_bulk: 350,
//     converted_quantity: 500,
//     target_presentation_id: "uuid-...",
//     conversion_date: "2025-06-10T10:30:00Z",
//     status: "ACTIVE"
//   }
// ]
```

#### 3. getAvailableLotDetails()

```typescript
async getAvailableLotDetails(
  presentationId: UUID
): Promise<LotDetail[]>
```

**Parameters:**
- `presentationId`: UUID de la presentación

**Returns:**
```typescript
interface LotDetail {
  id: UUID;
  lot_id: UUID;
  presentation_id: UUID;
  quantity_received: number;
  quantity_available: number;      // Stock disponible
  unit_cost: number;
  expiration_date?: Timestamp;
  production_date?: Timestamp;
  presentation?: ProductPresentation;
}
```

**Ejemplo:**
```typescript
const apiClient = new MAPOAPIClient();

const lots = await apiClient.getAvailableLotDetails('presentation-uuid');

// Filtrar lotes con stock y ordenar por fecha (FIFO)
const availableLots = lots
  .filter(lot => lot.quantity_available > 0)
  .sort((a, b) => {
    const dateA = new Date(a.production_date || a.expiration_date || 0).getTime();
    const dateB = new Date(b.production_date || b.expiration_date || 0).getTime();
    return dateA - dateB;
  });

const oldestLot = availableLots[0];
console.log('Lote más antiguo:', oldestLot);
```

---

## 💻 Ejemplos de Código

### Ejemplo 1: Conversión Manual con lotDetailId

```typescript
import { MAPOAPIClient } from '../api/client';

async function manualBulkConversion() {
  const apiClient = new MAPOAPIClient();

  try {
    // Paso 1: Obtener lotes disponibles
    const lots = await apiClient.getAvailableLotDetails('presentation-uuid');
    
    // Paso 2: Seleccionar lote (FIFO)
    const oldestLot = lots
      .filter(lot => lot.quantity_available > 0)
      .sort((a, b) => 
        new Date(a.production_date || '').getTime() - 
        new Date(b.production_date || '').getTime()
      )[0];

    if (!oldestLot) {
      throw new Error('No hay lotes disponibles');
    }

    // Paso 3: Realizar conversión
    const result = await apiClient.openBulkConversion({
      source_lot_detail_id: oldestLot.id,
      target_presentation_id: 'granel-presentation-uuid',
      quantity: 500
    });

    console.log('✅ Conversión exitosa:', result);
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}
```

### Ejemplo 2: Hook Personalizado

```typescript
import { useState, useCallback } from 'react';
import { MAPOAPIClient } from '../api/client';
import { UUID, BulkConversionCreate } from '../types';

export function useBulkConversion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiClient = new MAPOAPIClient();

  const openBulk = useCallback(async (
    presentationId: UUID,
    targetPresentationId: UUID,
    quantity: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Obtener lote automáticamente
      const lots = await apiClient.getAvailableLotDetails(presentationId);
      const availableLots = lots.filter(lot => lot.quantity_available > 0);

      if (availableLots.length === 0) {
        throw new Error('No hay lotes disponibles');
      }

      // FIFO: Seleccionar más antiguo
      const oldestLot = availableLots.sort((a, b) => 
        new Date(a.production_date || '').getTime() - 
        new Date(b.production_date || '').getTime()
      )[0];

      // Realizar conversión
      const result = await apiClient.openBulkConversion({
        source_lot_detail_id: oldestLot.id,
        target_presentation_id: targetPresentationId,
        quantity: Math.floor(quantity)
      });

      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al abrir bulto');
      setLoading(false);
      throw err;
    }
  }, []);

  return { openBulk, loading, error };
}

// Uso:
function MyComponent() {
  const { openBulk, loading, error } = useBulkConversion();

  const handleOpen = async () => {
    try {
      const result = await openBulk(
        'presentation-uuid',
        'granel-uuid',
        500
      );
      console.log('Éxito:', result);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <>
      <button onClick={handleOpen} disabled={loading}>
        {loading ? 'Abriendo...' : 'Abrir Bulto'}
      </button>
      {error && <div className="error">{error}</div>}
    </>
  );
}
```

### Ejemplo 3: Validaciones Personalizadas

```typescript
function validateBulkConversion(
  availablePackages: number,
  quantity: number,
  targetPresentationId: string
): { valid: boolean; error?: string } {
  // Validar stock disponible
  if (availablePackages < 1) {
    return {
      valid: false,
      error: 'No hay paquetes disponibles para abrir'
    };
  }

  // Validar cantidad
  if (quantity <= 0) {
    return {
      valid: false,
      error: 'La cantidad debe ser mayor a 0'
    };
  }

  if (!Number.isInteger(quantity)) {
    return {
      valid: false,
      error: 'La cantidad debe ser un número entero'
    };
  }

  // Validar presentación destino
  if (!targetPresentationId || targetPresentationId.trim() === '') {
    return {
      valid: false,
      error: 'Debes seleccionar una presentación granel'
    };
  }

  return { valid: true };
}

// Uso:
const validation = validateBulkConversion(10, 500, 'uuid');
if (!validation.valid) {
  console.error(validation.error);
  return;
}
```

### Ejemplo 4: Manejo de Errores Completo

```typescript
async function safeBulkConversion(
  presentationId: UUID,
  targetPresentationId: UUID,
  quantity: number
) {
  const apiClient = new MAPOAPIClient();

  try {
    // Obtener lotes
    const lots = await apiClient.getAvailableLotDetails(presentationId);
    const availableLots = lots.filter(lot => lot.quantity_available > 0);

    if (availableLots.length === 0) {
      return {
        success: false,
        error: 'NO_LOTS_AVAILABLE',
        message: 'No hay lotes disponibles para abrir'
      };
    }

    // Seleccionar lote FIFO
    const oldestLot = availableLots.sort((a, b) => 
      new Date(a.production_date || '').getTime() - 
      new Date(b.production_date || '').getTime()
    )[0];

    // Intentar conversión
    const result = await apiClient.openBulkConversion({
      source_lot_detail_id: oldestLot.id,
      target_presentation_id: targetPresentationId,
      quantity: Math.floor(quantity)
    });

    return {
      success: true,
      data: result
    };

  } catch (error: any) {
    // Manejo específico por código de error
    if (error.status === 400) {
      return {
        success: false,
        error: 'BAD_REQUEST',
        message: 'No hay paquetes disponibles para abrir'
      };
    }

    if (error.status === 403) {
      return {
        success: false,
        error: 'FORBIDDEN',
        message: 'No tienes permisos para realizar esta acción'
      };
    }

    if (error.status === 404) {
      return {
        success: false,
        error: 'NOT_FOUND',
        message: 'No se encontró el lote especificado'
      };
    }

    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: error.message || 'Error desconocido al abrir bulto'
    };
  }
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BulkConversionModal } from './BulkConversionModal';
import { MAPOAPIClient } from '../../api/client';

// Mock del API client
jest.mock('../../api/client');

describe('BulkConversionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    presentationId: 'test-presentation-id',
    productName: 'Arroz Premium',
    presentationName: 'Bolsa 500g',
    presentationQuantity: 500,
    presentationUnit: 'g',
    availablePackages: 10,
    productId: 'test-product-id',
    onClose: mockOnClose,
    onSuccess: mockOnSuccess
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal correctly', () => {
    render(<BulkConversionModal {...defaultProps} />);
    
    expect(screen.getByText('📦➡️🌾 Abrir Bulto para Granel')).toBeInTheDocument();
    expect(screen.getByText('Arroz Premium')).toBeInTheDocument();
    expect(screen.getByText(/Bolsa 500g/)).toBeInTheDocument();
  });

  test('fetches lot details on mount', async () => {
    const mockGetAvailableLotDetails = jest.fn().mockResolvedValue([
      {
        id: 'lot-1',
        quantity_available: 50,
        production_date: '2025-01-01'
      }
    ]);

    (MAPOAPIClient as jest.Mock).mockImplementation(() => ({
      getAvailableLotDetails: mockGetAvailableLotDetails
    }));

    render(<BulkConversionModal {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetAvailableLotDetails).toHaveBeenCalledWith('test-presentation-id');
    });
  });

  test('validates form before submission', async () => {
    render(<BulkConversionModal {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /Abrir Bulto/ });
    fireEvent.click(submitButton);

    // Debería mostrar error si no hay presentación seleccionada
    await waitFor(() => {
      expect(screen.getByText(/selecciona una presentación granel/)).toBeInTheDocument();
    });
  });

  test('calls onSuccess after successful conversion', async () => {
    const mockOpenBulkConversion = jest.fn().mockResolvedValue({
      bulk_conversion_id: 'conversion-1',
      converted_quantity: 500,
      remaining_bulk: 500,
      status: 'ACTIVE'
    });

    (MAPOAPIClient as jest.Mock).mockImplementation(() => ({
      getAvailableLotDetails: jest.fn().mockResolvedValue([
        { id: 'lot-1', quantity_available: 50 }
      ]),
      openBulkConversion: mockOpenBulkConversion,
      getProductById: jest.fn().mockResolvedValue({
        presentations: [
          { id: 'granel-1', presentation_name: 'Granel (gramos)', unit: 'g' }
        ]
      })
    }));

    render(<BulkConversionModal {...defaultProps} />);

    // Esperar a que cargue
    await waitFor(() => {
      expect(screen.queryByText(/Obteniendo información/)).not.toBeInTheDocument();
    });

    // Seleccionar presentación y enviar
    const submitButton = screen.getByRole('button', { name: /Abrir Bulto/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOpenBulkConversion).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
```

### Integration Tests

```typescript
describe('Bulk Conversion Flow', () => {
  test('complete conversion flow', async () => {
    // 1. Renderizar dashboard
    render(<InventoryDashboard />);

    // 2. Buscar producto
    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    fireEvent.change(searchInput, { target: { value: 'Arroz' } });

    // 3. Click en "Abrir a Granel"
    const openButton = await screen.findByRole('button', { name: /Abrir a Granel/ });
    fireEvent.click(openButton);

    // 4. Verificar que modal se abre
    expect(screen.getByText('📦➡️🌾 Abrir Bulto para Granel')).toBeInTheDocument();

    // 5. Seleccionar presentación granel
    const presentationSelect = screen.getByLabelText('Presentación Granel');
    fireEvent.change(presentationSelect, { target: { value: 'granel-uuid' } });

    // 6. Enviar formulario
    const submitButton = screen.getByRole('button', { name: /Abrir Bulto/ });
    fireEvent.click(submitButton);

    // 7. Verificar éxito
    await waitFor(() => {
      expect(screen.getByText(/Bulto abierto exitosamente/)).toBeInTheDocument();
    });

    // 8. Verificar que inventario se actualiza
    await waitFor(() => {
      expect(screen.getByText(/Granel: 500g/)).toBeInTheDocument();
    });
  });
});
```

---

## 🐛 Debugging

### Habilitar Logs de Desarrollo

```typescript
// En BulkConversionModal.tsx
const DEBUG = process.env.NODE_ENV === 'development';

const fetchLotDetailId = async () => {
  if (DEBUG) console.log('[DEBUG] Fetching lot details for:', presentationId);
  
  try {
    const lotDetails = await apiClient.getAvailableLotDetails(presentationId!);
    
    if (DEBUG) {
      console.log('[DEBUG] Lot details received:', lotDetails);
      console.log('[DEBUG] Available lots:', lotDetails.filter(l => l.quantity_available > 0));
    }
    
    // ... resto del código
  } catch (err) {
    if (DEBUG) console.error('[DEBUG] Error fetching lot details:', err);
  }
};
```

### Herramientas de Debugging

```typescript
// Componente de desarrollo para probar conversiones
function BulkConversionDebugger() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const testConversion = async () => {
    addLog('Iniciando conversión de prueba');
    
    try {
      addLog('Obteniendo lotes...');
      const lots = await apiClient.getAvailableLotDetails('test-id');
      addLog(`Lotes obtenidos: ${lots.length}`);
      
      addLog('Abriendo bulto...');
      const result = await apiClient.openBulkConversion({
        source_lot_detail_id: lots[0].id,
        target_presentation_id: 'granel-id',
        quantity: 500
      });
      addLog(`Éxito: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  return (
    <div>
      <button onClick={testConversion}>Test Conversion</button>
      <pre>{logs.join('\n')}</pre>
    </div>
  );
}
```

---

## 🔧 Extensiones

### Extensión 1: Conversión Múltiple

```typescript
interface MultipleBulkConversionProps {
  presentations: ProductPresentation[];
  productId: UUID;
  onSuccess: () => void;
}

function MultipleBulkConversion({ 
  presentations, 
  productId, 
  onSuccess 
}: MultipleBulkConversionProps) {
  const [selectedPresentations, setSelectedPresentations] = useState<UUID[]>([]);

  const handleOpenMultiple = async () => {
    const apiClient = new MAPOAPIClient();
    const results = [];

    for (const presentationId of selectedPresentations) {
      try {
        const lots = await apiClient.getAvailableLotDetails(presentationId);
        const oldestLot = lots.filter(l => l.quantity_available > 0)[0];

        const result = await apiClient.openBulkConversion({
          source_lot_detail_id: oldestLot.id,
          target_presentation_id: 'granel-id',
          quantity: 500
        });

        results.push({ presentationId, success: true, result });
      } catch (error) {
        results.push({ presentationId, success: false, error });
      }
    }

    onSuccess();
    return results;
  };

  return (
    <div>
      {presentations.map(pres => (
        <label key={pres.id}>
          <input
            type="checkbox"
            checked={selectedPresentations.includes(pres.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedPresentations([...selectedPresentations, pres.id]);
              } else {
                setSelectedPresentations(
                  selectedPresentations.filter(id => id !== pres.id)
                );
              }
            }}
          />
          {pres.presentation_name} - {pres.stock_available} disponibles
        </label>
      ))}
      <button onClick={handleOpenMultiple}>
        Abrir {selectedPresentations.length} Bultos
      </button>
    </div>
  );
}
```

### Extensión 2: Historial de Conversiones

```typescript
interface ConversionHistory {
  id: UUID;
  product_name: string;
  presentation_name: string;
  quantity: number;
  converted_at: Timestamp;
  user: string;
}

function BulkConversionHistory() {
  const [history, setHistory] = useState<ConversionHistory[]>([]);

  useEffect(() => {
    // Cargar historial desde API
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const apiClient = new MAPOAPIClient();
    const bulkStock = await apiClient.getActiveBulkStock();
    
    // Transformar a formato de historial
    const historyData = bulkStock.map(item => ({
      id: item.bulk_conversion_id,
      product_name: 'Arroz Premium', // Obtener de API
      presentation_name: 'Bolsa 500g',
      quantity: item.converted_quantity,
      converted_at: item.conversion_date,
      user: 'Usuario'
    }));

    setHistory(historyData);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Presentación</th>
          <th>Cantidad</th>
          <th>Fecha</th>
          <th>Usuario</th>
        </tr>
      </thead>
      <tbody>
        {history.map(item => (
          <tr key={item.id}>
            <td>{item.product_name}</td>
            <td>{item.presentation_name}</td>
            <td>{item.quantity}</td>
            <td>{new Date(item.converted_at).toLocaleString()}</td>
            <td>{item.user}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 📚 Referencias

### Documentación Relacionada:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Recursos Internos:
- `CONVERSION_GRANEL_IMPLEMENTADO.md` - Documentación completa
- `CONVERSION_GRANEL_GUIA_RAPIDA.md` - Guía rápida de usuario

---

**Versión:** 1.0  
**Última actualización:** Enero 2025  
**Autor:** Equipo de Desarrollo MAPO
