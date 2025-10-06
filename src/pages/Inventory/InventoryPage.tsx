import React, { useState } from 'react';
import { InventoryDashboard, StockAdjustmentModal, ProductForm } from '../../components/InventoryManagement';
import { ProductPresentation, Product } from '../../types';
import './InventoryPage.css';

export const InventoryPage: React.FC = () => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<ProductPresentation | null>(null);

  const handleProductSelect = (product: Product) => {
    // Por ahora, seleccionamos la primera presentación
    // En el futuro se podría mostrar un modal para seleccionar la presentación específica
    if (product.presentations && product.presentations.length > 0) {
      setSelectedPresentation(product.presentations[0]);
      setShowStockModal(true);
    }
  };

  const handleStockAdjustment = async (presentationId: string, newStock: number, reason: string) => {
    try {
      // Aquí se integrará con el API real para ajustar el stock
      console.log('Adjusting stock:', { presentationId, newStock, reason });
      
      // Simular llamada al API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aquí se actualizaría el estado global o se recargarían los datos
      alert(`Stock ajustado exitosamente. Nuevo stock: ${newStock}. Motivo: ${reason}`);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Error al ajustar el stock');
    }
  };

  const handleProductCreated = () => {
    // Recargar datos del inventario
    console.log('Product created, refreshing inventory...');
    alert('Producto creado exitosamente');
  };

  return (
    <div className="inventory-page">
      <InventoryDashboard 
        onProductSelect={handleProductSelect}
      />

      <ProductForm
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        onProductCreated={handleProductCreated}
      />

      <StockAdjustmentModal
        isOpen={showStockModal}
        presentation={selectedPresentation}
        onClose={() => {
          setShowStockModal(false);
          setSelectedPresentation(null);
        }}
        onAdjust={handleStockAdjustment}
      />
    </div>
  );
};