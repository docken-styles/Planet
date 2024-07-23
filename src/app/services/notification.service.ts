import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private baseUrl = 'http://localhost:5000/api/notifications';

  constructor(private http: HttpClient) { }

  createNotification(notification: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, notification);
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  updateNotification(id: number, notification: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, notification);
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}

