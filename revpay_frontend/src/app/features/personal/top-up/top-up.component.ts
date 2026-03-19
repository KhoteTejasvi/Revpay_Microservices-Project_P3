import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { PaymentMethodResponse } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-top-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './top-up.html',
  styleUrl: './top-up.css'
})
export class TopUpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dashboardService = inject(DashboardService);

  paymentMethods = signal<PaymentMethodResponse[]>([]);
  selectedCard = signal<number>(0);
  showAddCard = signal(false);
  loading = signal(false);
  addingCard = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  quickAmounts = [10, 25, 50, 100, 200];

  cardForm = this.fb.group({
    maskedIdentifier: ['', Validators.required],
    provider: [''],
    expiryMonth: [''],
    expiryYear: ['']
  });

  topUpForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    this.loadCards();
  }

  loadCards() {
    this.dashboardService.getPaymentMethods().subscribe({
      next: (data) => this.paymentMethods.set(data),
      error: (err) => console.error('Failed to load cards:', err)
    });
  }

  isCardSelected(id: number): boolean {
    return this.selectedCard() === id;
  }

  isAmountSelected(amt: number): boolean {
    const val = this.topUpForm.get('amount')?.value;
    return val !== null && val !== undefined && Number(val) === amt;
  }

  addCard() {
    if (this.cardForm.invalid) return;
    this.addingCard.set(true);
    const val = this.cardForm.value;
    this.dashboardService.addPaymentMethod({
      type: 'CREDIT_CARD',
      maskedIdentifier: val.maskedIdentifier ?? '',
      provider: val.provider ?? '',
      expiryMonth: val.expiryMonth ?? '',
      expiryYear: val.expiryYear ?? '',
      isDefault: false
    }).subscribe({
      next: () => {
        this.addingCard.set(false);
        this.showAddCard.set(false);
        this.cardForm.reset();
        this.loadCards();
      },
      error: () => this.addingCard.set(false)
    });
  }

  onTopUp() {
    if (this.topUpForm.invalid || this.selectedCard() === 0) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    this.dashboardService.topUp({
      amount: this.topUpForm.value.amount!,
      paymentMethodId: this.selectedCard()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.topUpForm.reset({ amount: 0 });
        this.selectedCard.set(0);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Top-up failed');
      }
    });
  }
}