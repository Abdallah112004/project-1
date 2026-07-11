import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../service/login.service';

@Injectable({
  providedIn: 'root',
})
export class ClientRedirectGuard implements CanActivate {
  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    // تحقق من صلاحية التوكن
    if (this.loginService.isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
      return false;
    }

    const user = this.loginService.getCurrentUser();

    // إذا كان العميل يحاول الوصول إلى dashboard أو أي صفحة غير مسموح بها
    if (user?.role === 'client') {
      // توجه إلى البروفايل
      this.router.navigate(['/profile', user._id]);
      return false;
    }

    return true;
  }
}
