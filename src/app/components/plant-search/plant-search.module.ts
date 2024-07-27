// src/app/components/plant-search/plant-search.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

import { PlantSearchComponent } from './plant-search.component';

@NgModule({
  declarations: [PlantSearchComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule
  ],
  exports: [PlantSearchComponent]
})
export class PlantSearchModule { }

