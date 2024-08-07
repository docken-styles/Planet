import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlantService {
  // Update the API URL to point to your local Flask server
  private apiUrl = 'http://localhost:5000/api/plants'; // Flask API for plant search

  constructor(private http: HttpClient) {}

  searchPlants(query: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(`${this.apiUrl}?query=${query}`, { headers }).pipe(
      map(response => response.data), // Adjusting to access the 'data' array in the response
      catchError(error => {
        console.error('API Error:', error);
        return throwError(error);
      })
    );
  }

  // New method for adding a new plant
  addPlant(plantData: { vegetable: string, transplant_weeks: string, days_to_maturity: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, plantData).pipe(
      catchError(error => {
        console.error('Error adding plant:', error);
        return throwError(error);
      })
    );
  }
}

