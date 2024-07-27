import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { TrefleService } from '../../services/trefle.service';

@Component({
  selector: 'app-plant-search',
  templateUrl: './plant-search.component.html',
  styleUrls: ['./plant-search.component.scss']
})
export class PlantSearchComponent {
  plantSearchForm: FormGroup;
  searchResults$: Observable<any[]>;

  constructor(private fb: FormBuilder, private trefleService: TrefleService) {
    this.plantSearchForm = this.fb.group({
      query: ['']
    });

    this.searchResults$ = this.plantSearchForm.get('query').valueChanges.pipe(
      debounceTime(300),
      switchMap(query => this.trefleService.searchPlants(query))
    );
  }

  selectPlant(plant: any) {
    console.log('Selected plant:', plant);
  }
}

