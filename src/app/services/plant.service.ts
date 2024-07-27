import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlantService {
  private apiUrl = 'https://trefle.io/api/v1/plants/search';
  private token = environment.trefleApiToken;

  constructor(private http: HttpClient) { }

  searchPlants(query: string): Observable<any> {
    const url = `${this.apiUrl}?token=${this.token}&q=${query}`;
    return this.http.get(url).pipe(
      map((response: any) => response.data)  // Adjust according to Trefle API response
    );
  }
}

