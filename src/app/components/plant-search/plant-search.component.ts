import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { TrefleService } from '../../services/trefle.service'; // Make sure this path is correct

@Component({
  selector: 'app-plant-search',
  templateUrl: './plant-search.component.html',
  styleUrls: ['./plant-search.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
  ],
  providers: [TrefleService]
})
export class PlantSearchComponent {
  plantSearchForm: FormGroup;
  searchResults: any[] = [];

  constructor(private fb: FormBuilder, private trefleService: TrefleService) {
    this.plantSearchForm = this.fb.group({
      query: ['']
    });

    this.plantSearchForm.get('query')?.valueChanges.subscribe(query => {
      if (query) {
        this.trefleService.searchPlants(query).subscribe(results => {
          this.searchResults = results;
        });
      } else {
        this.searchResults = [];
      }
    });
  }

  selectPlant(plant: any) {
    console.log('Selected plant:', plant);
  }
}

