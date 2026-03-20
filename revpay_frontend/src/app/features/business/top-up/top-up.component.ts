import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { PaymentMethodResponse } from '../../../core/models/dashboard.models';
import { PinModalComponent } from '../../../shared/components/pin-modal/pin-modal.component';

@Component({
  selector: 'app-top-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PinModalComponent],
  templateUrl: './top-up.component.html',
  styleUrl: './top-up.component.css'
})
export class TopUpComponent implements OnInit {
  @ViewChild('pinModal') pinModal!: PinModalComponent;

  private fb = inject(FormBuilder);
  private dashboardService = inject(DashboardService);

  paymentMethods = signal<PaymentMethodResponse[]>([]);
  selectedCard = signal<number>(0);
  showAddCard = signal(false);
  loading = signal(false);
  addingCard = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  showPin = signal(false);

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

  ngOnInit() { this.loadCards(); }

  loadCards() {
    this.dashboardService.getPaymentMethods().subscribe({
      next: (data) => this.paymentMethods.set(data),
      error: (err) => console.error('Failed to load cards:', err)
    });
  }

  isCardSelected(id: number): boolean { return this.selectedCard() === id; }

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
    this.error.set(null);
    this.showPin.set(true);
  }

  onPinConfirmed(pin: string) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);
    this.dashboardService.topUp({
      amount: this.topUpForm.value.amount!,
      paymentMethodId: this.selectedCard(),
      transactionPin: pin
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.showPin.set(false);
        this.success.set(true);
        this.topUpForm.reset({ amount: 0 });
        this.selectedCard.set(0);
        this.pinModal.reset();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Top-up failed';
        this.pinModal.setError(msg);
        if (!msg.toLowerCase().includes('pin')) {
          this.showPin.set(false);
          this.error.set(msg);
        }
      }
    });
  }
}
