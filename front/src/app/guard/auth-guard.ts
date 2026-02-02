import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AccountService } from '../services/account/account.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  return accountService.isLogin().pipe(
    map((response) => {
      if (response === false || !response) {
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        router.navigate(['/login']);
        return false;
      }
      localStorage.setItem('role', response.roleId);
      return true;
    }),
    catchError((error) => {
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      router.navigate(['/login']);
      return of(false);
    })
  );
};
  