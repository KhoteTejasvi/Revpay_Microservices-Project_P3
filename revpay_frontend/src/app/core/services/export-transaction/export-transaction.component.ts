import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-export-transactions',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe],
  templateUrl: `./export-transaction.component.html`,
  styleUrl: `export-transaction.component.css`
})
export class ExportTransactionsComponent {
  private dashboardService = inject(DashboardService);
  private auth = inject(AuthService);

  fromDate = '';
  toDate = '';
  transactions = signal<any[]>([]);
  loading = signal(false);
  exporting = signal(false);
  error = signal<string | null>(null);
  previewed = signal(false);

  totalCredit = () => this.transactions()
    .filter(t => t.credit)
    .reduce((s, t) => s + Number(t.amount), 0);

  totalDebit = () => this.transactions()
    .filter(t => !t.credit)
    .reduce((s, t) => s + Number(t.amount), 0);

  loadPreview() {
    this.loading.set(true);
    this.error.set(null);
    this.dashboardService.exportTransactions(
      this.fromDate || undefined,
      this.toDate || undefined
    ).subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.loading.set(false);
        this.previewed.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Failed to load transactions');
      }
    });
  }

  shortType(type: string): string {
    const map: Record<string, string> = {
        'MONEY_REQUEST_FULFILLMENT': 'Money Request',
        'LOAN_DISBURSEMENT': 'Loan Credit',
        'EMI_PAYMENT': 'EMI Payment',
        'INVOICE_PAYMENT': 'Invoice',
        'TRANSFER': 'Transfer',
        'DEPOSIT': 'Top Up',
        'WITHDRAWAL': 'Withdrawal',
    };
    return map[type] ?? type;
  }

  clearFilter() {
    this.fromDate = '';
    this.toDate = '';
    this.transactions.set([]);
    this.previewed.set(false);
  }

  async exportPDF() {
    this.exporting.set(true);
    const user = this.auth.currentUser();

    // Dynamically load jsPDF
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    // ── Header ───────────────────────────────────────────
    doc.setFillColor(15, 15, 30);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Logo area
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(margin, y, 35, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RevPay', margin + 5, y + 8);

    // Title
    doc.setFontSize(18);
    doc.setTextColor(241, 245, 249);
    doc.text('Transaction Statement', margin + 42, y + 9);

    // Date range
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const dateRange = (this.fromDate || 'All time') +
      ' → ' + (this.toDate || 'Today');
    doc.text(dateRange, pageW - margin - 60, y + 5);
    doc.text('Generated: ' + new Date().toLocaleDateString(), pageW - margin - 60, y + 10);

    y += 18;

    // ── Account Info ──────────────────────────────────────
    doc.setFillColor(25, 25, 45);
    doc.roundedRect(margin, y, pageW - margin * 2, 18, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Account Holder', margin + 5, y + 6);
    doc.setTextColor(241, 245, 249);
    doc.setFont('helvetica', 'bold');
    doc.text(user?.fullName ?? '', margin + 5, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Email', margin + 70, y + 6);
    doc.setTextColor(241, 245, 249);
    doc.text(user?.email ?? '', margin + 70, y + 12);

    doc.setTextColor(148, 163, 184);
    doc.text('Total Transactions', margin + 150, y + 6);
    doc.setTextColor(241, 245, 249);
    doc.setFont('helvetica', 'bold');
    doc.text(String(this.transactions().length), margin + 150, y + 12);

    doc.setTextColor(148, 163, 184);
    doc.text('Total Credit', margin + 200, y + 6);
    doc.setTextColor(74, 222, 128);
    doc.setFont('helvetica', 'bold');
    doc.text('$' + this.totalCredit().toFixed(2), margin + 200, y + 12);

    doc.setTextColor(148, 163, 184);
    doc.text('Total Debit', margin + 240, y + 6);
    doc.setTextColor(248, 113, 113);
    doc.text('$' + this.totalDebit().toFixed(2), margin + 240, y + 12);

    y += 24;

    // ── Table Header ──────────────────────────────────────
    const cols = [
      { label: '#',           x: margin,       w: 10  },
      { label: 'Date',        x: margin + 10,  w: 22  },
      { label: 'Reference',   x: margin + 32,  w: 38  },
      { label: 'Description', x: margin + 70,  w: 65  },
      { label: 'Type',        x: margin + 135, w: 35  },
      { label: 'Amount',      x: margin + 170, w: 30  },
      { label: 'Status',      x: margin + 200, w: 25  },
      { label: 'From/To',     x: margin + 225, w: 50  },
    ];

    doc.setFillColor(30, 27, 75);
    doc.rect(margin, y, pageW - margin * 2, 8, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(167, 139, 250);
    cols.forEach(col => doc.text(col.label, col.x + 2, y + 5.5));
    y += 10;

    // ── Rows ──────────────────────────────────────────────
    const txs = this.transactions();
    txs.forEach((tx, i) => {
      // New page if needed
      if (y > pageH - 20) {
        doc.addPage();
        doc.setFillColor(15, 15, 30);
        doc.rect(0, 0, pageW, pageH, 'F');
        y = margin;

        // Repeat header
        doc.setFillColor(30, 27, 75);
        doc.rect(margin, y, pageW - margin * 2, 8, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(167, 139, 250);
        cols.forEach(col => doc.text(col.label, col.x + 2, y + 5.5));
        y += 10;
      }

      // Row background
      const rowBg = i % 2 === 0 ? [20, 20, 35] : [17, 17, 30];
      doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
      doc.rect(margin, y - 1, pageW - margin * 2, 7.5, 'F');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');

      // Row number
      doc.setTextColor(100, 116, 139);
      doc.text(String(i + 1), cols[0].x + 2, y + 4.5);

      // Date
      doc.setTextColor(148, 163, 184);
      const d = tx.createdAt
        ? new Date(tx.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: '2-digit'
          })
        : '—';
      doc.text(d, cols[1].x + 2, y + 4.5);

      // Reference
      doc.setTextColor(167, 139, 250);
      const ref = (tx.referenceNumber ?? '').substring(0, 18);
      doc.text(ref, cols[2].x + 2, y + 4.5);

      // Description
      doc.setTextColor(203, 213, 225);
      const desc = (tx.description ?? tx.type ?? '').substring(0, 35);
      doc.text(desc, cols[3].x + 2, y + 4.5);

      // Type
      doc.setTextColor(100, 116, 139);
      doc.text((tx.type ?? '').substring(0, 18), cols[4].x + 2, y + 4.5);

      // Amount
      if (tx.credit) {
        doc.setTextColor(74, 222, 128);
        doc.text('+$' + Number(tx.amount).toFixed(2), cols[5].x + 2, y + 4.5);
      } else {
        doc.setTextColor(248, 113, 113);
        doc.text('-$' + Number(tx.amount).toFixed(2), cols[5].x + 2, y + 4.5);
      }

      // Status
      doc.setTextColor(100, 116, 139);
      doc.text(tx.status ?? '', cols[6].x + 2, y + 4.5);

      // From/To account
      doc.setTextColor(100, 116, 139);
      const account = tx.credit
        ? (tx.senderAccountNumber ?? 'SYSTEM')
        : (tx.receiverAccountNumber ?? 'SYSTEM');
      doc.text(account.substring(0, 16), cols[7].x + 2, y + 4.5);

      y += 7.5;
    });

    // ── Footer ────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Page ${p} of ${totalPages} · RevPay Transaction Statement · Confidential`,
        margin, pageH - 6
      );
    }

    // ── Save ──────────────────────────────────────────────
    const fileName = `revpay-transactions-${
      this.fromDate || 'all'}-to-${this.toDate || 'today'}.pdf`;
    doc.save(fileName);
    this.exporting.set(false);
  }
}