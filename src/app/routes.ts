import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ModalComponent } from './components/modal/modal.component';
import { TableComponent } from './components/table/table.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'modal', component: ModalComponent },
    { path: 'table', component: TableComponent }
];

