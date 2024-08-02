import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { PlantService } from '../../services/plant.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

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

  constructor(private fb: FormBuilder, private plantService: PlantService) {
    this.plantSearchForm = this.fb.group({
      query: ['']
    });
  }

  ngOnInit(): void {
    this.searchResults$ = this.plantSearchForm.get('query')!.valueChanges.pipe(
      tap((query: string) => console.log('Search query:', query)),
      switchMap((query: string) => this.plantService.searchPlants(query))
    );
  }

  selectPlant(plant: any): void {
    console.log('Selected plant:', plant);
  }
}

