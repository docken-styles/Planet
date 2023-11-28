import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { initJuno } from "@junobuild/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, HomeComponent],
  standalone: true,
})
export class AppComponent implements OnInit {
  title = 'diary';

  async ngOnInit() {
    // TODO: STEP_1_INITIALIZATION
    await initJuno({
      satelliteId: 'tiprb-oiaaa-aaaal-acywq-cai'
    })
  }
}