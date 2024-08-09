import { Injectable } from '@angular/core';
import { setDoc, getDoc, deleteDoc, listDocs } from '@junobuild/core';
import { Observable, from } from 'rxjs';
import { nanoid } from 'nanoid';

@Injectable({
  providedIn: 'root',
})
export class MyPlantsService {
  constructor() {}

  // Method to add a plant to the Juno "Plants" collection
  addPlantToMyList(plantData: {
    id: number;
    vegetable: string;
  }): Observable<any> {
    return from(this.addPlantToJuno(plantData));
  }

  private async addPlantToJuno(plantData: {
    id: number;
    vegetable: string;
  }): Promise<any> {
    try {
      const key = nanoid();

      await setDoc({
        collection: 'Plants', // Juno collection name
        doc: {
          key,
          data: {
            id: plantData.id, // Ensure this matches your Juno collection's field
            vegetable: plantData.vegetable,
          },
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding plant to Juno:', error);
      throw error;
    }
  }

  // Method to delete a plant from the Juno "Plants" collection
  deletePlantFromMyList(plantKey: string): Observable<any> {
    return from(this.deletePlant(plantKey));
  }

  private async deletePlant(plantKey: string): Promise<any> {
    try {
      // Retrieve the document by its key to get the version
      const doc = await getDoc({
        collection: 'Plants',
        key: plantKey,
      });

      if (!doc) {
        throw new Error('Document not found');
      }

      // Delete the document, passing the full document object including version
      await deleteDoc({
        collection: 'Plants',
        doc, // Includes key, data, and version
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting plant from Juno:', error);
      throw error;
    }
  }

  // Method to retrieve plants from Juno "Plants" collection
  getMyPlantsList(): Observable<any[]> {
    return from(this.getPlantsFromJuno());
  }

  private async getPlantsFromJuno(): Promise<any[]> {
    try {
      const { items } = await listDocs<any>({
        collection: 'Plants',
      });

      return items.map((doc) => doc.data);
    } catch (error) {
      console.error('Error retrieving plants from Juno:', error);
      throw error;
    }
  }
}

