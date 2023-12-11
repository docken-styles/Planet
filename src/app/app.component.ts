import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { initJuno } from "@junobuild/core";
import { environment } from 'src/environments/environments';
// import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [HomeComponent, RouterModule],
  standalone: true,
})
export class AppComponent implements OnInit {
  title = 'Planet';

  async ngOnInit() {
    try {
      await initJuno({
      satelliteId: environment.satelliteId
    });
  } catch (error) {
      console.error('Error during Juno initialization:', error);
    }
  }
}
