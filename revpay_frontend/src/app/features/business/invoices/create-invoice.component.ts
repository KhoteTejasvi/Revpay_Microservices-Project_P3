import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';


@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.css'
})
export class CreateInvoiceComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  invoiceNumber = signal('');

  form = this.fb.group({
    recipientEmail: ['', [Validators.required, Validators.email]],
    issueDate: ['', Validators.required],
    dueDate: ['', Validators.required],
    taxRate: [0, [Validators.min(0), Validators.max(100)]],
    notes: [''],
    items: this.fb.array([this.newItem()])
  });

  get items(): FormArray { return this.form.get('items') as FormArray; }

  newItem() {
    return this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addItem() { this.items.push(this.newItem()); }

  removeItem(i: number) {
    if (this.items.length > 1) this.items.removeAt(i);
  }

  getLineTotal(i: number): number {
    const item = this.items.at(i).value;
    return (item.quantity ?? 0) * (item.unitPrice ?? 0);
  }

  subtotal(): number {
    return this.items.controls.reduce((sum, _, i) => sum + this.getLineTotal(i), 0);
  }

  taxAmount(): number {
    const rate = this.form.get('taxRate')?.value ?? 0;
    return this.subtotal() * (rate / 100);
  }

  grandTotal(): number {
    return this.subtotal() + this.taxAmount();
  }

  private dashboardService = inject(DashboardService);
  
  onSubmit() {
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }
  this.loading.set(true);
  this.error.set(null);

  const val = this.form.value;
  const payload = {
    recipientEmail: val.recipientEmail,
    issueDate: val.issueDate,
    dueDate: val.dueDate,
    taxRate: val.taxRate ?? 0,
    notes: val.notes,
    currency: 'USD',
    items: val.items?.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }))
  };

  this.dashboardService.createInvoice(payload).subscribe({
    next: (inv) => {
      this.loading.set(false);
      this.success.set(true);
      this.invoiceNumber.set(inv.invoiceNumber);
      this.form.reset({ taxRate: 0, items: [this.newItem().value] });
    },
    error: (err) => {
      this.loading.set(false);
      this.error.set(err?.error?.message ?? 'Failed to create invoice');
    }
  });
}
}