import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { clientRedirectGuardGuard } from './client-redirect-guard.guard';

describe('clientRedirectGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => clientRedirectGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
