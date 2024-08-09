import { Component, OnInit } from '@angular/core';
import { MyPlantsService } from '../../services/my-plants.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-my-plant',
  templateUrl: './delete-my-plant.component.html',
  styleUrls: ['./delete-my-plant.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class DeleteMyPlantComponent implements OnInit {
  myPlants: any[] = [];

  constructor(private myPlantsService: MyPlantsService) {}

  ngOnInit(): void {
    this.loadMyPlants();
  }

  loadMyPlants(): void {
    this.myPlantsService.getMyPlantsList().subscribe({
      next: (plants) => {
        this.myPlants = plants;
      },
      error: (error: any) => {
        console.error('Error loading My Plants:', error);
      },
    });
  }

  deletePlant(plant: any): void {
    const plantKey = `user_${plant.vegetable_id}`; // Assuming you used this key pattern
    this.myPlantsService.deletePlantFromMyList(plantKey).subscribe({
      next: () => {
        console.log('Plant deleted from Juno');
        this.loadMyPlants(); // Reload the list after deletion
      },
      error: (error: any) => {
        console.error('Error deleting plant:', error);
      },
    });
  }
}

