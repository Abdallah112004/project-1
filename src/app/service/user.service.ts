// user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  User,
  Sector,
  addSector,
  Stats,
  ClientDashboard,
  DistributionReport,
  FilterOptions,
  PaginatedUsersResponse,
  TomorrowReservation,
  DailyRation,
  Reservation,
  Log,
  LoginCredentials,
  LoginResponse,
  BreadStats,
  MonthlyReport,
  FullReport,
  BreadQuantities,
  FreeClient,
  FreeClientReport,
  FreeClientStats,
  AddFreeClientData  
} from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class AdministrationService {
  // ====== الروابط الأساسية ======
  private baseUrl = 'http://localhost:3000/api';
  private usersUrl = `${this.baseUrl}/users`;
  private sectorsUrl = `${this.baseUrl}/sectors`;
  private breadUrl = `${this.baseUrl}/bread`;
  private reportsUrl = `${this.baseUrl}/reports`;
  private authUrl = `${this.baseUrl}/auth`;
  private logsUrl = `${this.baseUrl}/logs`;

  // ====== BehaviorSubject للمستخدم الحالي ======
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // محاولة استعادة المستخدم من localStorage عند بدء التطبيق
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('خطأ في قراءة بيانات المستخدم المحفوظة', e);
        localStorage.removeItem('user');
      }
    }
  }

  // ====== دوال المصادقة ======
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getAuthHeadersBlob(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `${token}`
    });
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap((response: LoginResponse) => {
        if (response.success && response.token) {
          localStorage.setItem('token', response.token);

          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        }
      })
    );
  }

  register(userData: Partial<User>): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getCurrentUserFromServer(): Observable<any> {
    return this.http.get(`${this.authUrl}/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          localStorage.setItem('user', JSON.stringify(response.data));
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // ====== 2. إدارة المستخدمين (Users Management) ======
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/all-users`, {
      headers: this.getAuthHeaders(),
    });
  }

  getUsersPaginated(options: FilterOptions): Observable<PaginatedUsersResponse> {
    let params = new HttpParams();
    if (options.searchTerm) params = params.set('search', options.searchTerm);
    if (options.sector) params = params.set('sector', options.sector);
    if (options.status) params = params.set('status', options.status);
    if (options.governorate) params = params.set('governorate', options.governorate);
    if (options.center) params = params.set('center', options.center);
    if (options.sortBy) params = params.set('sortBy', options.sortBy);
    if (options.sortOrder) params = params.set('sortOrder', options.sortOrder);
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());

    return this.http.get<PaginatedUsersResponse>(`${this.usersUrl}/paginated`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/user/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  addUser(user: User): Observable<any> {
    return this.http.post<any>(`${this.usersUrl}/add-user`, user, {
      headers: this.getAuthHeaders(),
    });
  }

  addAdmin(adminData: { fullname: string; username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.usersUrl}/add-admin`, adminData, {
      headers: this.getAuthHeaders(),
    });
  }

  // ====== 3. إدارة العملاء الأحرار (Free Clients Management) ======

  // user.service.ts

/**
 * إضافة عميل حر جديد
 */
addFreeClient(clientData: AddFreeClientData): Observable<any> {
  return this.http.post<any>(`${this.usersUrl}/add-free-client`, clientData, {
    headers: this.getAuthHeaders(),
  });
}

  /**
   * جلب جميع العملاء الأحرار
   */
  getFreeClients(): Observable<{ success: boolean; data: FreeClient[] }> {
    return this.http.get<{ success: boolean; data: FreeClient[] }>(
      `${this.usersUrl}/free-clients`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * الحصول على تقرير العملاء الأحرار
   */
  getFreeClientsReport(): Observable<{ success: boolean; data: FreeClientReport }> {
    return this.http.get<{ success: boolean; data: FreeClientReport }>(
      `${this.usersUrl}/free-clients-report`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * تحديث خصم العميل الحر
   */
  updateFreeClientDiscount(id: string, discountPercentage: number): Observable<any> {
    return this.http.put<any>(
      `${this.usersUrl}/update-free-client-discount/${id}`,
      { discountPercentage },
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * تجديد اشتراك عميل حر
   */
  renewFreeClientSubscription(id: string, durationMonths: number = 1, monthlyBread?: number): Observable<any> {
    return this.http.put<any>(
      `${this.usersUrl}/renew-free-client/${id}`,
      { durationMonths, monthlyBread },
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * الحصول على إحصائيات العملاء الأحرار
   */
  getFreeClientsStats(): Observable<{ success: boolean; data: FreeClientStats }> {
    return this.http.get<{ success: boolean; data: FreeClientStats }>(
      `${this.usersUrl}/free-clients-stats`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateUser(id: string, data: Partial<User>): Observable<any> {
    return this.http.put<any>(`${this.usersUrl}/update-user/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updateUserStatus(id: string, status: 'active' | 'inactive'): Observable<any> {
    return this.http.put<any>(
      `${this.usersUrl}/update-status/${id}`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.usersUrl}/delete-user/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  completeUserProfile(id: string, data: Partial<User>): Observable<any> {
    return this.http.put<any>(`${this.usersUrl}/complete-profile/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  // ====== 4. الإحصائيات (Statistics) ======
  getStats(): Observable<{
    success: boolean;
    data: {
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      totalMonthlyBread?: number;
      totalConsumedBread?: number;
      totalRemainingBread?: number;
      adminCount?: number;
      clientCount?: number;
      freeClientCount?: number;
      freeClientsStats?: {
        total: number;
        totalMonthlyBread: number;
        totalConsumed: number;
        averageDiscount: string;
        totalRevenue: string;
      };
    };
  }> {
    return this.http.get<{
      success: boolean;
      data: {
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        totalMonthlyBread?: number;
        totalConsumedBread?: number;
        totalRemainingBread?: number;
        adminCount?: number;
        clientCount?: number;
        freeClientCount?: number;
        freeClientsStats?: {
          total: number;
          totalMonthlyBread: number;
          totalConsumed: number;
          averageDiscount: string;
          totalRevenue: string;
        };
      };
    }>(`${this.usersUrl}/stats`, { headers: this.getAuthHeaders() });
  }

  getUserStats(userId: string): Observable<any> {
    return this.http.get(`${this.usersUrl}/user-stats`, {
      headers: this.getAuthHeaders()
    });
  }

  // ====== 5. البحث والفلترة (Search & Filter) ======
  searchUsers(q: string): Observable<{ success: boolean; data: User[] }> {
    return this.http.get<{ success: boolean; data: User[] }>(
      `${this.usersUrl}/search?q=${q}`,
      { headers: this.getAuthHeaders() }
    );
  }

  filterBySector(sector: string): Observable<{ success: boolean; data: User[] }> {
    return this.http.get<{ success: boolean; data: User[] }>(
      `${this.usersUrl}/filter?sector=${sector}`,
      { headers: this.getAuthHeaders() }
    );
  }

  sortUsers(
    sortBy: keyof User,
    sortOrder: 'asc' | 'desc'
  ): Observable<{ success: boolean; data: User[] }> {
    return this.http.get<{ success: boolean; data: User[] }>(
      `${this.usersUrl}/sort?sortBy=${sortBy}&sort=${sortOrder}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ====== 6. إدارة القطاعات (Sectors Management) ======
  getAllSectors(): Observable<{ success: boolean; data: Sector[] }> {
    return this.http.get<{ success: boolean; data: Sector[] }>(
      `${this.sectorsUrl}/all-sectors`,
      { headers: this.getAuthHeaders() }
    );
  }

  addSector(sector: addSector): Observable<any> {
    return this.http.post<any>(
      `${this.sectorsUrl}/add-sector`,
      { sector: sector.sector },
      { headers: this.getAuthHeaders() }
    );
  }

  updateSector(id: string, updateData: Partial<Sector>): Observable<any> {
    return this.http.put<any>(
      `${this.sectorsUrl}/update-sector/${id}`,
      updateData,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteSector(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.sectorsUrl}/delete-sector/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ====== 7. إدارة الخبز (Bread Management) ======

  // حجز أرغفة لليوم التالي
  reserveTomorrowBread(data: { clientId: string; quantity: number }): Observable<any> {
    return this.http.post<any>(
      `${this.breadUrl}/reserve-tomorrow`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // الحصول على حجز اليوم التالي لمستخدم
  getTomorrowReservation(clientId: string): Observable<any> {
    return this.http.get<any>(
      `${this.breadUrl}/tomorrow-reservation/${clientId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // إلغاء حجز اليوم التالي
  cancelTomorrowReservation(reservationId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.breadUrl}/cancel-reservation/${reservationId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // تحديث حجز اليوم التالي
  updateTomorrowReservation(reservationId: string, quantity: number): Observable<any> {
    return this.http.put<any>(
      `${this.breadUrl}/update-reservation/${reservationId}`,
      { quantity },
      { headers: this.getAuthHeaders() }
    );
  }

  // استهلاك خبز (تسجيل صرف)
  consumeBread(id: string, quantity: number): Observable<any> {
    return this.http.post<any>(
      `${this.usersUrl}/consume-bread/${id}`,
      { quantity },
      { headers: this.getAuthHeaders() }
    );
  }

  // إعادة تعيين الكميات الشهرية
  resetMonthlyBread(id: string): Observable<any> {
    return this.http.post<any>(
      `${this.usersUrl}/reset-monthly/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // حساب الكميات لمستخدم
  calculateQuantities(id: string): Observable<{ success: boolean; data: BreadQuantities }> {
    return this.http.get<{ success: boolean; data: BreadQuantities }>(
      `${this.usersUrl}/calculate-quantities/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // تحديث سعر الخبز
  updateBreadPrice(id: string, breadPrice: number): Observable<any> {
    return this.http.put<any>(
      `${this.usersUrl}/update-bread-price/${id}`,
      { breadPrice },
      { headers: this.getAuthHeaders() }
    );
  }

  // ====== 8. التقارير (Reports) ======

  // تقرير كامل للمستخدم
  getUserFullReport(id: string): Observable<{ success: boolean; data: FullReport }> {
    return this.http.get<{ success: boolean; data: FullReport }>(
      `${this.usersUrl}/full-report/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // تقرير شهري لجميع المستخدمين
  getMonthlyReport(month?: number, year?: number): Observable<{ success: boolean; data: MonthlyReport }> {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());

    return this.http.get<{ success: boolean; data: MonthlyReport }>(
      `${this.usersUrl}/monthly-report`,
      { headers: this.getAuthHeaders(), params }
    );
  }

  // تصدير التقرير الشهري إلى Excel
  exportMonthlyReportToExcel(month?: number, year?: number): Observable<Blob> {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());

    return this.http.get(`${this.reportsUrl}/monthly-excel`, {
      headers: this.getAuthHeadersBlob(),
      params,
      responseType: 'blob'
    });
  }

  // تصدير التقرير الشهري إلى PDF
  exportMonthlyReportToPDF(month?: number, year?: number): Observable<Blob> {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());

    return this.http.get(`${this.reportsUrl}/monthly-pdf`, {
      headers: this.getAuthHeadersBlob(),
      params,
      responseType: 'blob'
    });
  }

  // ====== 9. لوحة تحكم العميل (Client Dashboard) ======
  getClientDashboard(clientId: string): Observable<ClientDashboard> {
    return this.http.get<ClientDashboard>(
      `${this.usersUrl}/client-dashboard/${clientId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ====== 10. دوال التوافق مع الكود القديم (Compatibility) ======
  getUsersBySector(sectorId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/sector/${sectorId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getActiveUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/active`, {
      headers: this.getAuthHeaders()
    });
  }

  getInactiveUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/inactive`, {
      headers: this.getAuthHeaders()
    });
  }

  // ====== 11. دوال إضافية ======

  // الحصول على جميع المديرين
  getAdmins(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/admins`, {
      headers: this.getAuthHeaders()
    });
  }

  // الحصول على جميع العملاء (العاديين فقط)
  getClients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/clients`, {
      headers: this.getAuthHeaders()
    });
  }

  // الحصول على جميع العملاء (بما فيهم الأحرار)
  getAllClients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/all-clients`, {
      headers: this.getAuthHeaders()
    });
  }

  // تحديث كمية الخبز الشهرية لمستخدم
  updateMonthlyBread(id: string, monthlyBread: number): Observable<any> {
    return this.http.put<any>(
      `${this.usersUrl}/update-monthly-bread/${id}`,
      { monthlyBread },
      { headers: this.getAuthHeaders() }
    );
  }

  // الحصول على إحصائيات الخبز العامة
  getBreadStats(): Observable<{ success: boolean; data: BreadStats }> {
    return this.http.get<{ success: boolean; data: BreadStats }>(
      `${this.breadUrl}/stats`,
      { headers: this.getAuthHeaders() }
    );
  }

  // توزيع الخبز لجميع المستخدمين
  distributeBreadToAll(): Observable<any> {
    return this.http.post<any>(
      `${this.breadUrl}/distribute-to-all`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // ====== 12. دوال السجلات (Logs) ======
  getLogs(clientId?: string, action?: string, fromDate?: Date, toDate?: Date): Observable<Log[]> {
    let params = new HttpParams();
    if (clientId) params = params.set('clientId', clientId);
    if (action) params = params.set('action', action);
    if (fromDate) params = params.set('fromDate', fromDate.toISOString());
    if (toDate) params = params.set('toDate', toDate.toISOString());
    return this.http.get<Log[]>(`${this.logsUrl}`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  getClientLogs(clientId: string): Observable<Log[]> {
    return this.http.get<Log[]>(`${this.logsUrl}/client/${clientId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ====== 13. دوال مساعدة للعملاء الأحرار ======

  /**
   * التحقق من صلاحية اشتراك عميل حر
   */
  checkFreeClientSubscription(id: string): Observable<{ success: boolean; data: { isValid: boolean; daysRemaining: number } }> {
    return this.http.get<{ success: boolean; data: { isValid: boolean; daysRemaining: number } }>(
      `${this.usersUrl}/free-client-subscription/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * إضافة ملاحظة لعميل حر
   */
  addFreeClientNote(id: string, note: string): Observable<any> {
    return this.http.put<any>(
      `${this.usersUrl}/free-client-note/${id}`,
      { note },
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * تغيير نوع العميل إلى حر أو العكس
   */
  changeClientType(id: string, clientType: 'regular' | 'free'): Observable<any> {
    return this.http.put<any>(
      `${this.usersUrl}/change-client-type/${id}`,
      { clientType },
      { headers: this.getAuthHeaders() }
    );
  }
}
