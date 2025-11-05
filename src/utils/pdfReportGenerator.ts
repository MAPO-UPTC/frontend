import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PeriodSalesReportResponse } from '../types';
import logo from '../assets/mapo-logo.jpg';

/**
 * Genera un PDF del reporte de ventas
 */
export const generateReportPDF = (
  report: PeriodSalesReportResponse,
  reportType: string,
  selectedDate: string
): void => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // ========== LOGO ==========
    try {
      doc.addImage(logo, 'JPEG', 15, 10, 35, 35);
    } catch (error) {
      console.warn('No se pudo cargar el logo:', error);
    }

    // ========== ENCABEZADO ==========
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE VENTAS', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema MAPO - Gestión de Inventario', pageWidth / 2, 35, { align: 'center' });
    
    // Línea separadora
    yPosition = 48;
    doc.setLineWidth(0.5);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 10;

    // ========== INFORMACIÓN DEL REPORTE ==========
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const reportTypeLabel = reportType === 'daily' ? 'Diario' : reportType === 'weekly' ? 'Semanal' : 'Mensual';
    
    doc.text('Tipo de Reporte:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(reportTypeLabel, 55, yPosition);
    
    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de Consulta:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedDate, 55, yPosition);
    
    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Periodo:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formatDate(report.start_date)} - ${formatDate(report.end_date)}`, 55, yPosition);
    
    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Generado:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleString('es-CO'), 55, yPosition);
    
    yPosition += 12;

    // ========== MÉTRICAS PRINCIPALES ==========
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(41, 128, 185); // Azul
    doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
    doc.setTextColor(255, 255, 255); // Texto blanco
    doc.text('📊 MÉTRICAS PRINCIPALES', 18, yPosition);
    doc.setTextColor(0, 0, 0); // Volver a negro
    
    yPosition += 10;

    // Tabla de métricas
    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: [
        ['Ventas Totales', formatCurrency(report.total_revenue || 0)],
        ['Ganancia Estimada', formatCurrency(report.estimated_profit || 0)],
        ['Margen de Ganancia', `${(report.profit_margin || 0).toFixed(2)}%`],
        ['Items Vendidos', (report.total_items_sold || 0).toLocaleString('es-CO')],
        ['Total de Transacciones', (report.total_sales || 0).toLocaleString('es-CO')],
        ['Venta Promedio', formatCurrency(report.average_sale_value || 0)],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [52, 152, 219],
        fontStyle: 'bold',
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' },
        1: { cellWidth: 'auto', halign: 'right' },
      },
      margin: { left: 15, right: 15 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // ========== PRODUCTOS MÁS VENDIDOS ==========
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(46, 204, 113); // Verde
    doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('🏆 PRODUCTOS MÁS VENDIDOS', 18, yPosition);
    doc.setTextColor(0, 0, 0);
    
    yPosition += 10;

    const topProducts = report.top_products || [];
    const productsData = topProducts.length > 0
      ? topProducts.map((product, index) => [
          `#${index + 1}`,
          product.product_name || 'N/A',
          product.presentation_name || 'N/A',
          (product.quantity_sold || 0).toLocaleString('es-CO'),
          formatCurrency(product.total_revenue || 0),
        ])
      : [['', 'No hay datos disponibles', '', '', '']];

    autoTable(doc, {
      startY: yPosition,
      head: [['Rank', 'Producto', 'Presentación', 'Cantidad', 'Ingresos']],
      body: productsData,
      theme: 'striped',
      headStyles: {
        fillColor: [46, 204, 113],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 45 },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      },
      margin: { left: 15, right: 15 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Verificar si necesitamos una nueva página
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    // ========== MEJORES CLIENTES ==========
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(155, 89, 182); // Morado
    doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('👥 MEJORES CLIENTES', 18, yPosition);
    doc.setTextColor(0, 0, 0);
    
    yPosition += 10;

    const topCustomers = report.top_customers || [];
    const customersData = topCustomers.length > 0
      ? topCustomers.map((customer, index) => [
          `#${index + 1}`,
          customer.customer_name || 'N/A',
          customer.customer_document || 'N/A',
          (customer.total_purchases || 0).toLocaleString('es-CO'),
          formatCurrency(customer.total_spent || 0),
        ])
      : [['', 'No hay datos disponibles', '', '', '']];

    autoTable(doc, {
      startY: yPosition,
      head: [['Rank', 'Cliente', 'Documento', 'Compras', 'Total Gastado']],
      body: customersData,
      theme: 'striped',
      headStyles: {
        fillColor: [155, 89, 182],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 65 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 40, halign: 'right' },
      },
      margin: { left: 15, right: 15 },
    });

    // ========== PIE DE PÁGINA ==========
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${totalPages} | Generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // ========== DESCARGAR PDF ==========
    const fileName = `reporte-ventas-${reportType}-${selectedDate}.pdf`;
    doc.save(fileName);
    
    console.log('✅ Reporte PDF generado exitosamente:', fileName);
  } catch (error) {
    console.error('❌ Error al generar PDF del reporte:', error);
    throw error;
  }
};

/**
 * Formatea una fecha al formato español
 */
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formatea un número como moneda colombiana
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};
