import { CommonModule, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { DocsService } from '../../services/docs.service';
import { ModalComponent } from '../modal/modal.component';
import { TableComponent } from '../table/table.component';
import { signIn, signOut } from "@junobuild/core";
import { NotificationService } from '../../services/notification.service';
import { PlantSearchComponent } from '../plant-search/plant-search.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    HttpClientModule,
    ModalComponent,
    TableComponent,
    PlantSearchComponent // Add PlantSearchComponent here
  ],
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private docsService = inject(DocsService);
  private notificationService = inject(NotificationService);
  readonly signedIn = this.authService.signedIn;
  notifications: any[] = [];
  notificationForm: FormGroup;
  editingNotification: any = null;  // Track the notification being edited

  readonly signIn = signIn;
  readonly signOut = signOut;

  constructor(private fb: FormBuilder) {
    this.notificationForm = this.fb.group({
      title: [''],
      message: [''],
      date: [''],
      time: ['']
    });
  }

  ngOnInit(): void {
    console.log('HomeComponent initialized');
    this.loadNotifications();
  }

  openModal() {
    const dialogRef = this.dialog.open(ModalComponent, {
      height: '400px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(() => this.docsService.reload());
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe((data: any[]) => {
      console.log('Notifications loaded:', data);
      this.notifications = data;
    }, error => {
      console.error('Error loading notifications:', error);
    });
  }

  createNotification(): void {
    if (this.editingNotification) {
      this.notificationService.updateNotification(this.editingNotification.id, this.notificationForm.value).subscribe(() => {
        this.loadNotifications();
        this.editingNotification = null;
        this.notificationForm.reset();
      }, error => {
        console.error('Error updating notification:', error);
      });
    } else {
      const formValues = this.notificationForm.value;
      const date = formValues.date;
      const time = formValues.time;

      const dateTime = new Date(date);
      const timeParts = time.split(':');
      dateTime.setHours(timeParts[0], timeParts[1]);

      const newNotification = {
        title: formValues.title,
        message: formValues.message,
        time: dateTime.toISOString()
      };
      this.notificationService.createNotification(newNotification).subscribe((notification: any) => {
        this.notifications.push(notification);
        this.notificationForm.reset();  // Reset the form
        this.loadNotifications();  // Reload notifications to reflect the newly created one
      }, error => {
        console.error('Error creating notification:', error);
      });
    }
  }

  editNotification(notification: any): void {
    const date = new Date(notification.time);
    const time = date.toTimeString().substring(0, 5);

    this.editingNotification = notification;
    this.notificationForm.patchValue({
      title: notification.title,
      message: notification.message,
      date: date,
      time: time
    });
  }

  deleteNotification(id: number): void {
    this.notificationService.deleteNotification(id).subscribe(() => {
      this.notifications = this.notifications.filter(notification => notification.id !== id);
      this.loadNotifications();  // Reload notifications after deletion
    }, error => {
      console.error('Error deleting notification:', error);
    });
  }
}

