import { TestBed } from '@angular/core/testing';

import { SaleaccService } from './saleacc.service';

describe('SaleaccService', () => {
  let service: SaleaccService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaleaccService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
