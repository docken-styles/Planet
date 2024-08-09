import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { PlantService } from '../../services/plant.service';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-plant-search',
  templateUrl: './plant-search.component.html',
  styleUrls: ['./plant-search.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatListModule]
})
export class PlantSearchComponent implements OnInit {
  plantSearchForm: FormGroup;
  searchResults$!: Observable<any[]>;
  myPlants: any[] = [];  // Define the myPlants property to store selected plants

  constructor(private fb: FormBuilder, private plantService: PlantService, private http: HttpClient) { // Inject HttpClient
    this.plantSearchForm = this.fb.group({
      query: ['']
    });
  }

  ngOnInit(): void {
    this.searchResults$ = this.plantSearchForm.get('query')!.valueChanges.pipe(
      tap((query: string) => console.log('Search query:', query)),
      switchMap((query: string) => this.plantService.searchPlants(query).pipe(
        tap(data => console.log('Search Results:', data)) // Add this line to log search results
      ))
    );
     // Fetch the list of "My Plants" from the backend
    this.fetchMyPlants();
  }


  selectPlant(plant: any): void {
    console.log('Selected plant object:', plant); // This will log the entire plant object
    console.log('Selected plant ID:', plant.id); // This will log the plant ID if it exists

    this.myPlants.push(plant);  // Add the selected plant to the myPlants array

    if (plant && plant.id) {
        this.addToMyPlants(plant.id);  // Trigger the method to add the plant to the database
    } else {
        console.error('No vegetable_id found for selected plant');
    }
}


  addToMyPlants(vegetable_id: number): void {
    const payload = { vegetable_id: vegetable_id };
    console.log('Payload:', payload);  // Log the payload to check if it's correct

    this.http.post('http://localhost:5000/api/my-plants', payload)
    .subscribe({
      next: (response) => {
        console.log('Response from server:', response);
      },
      error: (error) => {
        console.error('Error adding plant:', error);
      },
      complete: () => {
        console.log('Request complete');
      }
    });
  }
  
  fetchMyPlants(): void {
    this.http.get('http://localhost:5000/api/my-plants').subscribe({
        next: (response: any) => {
            this.myPlants = response;  // Assuming the response is an array
            console.log('My Plants:', this.myPlants);
        },
        error: (error) => {
            console.error('Error fetching My Plants:', error);
        }
    });
  }
}

