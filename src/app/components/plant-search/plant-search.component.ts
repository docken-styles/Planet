import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { PlantService } from '../../services/plant.service';
import { MyPlantsService } from '../../services/my-plants.service'; // Import MyPlantsService
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-plant-search',
  templateUrl: './plant-search.component.html',
  styleUrls: ['./plant-search.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatListModule],
})
export class PlantSearchComponent implements OnInit {
  plantSearchForm: FormGroup;
  searchResults$!: Observable<any[]>;
  myPlants: any[] = []; // Define the myPlants property to store selected plants

  constructor(
    private fb: FormBuilder,
    private plantService: PlantService,
    private myPlantsService: MyPlantsService // Inject MyPlantsService
  ) {
    this.plantSearchForm = this.fb.group({
      query: [''],
    });
  }

  ngOnInit(): void {
    this.searchResults$ = this.plantSearchForm.get('query')!.valueChanges.pipe(
      tap((query: string) => console.log('Search query:', query)),
      switchMap((query: string) =>
        this.plantService.searchPlants(query).pipe(
          tap((data) => console.log('Search Results:', data)) // Log search results
        )
      )
    );

    // Fetch the list of "My Plants" from Juno
    this.fetchMyPlants();
  }

  selectPlant(plant: any): void {
    console.log('Selected plant object:', plant); // Log the entire plant object
    console.log('Selected plant ID:', plant.id); // Log the plant ID if it exists

    this.myPlants.push(plant); // Add the selected plant to the myPlants array

    if (plant && plant.id) {
      this.addToMyPlants(plant); // Trigger the method to add the plant to Juno
    } else {
      console.error('No vegetable_id found for selected plant');
    }
  }

  addToMyPlants(plant: any): void {
    this.myPlantsService.addPlantToMyList(plant).subscribe({
      next: (response) => {
        console.log('Plant added to Juno:', response);
      },
      error: (error) => {
        console.error('Error adding plant to Juno:', error);
      },
      complete: () => {
        console.log('Request to add plant to Juno complete');
      },
    });
  }

  fetchMyPlants(): void {
    this.myPlantsService.getMyPlantsList().subscribe({
      next: (response: any) => {
        this.myPlants = response; // Assuming the response is an array
        console.log('My Plants:', this.myPlants);
      },
      error: (error) => {
        console.error('Error fetching My Plants from Juno:', error);
      },
    });
  }
}

