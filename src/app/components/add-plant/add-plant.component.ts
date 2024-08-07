import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { PlantService } from '../../services/plant.service'; // Import the PlantService
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-add-plant',
  templateUrl: './add-plant.component.html',
  styleUrls: ['./add-plant.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatListModule]
})

export class PlantAddComponent implements OnInit {
  plantAddForm: FormGroup;

  constructor(private fb: FormBuilder, private plantService: PlantService) {
    this.plantAddForm = this.fb.group({
      vegetable: [''],
      transplant_weeks: [''],
      days_to_maturity: ['']
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.plantAddForm.valid) {
      const plantData = this.plantAddForm.value;
      this.plantService.addPlant(plantData).subscribe({
        next: (response) => {
          console.log('Plant added successfully:', response);
          this.plantAddForm.reset(); // Reset the form after successful submission
        },
        error: (error) => {
          console.error('Error adding plant:', error);
        }
      });
    } else {
      console.error('Form is invalid');
    }
  }
}
