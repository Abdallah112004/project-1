// guards/login.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../service/login.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    // لو في توكن صالح
    if (token && !this.loginService.isTokenExpired(token)) {
      const user = this.loginService.getCurrentUser();

      // لو العميل يروح للبروفايل
      if (user?.role === 'client') {
        this.router.navigate(['/profile', user._id]);
        return false;
      }

      // لو الأدمن يروح للـ administration
      if (user?.role === 'admin') {
        this.router.navigate(['/administration']);
        return false;
      }

      // لو في حالة تانية (مثلاً role مش معروف)
      this.router.navigate(['/login']);
      return false;
    }

    // لو مفيش توكن أو منتهي، يسمح بدخول صفحة login
    return true;
  }
}
