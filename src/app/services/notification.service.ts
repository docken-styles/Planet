import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:5000/api/notifications';

  constructor(private http: HttpClient) { }

  getNotifications(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createNotification(notification: any): Observable<any> {
    return this.http.post(this.apiUrl, notification);
  }

  deleteNotification(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

