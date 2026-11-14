import { Service } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Invoice } from '../../models/invoice.model';

@Service()
export class Pdf {
  private waitForRender(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  }

  async generatePdfFromHtml(elementId: string, filename: string): Promise<Blob> {
    await this.waitForRender();

    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const canvas = await html2canvas(element, {
      scale: 4,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (_doc, clonedEl) => {
        clonedEl.style.width = '780px';
      },
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);

    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    return pdf.output('blob');
  }

  async downloadPdf(elementId: string, filename: string): Promise<void> {
    try {
      const blob = await this.generatePdfFromHtml(elementId, filename);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${filename}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  async printPdf(elementId: string): Promise<void> {
    try {
      const blob = await this.generatePdfFromHtml(elementId, 'invoice');
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url);

      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    } catch (error) {
      console.error('Error printing PDF:', error);
      throw error;
    }
  }

  async shareViaWhatsApp(elementId: string, invoiceNo: number): Promise<void> {
    try {
      const blob = await this.generatePdfFromHtml(elementId, `Invoice-${invoiceNo}`);

      // Create a message with invoice details
      const message = `Invoice #${invoiceNo} - Please find the attached bill`;
      const encodedMessage = encodeURIComponent(message);

      // Open WhatsApp with pre-filled message
      // Note: For actual file sharing, you'd need a backend API to upload the PDF
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');

      // Store PDF in sessionStorage so user can access it after WhatsApp is opened
      const reader = new FileReader();

      reader.onload = () => {
        sessionStorage.setItem(`invoice_${invoiceNo}`, reader.result as string);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      throw error;
    }
  }

  generateInvoicePdf(invoice: Invoice): void {
    const content = this.generateHtmlContent(invoice);
    const printWindow = window.open('', '', 'width=800,height=600');

    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  }

  downloadInvoicePdf(invoice: Invoice): void {
    const content = this.generateHtmlContent(invoice);
    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `Invoice-${invoice.invoiceNo}.html`;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  private generateHtmlContent(invoice: Invoice): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoiceNo}</title>
      </head>
      <body>
        <h1>Invoice ${invoice.invoiceNo}</h1>
      </body>
      </html>
    `;
  }
}
