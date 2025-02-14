import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminsaleComponent } from './adminsale.component';

describe('AdminsaleComponent', () => {
  let component: AdminsaleComponent;
  let fixture: ComponentFixture<AdminsaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminsaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminsaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
