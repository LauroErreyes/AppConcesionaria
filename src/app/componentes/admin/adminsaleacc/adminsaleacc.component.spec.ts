import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminsaleaccComponent } from './adminsaleacc.component';

describe('AdminsaleaccComponent', () => {
  let component: AdminsaleaccComponent;
  let fixture: ComponentFixture<AdminsaleaccComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminsaleaccComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminsaleaccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
