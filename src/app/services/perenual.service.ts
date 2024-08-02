import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerenualService {
  private apiUrl = 'https://perenual.com/api/v1/plants';

  constructor(private http: HttpClient) {}

  searchPlants(query: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.perenualApiToken}`
    });
    const url = `${this.apiUrl}?q=${query}`;
    return this.http.get<any>(url, { headers }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('API Error:', error);
        return throwError(error);
      })
    );
  }
}

