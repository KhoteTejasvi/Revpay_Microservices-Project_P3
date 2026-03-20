import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DashboardResponse, TransactionResponse,
  MoneyRequestResponse, PaymentMethodResponse, PageResponse
} from '../models/dashboard.models';
import { ApiResponse } from '../models/auth.models';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  // ── Dashboard ────────────────────────────────────────────
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<ApiResponse<DashboardResponse>>(`${API}/dashboard`)
      .pipe(map(r => r.data));
  }

  // ── Transactions ─────────────────────────────────────────
  getTransactionHistory(page = 0, size = 10): Observable<PageResponse<TransactionResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<TransactionResponse>>>(
      `${API}/transactions/history`, { params }
    ).pipe(map(r => r.data));
  }

  transfer(payload: {
    receiverEmail: string;
    amount: number;
    note?: string;
    description?: string;
    transactionPin: string;
  }): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API}/transactions/transfer`, payload)
      .pipe(map(r => r.data));
  }

  topUp(payload: { amount: number; paymentMethodId: number; description?: string; transactionPin: string }) {
    return this.http.post<ApiResponse<TransactionResponse>>(
      `${API}/transactions/top-up`, payload
    ).pipe(map(r => r.data));
  }

  // ── Money Requests ───────────────────────────────────────
  sendMoneyRequest(payload: { payerIdentifier: string; amount: number; message?: string }) {
    return this.http.post<ApiResponse<MoneyRequestResponse>>(
      `${API}/money-requests`, payload
    ).pipe(map(r => r.data));
  }

  getReceivedRequests(page = 0, size = 10): Observable<PageResponse<MoneyRequestResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<MoneyRequestResponse>>>(
      `${API}/money-requests/received`, { params }
    ).pipe(map(r => r.data));
  }

  getSentRequests(page = 0, size = 10): Observable<PageResponse<MoneyRequestResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<MoneyRequestResponse>>>(
      `${API}/money-requests/sent`, { params }
    ).pipe(map(r => r.data));
  }

  acceptRequest(id: number, transactionPin: string) {
    return this.http.post<ApiResponse<MoneyRequestResponse>>(
      `${API}/money-requests/${id}/accept`, { transactionPin }
    ).pipe(map(r => r.data));
  }

  rejectRequest(id: number) {
    return this.http.post<ApiResponse<MoneyRequestResponse>>(
      `${API}/money-requests/${id}/reject`, {}
    ).pipe(map(r => r.data));
  }

  // ── Payment Methods ──────────────────────────────────────
  getPaymentMethods(): Observable<PaymentMethodResponse[]> {
    return this.http.get<ApiResponse<PaymentMethodResponse[]>>(
      `${API}/payments/methods`
    ).pipe(map(r => r.data));
  }

  addPaymentMethod(payload: any) {
    return this.http.post<ApiResponse<PaymentMethodResponse>>(
      `${API}/payments/methods`, payload
    ).pipe(map(r => r.data));
  }

  deletePaymentMethod(id: number) {
    return this.http.delete<ApiResponse<void>>(`${API}/payments/methods/${id}`);
  }

  // ── Invoices ─────────────────────────────────────────────
  createInvoice(payload: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API}/invoices`, payload)
      .pipe(map(r => r.data));
  }

  getIssuedInvoices(page = 0, size = 10): Observable<PageResponse<any>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<any>>>(
      `${API}/invoices/issued`, { params }
    ).pipe(map(r => r.data));
  }

  getReceivedInvoices(page = 0, size = 10): Observable<PageResponse<any>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<any>>>(
      `${API}/invoices/received`, { params }
    ).pipe(map(r => r.data));
  }

  sendInvoice(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API}/invoices/${id}/send`, {})
      .pipe(map(r => r.data));
  }

  payInvoice(id: number, transactionPin: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API}/invoices/${id}/pay`, { transactionPin })
      .pipe(map(r => r.data));
  }

  disputeInvoice(id: number, reason: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API}/invoices/${id}/dispute`, { reason })
      .pipe(map(r => r.data));
  }

  cancelInvoice(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API}/invoices/${id}/cancel`, {})
      .pipe(map(r => r.data));
  }

  // ── Loans ─────────────────────────────────────────────────
  applyLoan(payload: { principalAmount: number; tenureMonths: number; purpose: string }): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API}/loans/apply`, payload)
      .pipe(map(r => r.data));
  }

  getMyLoans(page = 0, size = 10): Observable<PageResponse<any>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<any>>>(
      `${API}/loans`, { params }
    ).pipe(map(r => r.data));
  }

  repayEmi(loanId: number, emiId: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${API}/loans/${loanId}/emis/${emiId}/repay`, {}
    ).pipe(map(r => r.data));
  }

  // ── EMIs ──────────────────────────────────────────────────
  getEmiSchedule(loanId: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${API}/emis/loan/${loanId}`)
      .pipe(map(r => r.data));
  }

  payEmi(emiId: number, transactionPin: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API}/emis/${emiId}/pay`, { transactionPin })
      .pipe(map(r => r.data));
  }

  toggleAutoDebit(loanId: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${API}/emis/loan/${loanId}/auto-debit/toggle`, {})
      .pipe(map(r => r.data));
  }

exportTransactions(fromDate?: string, toDate?: string): Observable<any[]> {
  let params = new HttpParams();
  if (fromDate) params = params.set('fromDate', fromDate);
  if (toDate) params = params.set('toDate', toDate);
  return this.http.get<ApiResponse<any[]>>(
    `${API}/transactions/export`, { params })
    .pipe(map(r => r.data));
}

}