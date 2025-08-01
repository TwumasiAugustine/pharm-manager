import React from 'react';
import { format } from 'date-fns';
import PHARMACY_CONFIG from '../../config/pharmacy';
import type { Sale, SaleItem } from '../../types/sale.types';
import { Button } from '../atoms/Button';
import { FaPrint } from 'react-icons/fa';
import { useDrugs } from '../../hooks/useDrugs';

interface PrintReceiptProps {
    sale: Sale;
}

const PrintReceipt: React.FC<PrintReceiptProps> = ({ sale }) => {
    const { data: drugsResponse } = useDrugs();
    const drugs = drugsResponse?.drugs || [];

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const saleDate = sale.createdAt
            ? format(new Date(sale.createdAt), 'PPP p')
            : '';
        const currentDate = format(new Date(), 'PPP p');

        const html = `
      <html>
      <head>
          <title>Sale Receipt - ${saleDate}</title>
          <style>
              body { font-family: 'Courier New', monospace; margin: 20px; color: #333; }
              .receipt-container { max-width: 800px; margin: auto; border: 1px solid #ccc; padding: 20px; }
              .receipt-header { text-align: center; margin-bottom: 20px; }
              .pharmacy-name { font-size: 24px; font-weight: bold; }
              .pharmacy-details { font-size: 12px; }
              .receipt-title { font-size: 20px; font-weight: bold; margin: 20px 0; border-top: 1px dashed #333; border-bottom: 1px dashed #333; padding: 10px 0; }
              .transaction-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .info-group { width: 48%; }
              .section-title { font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 10px; padding-bottom: 5px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .info-label { font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
              th { font-weight: bold; }
              .text-right { text-align: right; }
              .total-section { margin-top: 20px; }
              .total-row { font-weight: bold; border-top: 2px solid #333; }
              .receipt-footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="receipt-container">
              <div class="receipt-header">
                  <div class="pharmacy-name">${PHARMACY_CONFIG.name}</div>
                  <div class="pharmacy-details">${PHARMACY_CONFIG.address} | ${
            PHARMACY_CONFIG.contact
        }</div>
                  <div class="pharmacy-details">Reg No: ${
                      PHARMACY_CONFIG.registrationNumber
                  } | Tax ID: ${PHARMACY_CONFIG.taxId}</div>
              </div>
              <div class="receipt-title">SALES RECEIPT</div>
          </div>

          <div class="transaction-info">
              <div class="info-group">
                  <div class="section-title">Transaction Details</div>
                  <div class="info-row">
                      <div class="info-label">Receipt No:</div>
                      <div class="info-value">${sale.id}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">Date:</div>
                      <div class="info-value">${saleDate}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">Served by:</div>
                      <div class="info-value">${
                          typeof sale.soldBy === 'object' && sale.soldBy?.name
                              ? sale.soldBy.name
                              : typeof sale.soldBy === 'string'
                              ? sale.soldBy
                              : ''
                      }</div>
                  </div>
              </div>

              <div class="info-group">
                  <div class="section-title">Customer Information</div>
                  <div class="info-row">
                      <div class="info-label">Customer:</div>
                      <div class="info-value">Walk-in Customer</div>
                  </div>
              </div>
          </div>

          <div class="receipt-section">
              <div class="section-title">Purchased Items</div>
              <table>
                  <thead>
                      <tr>
                          <th>#</th>
                          <th>Item</th>
                          <th>Brand</th>
                          <th>Quantity</th>
                          <th class="text-right">Price</th>
                          <th class="text-right">Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${sale.items
                          .map(
                              (item: SaleItem, index: number) => `
                          <tr>
                              <td>${index + 1}</td>
                              <td>${item.name}</td>
                              <td>${item.brand || '-'}</td>
                              <td>${item.quantity}</td>
                              <td class="text-right">$${item.priceAtSale.toFixed(
                                  2,
                              )}</td>
                              <td class="text-right">$${(
                                  item.quantity * item.priceAtSale
                              ).toFixed(2)}</td>
                          </tr>
                      `,
                          )
                          .join('')}
                      <tr class="total-row">
                          <td colspan="5" class="text-right">Subtotal:</td>
                          <td class="text-right">$${sale.totalAmount.toFixed(
                              2,
                          )}</td>
                      </tr>
                      <tr>
                          <td colspan="5" class="text-right">Tax (0.0%):</td>
                          <td class="text-right">$${(0).toFixed(2)}</td>
                      </tr>
                      <tr>
                          <td colspan="5" class="text-right">Discount:</td>
                          <td class="text-right">$${(0).toFixed(2)}</td>
                      </tr>
                      <tr class="total-row">
                          <td colspan="5" class="text-right">Total:</td>
                          <td class="text-right">$${sale.totalAmount.toFixed(
                              2,
                          )}</td>
                      </tr>
                  </tbody>
              </table>
          </div>

          <div class="receipt-section">
              <div class="section-title">Payment Information</div>
              <div class="info-row">
                  <div class="info-label">Payment Method:</div>
                  <div class="info-value">Cash</div>
              </div>
              <div class="info-row">
                  <div class="info-label">Payment Status:</div>
                  <div class="info-value">Paid</div>
              </div>
          </div>

          <div class="footer">
              <p>${PHARMACY_CONFIG.slogan}</p>
              <p>Thank you for your business!</p>
              <p>Printed on: ${currentDate}</p>
          </div>
      </body>
      </html>
    `;

        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
    };

    return (
        <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={handlePrint}
        >
            <FaPrint className="h-4 w-4" />
            Print Receipt
        </Button>
    );
};

export default PrintReceipt;
