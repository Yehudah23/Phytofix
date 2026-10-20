import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = localStorage.getItem('phytofix-token');
    const headers = new HttpHeaders({
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
    return firstValueFrom(this.http.request<T>(method, `${this.baseUrl}${path}`, { body, headers }));
  }
}
