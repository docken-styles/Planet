import { Component, OnInit } from '@angular/core';
import { ListPlantsService } from '../../services/list-plants.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-plants-list',
  templateUrl: './list-plants-list.component.html',
  styleUrls: ['./list-plants-list.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ListPlantsListComponent implements OnInit {
  entries: any[] = [];

  constructor(private listPlantsService: ListPlantsService) {}

  ngOnInit(): void {
    this.loadPlants();
  }

loadPlants(): void {
  this.listPlantsService.getListPlantsEntries().subscribe(
    (response: any) => {
      console.log('Response from backend:', response); // This will show the full response
      this.entries = response.data;  // Extract the 'data' array
      console.log('Plants loaded:', this.entries);
    },
    (error: any) => {
      console.error('Error loading plants:', error);
    }
  );
}

  deleteEntry(id: number): void {
    this.listPlantsService.deleteListPlantsEntry(id).subscribe(() => {
      this.entries = this.entries.filter(entry => entry.id !== id);
    });
  }
}

