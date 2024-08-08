import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ListPlantsService {
  private apiUrl = 'http://localhost:5000/api/plants';
  private deleteUrl = 'http://localhost:5000/api/vegetable_maturity';

  constructor(private http: HttpClient) {}

  getListPlantsEntries(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteListPlantsEntry(id: number): Observable<any> {
    return this.http.delete(`${this.deleteUrl}/${id}`);
  }
}

