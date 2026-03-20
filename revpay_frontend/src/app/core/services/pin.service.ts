import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/auth.models';

const API = 'http://localhost:8080/api/users';

export interface PinStatusResponse { pinSet: boolean; pinLength: number; }

@Injectable({ providedIn: 'root' })
export class PinService {
  private http = inject(HttpClient);

  getPinStatus(): Observable<PinStatusResponse> {
    return this.http.get<ApiResponse<PinStatusResponse>>(`${API}/pin-status`)
      .pipe(map(r => r.data));
  }

  setPin(pin: string, confirmPin: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API}/set-pin`, { pin, confirmPin })
      .pipe(map(r => r.data));
  }

  verifyPin(pin: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API}/verify-pin`, { pin })
      .pipe(map(r => r.data));
  }

  changePin(oldPin: string, newPin: string, confirmPin: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API}/change-pin`, { oldPin, newPin, confirmPin })
      .pipe(map(r => r.data));
  }
}
