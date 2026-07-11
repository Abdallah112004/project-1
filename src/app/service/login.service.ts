import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import {
  User,
  LoginCredentials,
  LoginResponse,
  DecodedToken,
} from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  // ====== المفاتيح المستخدمة في localStorage ======
  private readonly userKey = 'userData';
  private readonly tokenKey = 'token';
  private readonly roleKey = 'userRole';

  // ====== رابط الـ API (تم التصحيح) ======
  private readonly apiUrl = 'http://localhost:3000/api/auth'; // <-- تم التصحيح

  // ====== BehaviorSubjects للمتابعة ======
  private userBehaviorSubject = new BehaviorSubject<User | null>(
    this.getUserFromLocalStorage()
  );
  user$ = this.userBehaviorSubject.asObservable();

  private loggedIn = new BehaviorSubject<boolean>(
    !!localStorage.getItem(this.tokenKey)
  );
  isLoggedIn$ = this.loggedIn.asObservable();

  private userRole = new BehaviorSubject<string | null>(
    this.getUserRoleFromStorage()
  );
  userRole$ = this.userRole.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const savedUser = this.getUserFromLocalStorage();
    if (savedUser) {
      this.userBehaviorSubject.next(savedUser);
      this.loggedIn.next(true);
      this.userRole.next(savedUser.role);
    }
  }

  // ====== دالة للحصول على Headers مع التوكن ======
  private getAuthHeaders(): HttpHeaders {
    const token = this.getTokenFromLocalStorage();
    return new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ====== التحقق من الصلاحيات ======
  hasPermission(permission: string): boolean {
    const userRole = this.getUserRole();

    const permissions: { [key: string]: string[] } = {
      admin: [
        'manage_users',
        'manage_criteria',
        'view_archive',
        'view_dashboard',
        'access_admin_dashboard',
        'manage_admins'
      ],
      client: ['view_dashboard', 'access_user_dashboard'],
    };

    return permissions[userRole!]?.includes(permission) || false;
  }

  canManageUsers(): boolean {
    return this.hasPermission('manage_users');
  }

  canManageCriteria(): boolean {
    return this.hasPermission('manage_criteria');
  }

  canViewArchive(): boolean {
    return this.hasPermission('view_archive');
  }

  canViewDashboard(): boolean {
    return this.hasPermission('view_dashboard');
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isClient(): boolean {
    return this.getUserRole() === 'client';
  }

  // ====== التوجيه بناءً على الدور ======
  redirectBasedOnRole(): void {
    const userRole = this.getUserRole();

    if (userRole === 'admin') {
      this.router.navigate(['/dashboard-admin']);
    } else if (userRole === 'client') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  // ====== تسجيل الدخول ======
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response: LoginResponse) => {
          if (response.success && response.token) {
            // حفظ التوكن
            localStorage.setItem(this.tokenKey, response.token);

            // حفظ بيانات المستخدم
            if (response.user) {
              this.setUser(response.user);
              localStorage.setItem(this.roleKey, response.user.role);
              this.userRole.next(response.user.role);
            }

            this.loggedIn.next(true);
            this.redirectBasedOnRole();
          }
        }),
        catchError((error: unknown) => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  // ====== تسجيل الخروج ======
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.roleKey);
    this.userBehaviorSubject.next(null);
    this.loggedIn.next(false);
    this.userRole.next(null);
    this.router.navigate(['/login']);
  }

  // ====== الحصول على دور المستخدم ======
  getUserRole(): string | null {
    return this.userRole.value;
  }

  getUserRoleFromStorage(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getCurrentUser(): User | null {
    return this.userBehaviorSubject.value;
  }

  // ====== فك تشفير التوكن ======
  decodeToken(): DecodedToken | null {
    const token = this.getTokenFromLocalStorage();
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded;
      } catch (error) {
        console.error('Invalid token:', error);
        return null;
      }
    }
    return null;
  }

  // ====== جلب المستخدم من localStorage ======
  getUserFromLocalStorage(): User | null {
    const userDataStr = localStorage.getItem(this.userKey);
    if (!userDataStr || userDataStr === 'undefined') return null;

    try {
      return JSON.parse(userDataStr) as User;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  }

  // ====== حفظ بيانات المستخدم ======
  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    localStorage.setItem(this.roleKey, user.role);
    this.userBehaviorSubject.next(user);
    this.userRole.next(user.role);
    this.loggedIn.next(true);
  }

  // ====== جلب التوكن من localStorage ======
  getTokenFromLocalStorage(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // ====== التحقق من صلاحية التوكن ======
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  // ====== التحقق من صحة التوكن عند كل طلب ======
  isAuthenticated(): boolean {
    const token = this.getTokenFromLocalStorage();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }
}
