import { CommonModule, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { AuthService } from '../../services/auth.service';
import { DocsService } from '../../services/docs.service';
import { ModalComponent } from '../modal/modal.component';
import { TableComponent } from '../table/table.component';
import { signIn, signOut } from "@junobuild/core";
import { NotificationService } from '../../services/notification.service'; // Import the Notification Service

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule, // Add CommonModule here
    NgIf,
    MatButtonModule,
    ModalComponent,
    MatDialogModule,
    TableComponent,
    HttpClientModule // Add HttpClientModule here
  ],
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private docsService = inject(DocsService);
  private notificationService = inject(NotificationService); // Inject the Notification Service
  readonly signedIn = this.authService.signedIn;
  notifications: any[] = [];

  // TODO: STEP_2_AUTH_SIGN_IN
  readonly signIn = signIn;
  // TODO: STEP_3_AUTH_SIGN_OUT
  readonly signOut = signOut;

  ngOnInit(): void {
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
      this.notifications = data;
    });
  }

  createNotification(): void {
    const newNotification = {
      title: 'Test Notification',
      message: 'This is a test notification',
      time: new Date()
    };
    this.notificationService.createNotification(newNotification).subscribe((notification: any) => {
      this.notifications.push(notification);
    });
  }

  deleteNotification(id: string): void {
    this.notificationService.deleteNotification(id).subscribe(() => {
      this.notifications = this.notifications.filter(notification => notification.id !== id);
    });
  }
}

