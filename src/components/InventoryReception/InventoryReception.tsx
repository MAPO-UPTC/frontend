import React, { useState, useEffect } from 'react';
import './InventoryReception.css';
import { apiClient } from '../../api/client';
import {
  Supplier,
  SupplierCreate,
  InventoryLotCreate,
  InventoryLotDetailCreate,
  InventoryLotStatus,
  InventoryLotStatusLabels,
  Product,
  ProductPresentation,
  UUID
} from '../../types';

interface InventoryReceptionProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ProductToAdd {
  presentation: ProductPresentation;
  product: Product;
  quantity_received: number;
  unit_cost: number;
  batch_number?: string;
}

const InventoryReception: React.FC<InventoryReceptionProps> = ({ onSuccess, onCancel }) => {

  // Estados para proveedores
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<UUID | ''>('');
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);

  // Estados para nuevo proveedor
  const [newSupplier, setNewSupplier] = useState<SupplierCreate>({
    name: '',
    address: '',
    phone_number: '',
    email: '',
    contact_person: ''
  });

  // Estados para el lote
  const [lotCode, setLotCode] = useState('');
  const [receivedDate, setReceivedDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [status, setStatus] = useState<InventoryLotStatus>(InventoryLotStatus.RECEIVED);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Estados para productos
  const [products, setProducts] = useState<Product[]>([]);
  const [presentations, setPresentations] = useState<ProductPresentation[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<UUID | ''>('');
  const [selectedPresentationId, setSelectedPresentationId] = useState<UUID | ''>('');
  
  // Lista de productos agregados al lote
  const [productsToAdd, setProductsToAdd] = useState<ProductToAdd[]>([]);

  // Estados de producto actual
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);
  const [currentUnitCost, setCurrentUnitCost] = useState<number>(0);
  const [currentBatchNumber, setCurrentBatchNumber] = useState('');

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Cargar suppliers y products al montar
  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  // Generar código de lote automático
  useEffect(() => {
    if (!lotCode) {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
      setLotCode(`LOT-${dateStr}-${randomStr}`);
    }
  }, [lotCode]);

  // Calcular costo total automáticamente
  useEffect(() => {
    const total = productsToAdd.reduce(
      (sum, item) => sum + (item.quantity_received * item.unit_cost),
      0
    );
    setTotalCost(total);
  }, [productsToAdd]);

  // Cargar presentaciones cuando se selecciona un producto
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product && product.presentations) {
        setPresentations(product.presentations);
      } else {
        setPresentations([]);
      }
      setSelectedPresentationId('');
    }
  }, [selectedProductId, products]);

  const loadSuppliers = async () => {
    try {
      const data = await apiClient.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      setError('Error al cargar proveedores');
    }
  };

  const loadProducts = async () => {
    try {
      const data = await apiClient.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error al cargar productos');
    }
  };

  const handleCreateSupplier = async () => {
    if (!newSupplier.name.trim()) {
      setError('El nombre del proveedor es requerido');
      return;
    }

    try {
      setLoading(true);
      const created = await apiClient.createSupplier(newSupplier);
      setSuppliers([...suppliers, created]);
      setSelectedSupplierId(created.id);
      setShowNewSupplierForm(false);
      setNewSupplier({
        name: '',
        address: '',
        phone_number: '',
        email: '',
        contact_person: ''
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al crear proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    // Validaciones
    if (!selectedPresentationId) {
      setError('Debe seleccionar un producto y presentación');
      return;
    }
    if (currentQuantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    if (currentUnitCost < 0) {
      setError('El costo unitario no puede ser negativo');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    const presentation = presentations.find(p => p.id === selectedPresentationId);

    if (!product || !presentation) {
      setError('Producto o presentación no encontrada');
      return;
    }

    // Verificar duplicados
    const isDuplicate = productsToAdd.some(
      item => item.presentation.id === selectedPresentationId
    );
    if (isDuplicate) {
      setError('Esta presentación ya fue agregada');
      return;
    }

    // Agregar a la lista
    setProductsToAdd([
      ...productsToAdd,
      {
        presentation,
        product,
        quantity_received: currentQuantity,
        unit_cost: currentUnitCost,
        batch_number: currentBatchNumber || undefined
      }
    ]);

    // Limpiar campos
    setSelectedProductId('');
    setSelectedPresentationId('');
    setCurrentQuantity(0);
    setCurrentUnitCost(0);
    setCurrentBatchNumber('');
    setError(null);
  };

  const handleRemoveProduct = (presentationId: UUID) => {
    setProductsToAdd(productsToAdd.filter(item => item.presentation.id !== presentationId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!selectedSupplierId) {
      setError('Debe seleccionar un proveedor');
      return;
    }
    if (!lotCode.trim()) {
      setError('El código de lote es requerido');
      return;
    }
    if (productsToAdd.length === 0) {
      setError('Debe agregar al menos un producto al lote');
      return;
    }

    try {
      setLoading(true);

      // 1. Crear el lote
      const lotData: InventoryLotCreate = {
        lot_code: lotCode.trim(),
        supplier_id: selectedSupplierId as UUID,
        received_date: new Date(receivedDate).toISOString(),
        expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
        status,
        total_cost: totalCost,
        notes: notes.trim() || null
      };

      const createdLot = await apiClient.createInventoryLot(lotData);

      // 2. Agregar productos al lote
      for (const item of productsToAdd) {
        const detailData: InventoryLotDetailCreate = {
          presentation_id: item.presentation.id,
          quantity_received: item.quantity_received,
          unit_cost: item.unit_cost,
          batch_number: item.batch_number || null
        };

        await apiClient.addProductToInventoryLot(createdLot.id, detailData);
      }

      // Éxito
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);

      // Limpiar formulario
      setSelectedSupplierId('');
      setLotCode('');
      setReceivedDate(new Date().toISOString().slice(0, 16));
      setExpiryDate('');
      setStatus(InventoryLotStatus.RECEIVED);
      setNotes('');
      setProductsToAdd([]);

    } catch (err: any) {
      setError(err.message || 'Error al crear el lote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inventory-reception-container">
      <form onSubmit={handleSubmit} className="inventory-reception-form">
        <div className="form-header">
          <h2>📦 Recepción de Mercancía</h2>
          {onCancel && (
            <button type="button" className="btn-close" onClick={onCancel}>
              ×
            </button>
          )}
        </div>

        {/* Alertas */}
        {showSuccess && (
          <div className="alert alert-success">
            ✓ Lote creado exitosamente
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ✗ {error}
          </div>
        )}

        {/* Sección 1: Información del Proveedor */}
        <div className="form-section">
          <h3>1. Proveedor</h3>

          {!showNewSupplierForm ? (
            <>
              <div className="form-group">
                <label htmlFor="supplier">
                  Proveedor <span className="required">*</span>
                </label>
                <div className="supplier-select-group">
                  <select
                    id="supplier"
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value as UUID)}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccione un proveedor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-new-supplier"
                    onClick={() => setShowNewSupplierForm(true)}
                    disabled={loading}
                  >
                    + Nuevo
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="new-supplier-form">
              <h4>Nuevo Proveedor</h4>
              
              <div className="form-group">
                <label>Nombre <span className="required">*</span></label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="Nombre del proveedor"
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={newSupplier.phone_number || ''}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone_number: e.target.value })}
                    placeholder="+57 300 123 4567"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newSupplier.email || ''}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    placeholder="proveedor@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={newSupplier.address || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder="Dirección física"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Persona de Contacto</label>
                <input
                  type="text"
                  value={newSupplier.contact_person || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
                  placeholder="Nombre del contacto"
                  disabled={loading}
                />
              </div>

              <div className="form-actions-inline">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowNewSupplierForm(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCreateSupplier}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Proveedor'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sección 2: Información del Lote */}
        <div className="form-section">
          <h3>2. Información del Lote</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lotCode">
                Código de Lote <span className="required">*</span>
              </label>
              <input
                type="text"
                id="lotCode"
                value={lotCode}
                onChange={(e) => setLotCode(e.target.value)}
                placeholder="LOT-20241013-ABC"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as InventoryLotStatus)}
                disabled={loading}
              >
                {Object.entries(InventoryLotStatusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="receivedDate">
                Fecha de Recepción <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="receivedDate"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate">Fecha de Vencimiento</label>
              <input
                type="datetime-local"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notas</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones sobre la recepción de mercancía..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="cost-display">
            <label>Costo Total del Lote:</label>
            <span className="cost-value">${totalCost.toLocaleString('es-CO')}</span>
          </div>
        </div>

        {/* Sección 3: Productos del Lote */}
        <div className="form-section">
          <h3>3. Productos Recibidos</h3>

          {/* Lista de productos agregados */}
          {productsToAdd.length > 0 && (
            <div className="products-added-list">
              <h4>Productos Agregados ({productsToAdd.length})</h4>
              {productsToAdd.map((item, index) => (
                <div key={index} className="product-added-card">
                  <div className="product-added-info">
                    <div className="product-added-name">
                      <strong>{item.product.name}</strong>
                      <span className="presentation-badge">
                        {item.presentation.presentation_name}
                      </span>
                    </div>
                    <div className="product-added-details">
                      <span>Cantidad: {item.quantity_received}</span>
                      <span>Costo Unit.: ${item.unit_cost.toLocaleString('es-CO')}</span>
                      <span className="total-cost">
                        Total: ${(item.quantity_received * item.unit_cost).toLocaleString('es-CO')}
                      </span>
                      {item.batch_number && (
                        <span className="batch-badge">Lote: {item.batch_number}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveProduct(item.presentation.id)}
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Formulario para agregar productos */}
          <div className="add-product-form">
            <h4>Agregar Producto</h4>

            <div className="form-group">
              <label htmlFor="product">Producto</label>
              <select
                id="product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value as UUID)}
                disabled={loading}
              >
                <option value="">Seleccione un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.brand ? `- ${product.brand}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedProductId && (
              <>
                <div className="form-group">
                  <label htmlFor="presentation">Presentación</label>
                  <select
                    id="presentation"
                    value={selectedPresentationId}
                    onChange={(e) => setSelectedPresentationId(e.target.value as UUID)}
                    disabled={loading}
                  >
                    <option value="">Seleccione una presentación</option>
                    {presentations.map((pres) => (
                      <option key={pres.id} value={pres.id}>
                        {pres.presentation_name} - {pres.quantity} {pres.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="quantity">Cantidad Recibida</label>
                    <input
                      type="number"
                      id="quantity"
                      value={currentQuantity || ''}
                      onChange={(e) => setCurrentQuantity(parseFloat(e.target.value) || 0)}
                      placeholder="Ej: 50"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="unitCost">Costo Unitario</label>
                    <input
                      type="number"
                      id="unitCost"
                      value={currentUnitCost || ''}
                      onChange={(e) => setCurrentUnitCost(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      placeholder="Ej: 30000"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="batchNumber">Número de Lote del Proveedor (Opcional)</label>
                  <input
                    type="text"
                    id="batchNumber"
                    value={currentBatchNumber}
                    onChange={(e) => setCurrentBatchNumber(e.target.value)}
                    placeholder="Ej: BATCH-2024-XYZ-001"
                    disabled={loading}
                  />
                </div>

                <button
                  type="button"
                  className="btn-add-product"
                  onClick={handleAddProduct}
                  disabled={loading}
                >
                  + Agregar al Lote
                </button>
              </>
            )}
          </div>

          {productsToAdd.length === 0 && (
            <div className="alert alert-info">
              ℹ Debe agregar al menos un producto para crear el lote
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="btn-submit"
            disabled={loading || productsToAdd.length === 0}
          >
            {loading ? 'Creando Lote...' : 'Crear Lote de Inventario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryReception;
