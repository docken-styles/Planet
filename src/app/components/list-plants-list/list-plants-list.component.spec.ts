import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPlantListComponent } from './list-plant-list.component';

describe('ListPlantListComponent', () => {
  let component: ListPlantListComponent;
  let fixture: ComponentFixture<ListPlantListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListPlantListComponent]
    });
    fixture = TestBed.createComponent(ListPlantListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
