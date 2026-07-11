import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  isSidebarOpen = false;
  userRole: string | null = null;
  userName: string | null = null;
  userId: string | null = null;
  pendingPaymentsCount: number = 0;
  private resizeObserver: ResizeObserver | null = null;

  // ====== صلاحيات القائمة ======
  private menuPermissions: { [key: string]: string[] } = {
    profile: ['client', 'admin', 'manager', 'employee'],
    administration: ['admin'],
  };

  constructor(
    private router: Router,
    private loginService: LoginService,
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadUserData();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkScreenSize();
      });

      this.resizeObserver.observe(document.body);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  @HostListener('window:orientationchange')
  onOrientationChange(): void {
    setTimeout(() => this.checkScreenSize(), 100);
  }

  private checkScreenSize(): void {
    if (window.innerWidth >= 992) {
      this.isSidebarOpen = false;
    }
  }

  private loadUserData(): void {
    this.userRole = this.loginService.getUserRole();
    const currentUser = this.loginService.getCurrentUser();
    this.userName = currentUser?.fullname || currentUser?.username || 'مستخدم';
    this.userId = currentUser?._id || null;
    console.log('User ID:', this.userId);
    console.log('User Role:', this.userRole);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }

  // ====== التحقق من صلاحية عرض عنصر معين ======
  canShowItem(menuKey: string): boolean {
    const allowedRoles = this.menuPermissions[menuKey];
    if (!allowedRoles) return false;
    return allowedRoles.includes(this.userRole || '');
  }

  // ====== التحقق من الأدوار المختلفة ======
  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  isManager(): boolean {
    return this.userRole === 'manager';
  }

  isEmployee(): boolean {
    return this.userRole === 'employee';
  }

  isClient(): boolean {
    return this.userRole === 'client';
  }

  // ====== الحصول على اسم الدور بالعربية ======
  getRoleDisplayName(): string {
    const roleNames: { [key: string]: string } = {
      admin: 'مدير النظام',
      manager: 'مدير قسم',
      employee: 'موظف',
      client: 'عميل',
      user: 'مستخدم',
    };
    return this.userRole ? roleNames[this.userRole] || this.userRole : 'زائر';
  }

  // ====== الحصول على لون شارة الدور ======
  getRoleBadgeClass(): string {
    const badgeClasses: { [key: string]: string } = {
      admin: 'badge bg-danger',
      manager: 'badge bg-warning text-dark',
      employee: 'badge bg-info text-dark',
      client: 'badge bg-primary',
    };
    return this.userRole ? badgeClasses[this.userRole] || 'badge bg-secondary' : 'badge bg-secondary';
  }

  // ====== تسجيل الخروج ======
  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
