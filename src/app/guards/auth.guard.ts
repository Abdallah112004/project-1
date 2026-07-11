import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LoginService } from '../service/login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
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

    // إذا كان العميل ويحاول الوصول إلى صفحة غير مسموح بها
    if (user?.role === 'client') {
      const allowedRoutes = ['profile', 'my-achievements', 'add-achievement', 'edit-achievement'];
      const currentRoute = state.url.split('/')[1]; // يأخذ أول جزء من المسار

      // إذا كانت الصفحة غير مسموحة للعميل، وجهه إلى البروفايل
      if (!allowedRoutes.includes(currentRoute) && currentRoute !== '') {
        this.router.navigate(['/profile', user._id]);
        return false;
      }
      return true;
    }

    return true;
  }
}
