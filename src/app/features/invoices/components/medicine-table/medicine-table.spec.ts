import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicineTable } from './medicine-table';

describe('MedicineTable', () => {
  let component: MedicineTable;
  let fixture: ComponentFixture<MedicineTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineTable],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
