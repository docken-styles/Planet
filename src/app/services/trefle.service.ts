import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TrefleService {
  private apiUrl = 'https://trefle.io/api/v1';
  private token = 'YOUR_TREFLE_TOKEN';  // Replace with your Trefle token

  constructor(private http: HttpClient) {}

  searchPlants(query: string): Observable<any> {
    const url = `${this.apiUrl}/plants/search?q=${query}&token=${this.token}`;
    return this.http.get(url).pipe(
      map((response: any) => response.data)
    );
  }

  getPlant(id: number): Observable<any> {
    const url = `${this.apiUrl}/plants/${id}?token=${this.token}`;
    return this.http.get(url).pipe(
      map((response: any) => response.data)
    );
  }
}

