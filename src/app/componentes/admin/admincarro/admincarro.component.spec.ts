import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmincarroComponent } from './admincarro.component';

describe('AdmincarroComponent', () => {
  let component: AdmincarroComponent;
  let fixture: ComponentFixture<AdmincarroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmincarroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmincarroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
