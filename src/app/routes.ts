import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ModalComponent } from './components/modal/modal.component';
import { TableComponent } from './components/table/table.component';
import { PlantSearchComponent } from './components/plant-search/plant-search.component'; // Import PlantSearchComponent
import { PlantAddComponent } from './components/add-plant/add-plant.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'modal', component: ModalComponent },
    { path: 'table', component: TableComponent },
    { path: 'plant-search', component: PlantSearchComponent },  // Add the route for PlantSearchComponent
    { path: 'add-plant', component: PlantAddComponent }
];

