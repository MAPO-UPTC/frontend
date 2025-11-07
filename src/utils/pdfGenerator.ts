import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, SaleDetail } from '../types';
import logo from '../assets/mapo-logo.jpg';

interface PDFSaleData {
  sale: Sale;
  customerName: string;
  customerDocument: string;
}

export const generateSalePDF = (data: PDFSaleData): void => {
  const { sale, customerName, customerDocument } = data;
  const doc = new jsPDF();

  // Configuración de colores
  const primaryColor: [number, number, number] = [52, 152, 219]; // Azul
  const secondaryColor: [number, number, number] = [236, 240, 241]; // Gris claro
  const textColor: [number, number, number] = [44, 62, 80]; // Gris oscuro

  // Logo de la empresa (superior izquierda)
  try {
    doc.addImage(logo, 'JPEG', 15, 10, 30, 30);
  } catch (error) {
    console.warn('No se pudo cargar el logo:', error);
  }

  // Encabezado de la empresa
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text('MAPO - Punto de Venta', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text('Comprobante de Venta', 105, 28, { align: 'center' });

  // Línea separadora
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 32, 190, 32);

  // Información de la venta
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Información de la Venta', 20, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const saleDate = new Date(sale.sale_date).toLocaleString('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  const saleId = sale.sale_code || sale.id;
  
  doc.text(`ID de Venta: ${saleId}`, 20, 50);
  doc.text(`Fecha: ${saleDate}`, 20, 56);
  doc.text(`Estado: ${sale.status}`, 20, 62);

  // Información del cliente
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 120, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(customerName, 120, 56);
  doc.text(`Documento: ${customerDocument}`, 120, 62);

  // Tabla de productos
  const items = sale.items || sale.sale_details || [];
  
  const tableData = items.map((item: SaleDetail) => {
    const productName = item.product_name || 'Producto';
    const presentationName = item.presentation_name || '';
    const quantity = item.quantity || 0;
    const unitPrice = item.unit_price || 0;
    const lineTotal = item.line_total || (quantity * unitPrice);

    return [
      productName,
      presentationName,
      quantity.toString(),
      formatCurrency(unitPrice),
      formatCurrency(lineTotal)
    ];
  });

  autoTable(doc, {
    startY: 72,
    head: [['Producto', 'Presentación', 'Cantidad', 'Precio Unit.', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      textColor: textColor
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 45 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: secondaryColor
    },
    margin: { left: 20, right: 20 }
  });

  // Cálculos de totales
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  const subtotal = sale.total || sale.total_amount || 0;
  const iva = subtotal * 0.19;
  const total = subtotal * 1.19;

  // Línea antes de totales
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(20, finalY + 5, 190, finalY + 5);

  // Resumen de totales
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryX = 120;
  let summaryY = finalY + 15;

  doc.text('Subtotal:', summaryX, summaryY);
  doc.text(formatCurrency(subtotal), 180, summaryY, { align: 'right' });

  summaryY += 7;
  doc.text('IVA (19%):', summaryX, summaryY);
  doc.text(formatCurrency(iva), 180, summaryY, { align: 'right' });

  summaryY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', summaryX, summaryY);
  doc.text(formatCurrency(total), 180, summaryY, { align: 'right' });

  // Pie de página
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text('Gracias por su compra', 105, pageHeight - 20, { align: 'center' });
  doc.text('MAPO - Sistema de Gestión', 105, pageHeight - 15, { align: 'center' });
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 105, pageHeight - 10, { align: 'center' });

  // Guardar el PDF
  const fileName = `venta_${saleId}_${Date.now()}.pdf`;
  doc.save(fileName);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};
    