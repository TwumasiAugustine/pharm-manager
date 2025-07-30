import React from 'react';
import { format } from 'date-fns';
import PHARMACY_CONFIG, {
    getFormattedAddress,
    getFormattedContact,
} from '../../config/pharmacy';
import type { Sale, SaleItem } from '../../types/sale.types';
import { Button } from '../atoms/Button';
import { FaPrint } from 'react-icons/fa';

interface PrintReceiptProps {
    sale: Sale;
}

const PrintReceipt: React.FC<PrintReceiptProps> = ({ sale }) => {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const saleDate = sale.date ? format(new Date(sale.date), 'PPP p') : '';
        const currentDate = format(new Date(), 'PPP p');

        const html = `
      <html>
      <head>
          <title>Sale Receipt - ${saleDate}</title>
          <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ddd; }
              .pharmacy-info { text-align: center; margin-bottom: 15px; }
              .pharmacy-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .pharmacy-details { font-size: 0.9em; color: #555; }
              .receipt-title { font-size: 18px; margin: 15px 0; text-align: center; font-weight: bold; }
              .transaction-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .receipt-section { margin-bottom: 15px; }
              .section-title { font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 8px; }
              .info-group { margin-bottom: 20px; }
              .info-row { display: flex; }
              .info-label { font-weight: bold; width: 130px; }
              .info-value { flex: 1; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f5f5f5; }
              .text-right { text-align: right; }
              .total-row { font-weight: bold; border-top: 2px solid #ddd; }
              .total { margin: 15px 0; text-align: right; font-weight: bold; font-size: 18px; }
              .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 0.85em; color: #555; }
              .customer-notes { background-color: #f9f9f9; padding: 10px; border-radius: 4px; margin: 15px 0; font-style: italic; }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="pharmacy-info">
                  <div class="pharmacy-name">${PHARMACY_CONFIG.name}</div>
                  <div class="pharmacy-details">${getFormattedAddress()}</div>
                  <div class="pharmacy-details">${getFormattedContact()}</div>
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
                              <td>${
                                  typeof item.drug === 'object' &&
                                  item.drug?.name
                                      ? item.drug.name
                                      : typeof item.drug === 'string'
                                      ? item.drug
                                      : ''
                              }</td>
                              <td>${
                                  typeof item.drug === 'object' &&
                                  item.drug?.brand
                                      ? item.drug.brand
                                      : '-'
                              }</td>
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
