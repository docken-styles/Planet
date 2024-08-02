import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { PlantService } from '../../services/plant.service'; // Use the correct service

@Component({
  selector: 'app-plant-search',
  templateUrl: './plant-search.component.html',
  styleUrls: ['./plant-search.component.scss'],
  standalone: true, // Mark this component as standalone
})
export class PlantSearchComponent implements OnInit {
  plantSearchForm: FormGroup;
  searchResults$: Observable<any[]> = new Observable<any[]>(); // Initialize directly

  constructor(private fb: FormBuilder, private plantService: PlantService) { // Use PlantService here
    this.plantSearchForm = this.fb.group({
      query: ['']
    });
  }

  ngOnInit(): void {
    this.searchResults$ = this.plantSearchForm.get('query')!.valueChanges.pipe(
      tap(query => console.log('Search query:', query)),
      switchMap(query => this.plantService.searchPlants(query))
    );
  }

  selectPlant(plant: any): void {
    console.log('Selected plant:', plant);
  }
}

