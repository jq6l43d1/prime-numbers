import { useState } from 'react';

export function ExportButton({ orders, statistics, dateFilter }) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);

    try {
      // Create CSV content
      const headers = ['Order Date', 'Product Name', 'Category', 'Quantity', 'Unit Price', 'Total', 'Payment Method', 'Shipping'];
      const rows = orders.map(order => [
        order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A',
        order.productName || 'Unknown',
        order.category || 'Other',
        order.quantity || 1,
        (order.unitPrice || 0).toFixed(2),
        (order.totalOwed || 0).toFixed(2),
        order.paymentMethod || 'Unknown',
        (order.shippingCharge || 0).toFixed(2)
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `amazon-orders-${dateFilter.label.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);

    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        dateFilter: dateFilter.label,
        statistics: {
          overview: statistics.overview,
          spending: {
            total: statistics.overview.totalSpent,
            average: statistics.overview.avgOrderValue,
            byCategory: statistics.spending.byCategory
          }
        },
        orders: orders.map(order => ({
          date: order.orderDate ? new Date(order.orderDate).toISOString() : null,
          productName: order.productName,
          category: order.category,
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          total: order.totalOwed,
          paymentMethod: order.paymentMethod,
          shippingCharge: order.shippingCharge
        }))
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `amazon-orders-${dateFilter.label.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportSummary = () => {
    setIsExporting(true);

    try {
      const summaryText = `
AMAZON ORDER ANALYZER - SUMMARY REPORT
Generated: ${new Date().toLocaleString()}
Date Range: ${dateFilter.label}

═══════════════════════════════════════════════════════════

OVERVIEW
--------
Total Spent:          $${statistics.overview.totalSpent.toFixed(2)}
Total Orders:         ${statistics.overview.totalOrders}
Average Order Value:  $${statistics.overview.avgOrderValue.toFixed(2)}
Total Items:          ${statistics.overview.totalItems}
Total Savings:        $${statistics.overview.totalDiscounts.toFixed(2)}
Return Rate:          ${statistics.returns?.returnRate.toFixed(1)}%

SPENDING BY CATEGORY
--------------------
${statistics.spending.byCategory.slice(0, 10).map((cat, i) =>
  `${i + 1}. ${cat.category.padEnd(30)} $${cat.amount.toFixed(2).padStart(12)} (${cat.percentage}%)`
).join('\n')}

TOP PRODUCTS BY SPENDING
-------------------------
${statistics.products.topBySpending.slice(0, 10).map((prod, i) =>
  `${i + 1}. ${(prod.name || 'Unknown').substring(0, 40).padEnd(40)} $${prod.totalSpent.toFixed(2).padStart(10)}`
).join('\n')}

MONTHLY SPENDING (LAST 12 MONTHS)
----------------------------------
${statistics.spending.last12Months.map(month =>
  `${month.month.padEnd(15)} $${month.amount.toFixed(2).padStart(10)} (${month.orders} orders)`
).join('\n')}

═══════════════════════════════════════════════════════════
      `.trim();

      const blob = new Blob([summaryText], { type: 'text/plain' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `amazon-summary-${dateFilter.label.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export summary. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideUp">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 text-sm font-semibold">
            Choose Export Format
          </div>
          <button
            onClick={exportToCSV}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3 border-b border-gray-100"
          >
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Export as CSV</p>
              <p className="text-xs text-gray-500">All order details</p>
            </div>
          </button>
          <button
            onClick={exportToJSON}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3 border-b border-gray-100"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Export as JSON</p>
              <p className="text-xs text-gray-500">With statistics</p>
            </div>
          </button>
          <button
            onClick={exportSummary}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3"
          >
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Export Summary</p>
              <p className="text-xs text-gray-500">Text report</p>
            </div>
          </button>
        </div>
      )}

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
