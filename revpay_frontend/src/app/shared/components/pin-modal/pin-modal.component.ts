import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PinService } from '../../../core/services/pin.service';

@Component({
  selector: 'app-pin-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (visible) {
      <div class="overlay" (click)="onCancel()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="lock-icon">🔐</span>
            <h2>Enter Transaction PIN</h2>
            <p>Confirm your identity to proceed</p>
          </div>

          @if (loadingLength()) {
            <div class="loading-boxes">
              <div class="skeleton-box"></div>
              <div class="skeleton-box"></div>
              <div class="skeleton-box"></div>
              <div class="skeleton-box"></div>
            </div>
          } @else {
            @if (error()) {
              <div class="error-msg">⚠️ {{ error() }}</div>
            }

            <div class="pin-inputs">
              @for (i of pinBoxes(); track i) {
                <input
                  type="password"
                  inputmode="numeric"
                  maxlength="1"
                  class="pin-box"
                  [class.filled]="pin()[i] !== ''"
                  [value]="pin()[i]"
                  (input)="onInput($event, i)"
                  (keydown)="onKeydown($event, i)"
                  [id]="'pin-' + i"
                />
              }
            </div>

            <div class="actions">
              <button class="cancel-btn" (click)="onCancel()">Cancel</button>
              <button class="confirm-btn"
                [disabled]="fullPin().length < pinLength() || loading()"
                (click)="onConfirm()">
                {{ loading() ? 'Verifying...' : 'Confirm' }}
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }
    .modal {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 2rem;
      width: 360px;
      text-align: center;
    }
    .lock-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    h2 { color: #f1f5f9; font-size: 1.2rem; margin-bottom: 0.25rem; }
    p { color: #64748b; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .error-msg {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 10px;
      padding: 0.75rem;
      color: #f87171;
      font-size: 0.8rem;
      margin-bottom: 1rem;
    }
    .pin-inputs {
      display: flex; gap: 0.6rem; justify-content: center; margin-bottom: 1.5rem;
    }
    .pin-box {
      width: 52px; height: 58px;
      background: rgba(255,255,255,0.06);
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: #fff;
      font-size: 1.5rem;
      text-align: center;
      outline: none;
      transition: border-color 0.2s;
    }
    .pin-box:focus { border-color: #3b82f6; }
    .pin-box.filled { border-color: #22c55e; }
    .loading-boxes {
      display: flex; gap: 0.6rem; justify-content: center; margin-bottom: 1.5rem;
    }
    .skeleton-box {
      width: 52px; height: 58px;
      background: rgba(255,255,255,0.06);
      border: 2px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      animation: pulse 1.2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    .actions { display: flex; gap: 0.75rem; }
    .cancel-btn {
      flex: 1; padding: 0.75rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; color: #94a3b8;
      cursor: pointer; font-size: 0.9rem;
    }
    .confirm-btn {
      flex: 1; padding: 0.75rem;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border: none; border-radius: 12px;
      color: #fff; cursor: pointer; font-size: 0.9rem; font-weight: 600;
    }
    .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class PinModalComponent implements OnChanges {
  @Input() visible = false;
  @Output() confirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  private pinService = inject(PinService);

  pinLength = signal(6); // default until fetched
  pinBoxes = signal<number[]>([0, 1, 2, 3, 4, 5]);
  pin = signal<string[]>(['', '', '', '', '', '']);
  loading = signal(false);
  loadingLength = signal(false);
  error = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true) {
      this.fetchPinLength();
    }
  }

  private fetchPinLength() {
    this.loadingLength.set(true);
    this.pinService.getPinStatus().subscribe({
      next: (status) => {
        const len = status.pinLength > 0 ? status.pinLength : 6;
        this.pinLength.set(len);
        this.pinBoxes.set(Array.from({ length: len }, (_, i) => i));
        this.pin.set(Array(len).fill(''));
        this.loadingLength.set(false);
      },
      error: () => {
        // fallback to 6 on error
        this.pinLength.set(6);
        this.pinBoxes.set([0, 1, 2, 3, 4, 5]);
        this.pin.set(['', '', '', '', '', '']);
        this.loadingLength.set(false);
      }
    });
  }

  fullPin() {
    return this.pin().join('');
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    const updated = [...this.pin()];
    updated[index] = val;
    this.pin.set(updated);
    this.error.set(null);

    if (val && index < this.pinLength() - 1) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  }

  onKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      const updated = [...this.pin()];
      if (updated[index] === '' && index > 0) {
        updated[index - 1] = '';
        this.pin.set(updated);
        document.getElementById(`pin-${index - 1}`)?.focus();
      } else {
        updated[index] = '';
        this.pin.set(updated);
      }
    }
  }

  onConfirm() {
    const p = this.fullPin();
    if (p.length < this.pinLength()) return;
    this.loading.set(true);
    this.confirmed.emit(p);
  }

  onCancel() {
    this.reset();
    this.cancelled.emit();
  }

  setError(msg: string) {
    this.error.set(msg);
    this.loading.set(false);
    this.pin.set(Array(this.pinLength()).fill(''));
    document.getElementById('pin-0')?.focus();
  }

  reset() {
    this.pin.set(Array(this.pinLength()).fill(''));
    this.error.set(null);
    this.loading.set(false);
  }
}
