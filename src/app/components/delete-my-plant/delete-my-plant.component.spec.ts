import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteMyPlantComponent } from './delete-my-plant.component';

describe('DeleteMyPlantComponent', () => {
  let component: DeleteMyPlantComponent;
  let fixture: ComponentFixture<DeleteMyPlantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteMyPlantComponent]
    });
    fixture = TestBed.createComponent(DeleteMyPlantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
