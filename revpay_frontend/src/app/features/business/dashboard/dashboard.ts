import { Component, inject, signal, OnInit, computed, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { SlicePipe } from '@angular/common';


@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, SlicePipe],
  templateUrl: `./dashboard.html`,
  styleUrl: `./dashboard.css`
})
export class BusinessDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  auth = inject(AuthService);

  dashData = signal<any>(null);
  invoiceStats = signal<any>(null);
  loanStats = signal<any>(null);
  recentInvoices = signal<any[]>([]);
  allInvoices = signal<any[]>([]);
  allLoans = signal<any[]>([]);

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  });

  today = computed(() =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric',
      month: 'long', day: 'numeric'
    })
  );

  balance = computed(() =>
   this.dashData()?.totalBalance ?? 0 
  );

  paidInvoices = computed(() =>
    this.allInvoices()
      .filter(i => i.status === 'PAID')
      .slice(0, 6)
  );

  activeLoan = computed(() =>
    this.allLoans().find(l => l.status === 'ACTIVE') ?? null
  );

  maxAmount = computed(() => {
    const paid = this.paidInvoices();
    if (!paid.length) return 1;
    return Math.max(...paid.map(i => i.totalAmount));
  });

  donutSegments = computed(() => {
    const stats = this.invoiceStats();
    if (!stats || !stats.total) return [];
    const circ = 2 * Math.PI * 45;
    const items = [
      { label: 'Paid',      value: stats.paid,      color: '#4ade80' },
      { label: 'Sent',      value: stats.sent,      color: '#60a5fa' },
      { label: 'Draft',     value: stats.draft,     color: '#94a3b8' },
      { label: 'Disputed',  value: stats.disputed,  color: '#f87171' },
      { label: 'Cancelled', value: stats.cancelled, color: '#334155' },
    ].filter(i => i.value > 0);
    let offset = 0;
    return items.map(item => {
      const pct = item.value / stats.total;
      const dash = `${pct * circ} ${circ}`;
      const seg = { ...item, dash, offset: -offset * circ };
      offset += pct;
      return seg;
    });
  });

  legendItems = computed(() => {
    const stats = this.invoiceStats();
    if (!stats) return [];
    return [
      { label: 'Paid',      value: stats.paid ?? 0,      color: '#4ade80' },
      { label: 'Sent',      value: stats.sent ?? 0,      color: '#60a5fa' },
      { label: 'Draft',     value: stats.draft ?? 0,     color: '#94a3b8' },
      { label: 'Disputed',  value: stats.disputed ?? 0,  color: '#f87171' },
    ];
  });
  dashboard: any;
  loading: any;

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        console.log('Dashboard data: ',data);
        this.dashData.set(data);
      }
    });

    this.dashboardService.getIssuedInvoices(0, 100).subscribe({
      next: (page) => {
        const all = page.content;
        this.allInvoices.set(all);
        this.recentInvoices.set(all.slice(0, 6));
        const paid = all.filter((i: any) => i.status === 'PAID');
        const sent = all.filter((i: any) => i.status === 'SENT');
        this.invoiceStats.set({
          total:          all.length,
          draft:          all.filter((i: any) => i.status === 'DRAFT').length,
          sent:           sent.length,
          paid:           paid.length,
          disputed:       all.filter((i: any) => i.status === 'DISPUTED').length,
          cancelled:      all.filter((i: any) => i.status === 'CANCELLED').length,
          totalRevenue:   paid.reduce((s: number, i: any) =>
                            s + Number(i.amountPaid ?? i.totalAmount ?? 0), 0),
          pendingRevenue: sent.reduce((s: number, i: any) =>
                            s + Number(i.totalAmount ?? 0), 0),
        });
      }
    });

    this.dashboardService.getMyLoans(0, 100).subscribe({
      next: (page) => {
        const all = page.content;
        this.allLoans.set(all);
        this.loanStats.set({
          total:   all.length,
          applied: all.filter((l: any) => l.status === 'APPLIED').length,
          active:  all.filter((l: any) => l.status === 'ACTIVE').length,
          closed:  all.filter((l: any) => l.status === 'CLOSED').length,
          rejected:all.filter((l: any) => l.status === 'REJECTED').length,
        });
      }
    });
  }

  getBarWidth(amount: number): number {
    const max = this.maxAmount();
    if (!max) return 0;
    return (Number(amount) / max) * 100;
  }

  getLoanProgress(): number {
    const loan = this.activeLoan();
    if (!loan?.totalRepayableAmount) return 0;
    return (Number(loan.amountRepaid) / Number(loan.totalRepayableAmount)) * 100;
  }

}