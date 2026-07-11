import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AdministrationService } from '../../service/user.service';
import { User, ClientDashboard, FreeClient, AddFreeClientData } from '../../model/user';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.css'],
})
export class AdministrationComponent implements OnInit {
  // ====== ViewChild للإشارة إلى عناصر رفع الصور ======
  @ViewChild('nationalIdImageInput') nationalIdImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('nationalIdImageBackInput') nationalIdImageBackInput!: ElementRef<HTMLInputElement>;
  @ViewChild('rationCardImageInput') rationCardImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('additionalImageInput') additionalImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('editNationalIdImageInput') editNationalIdImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('editNationalIdImageBackInput') editNationalIdImageBackInput!: ElementRef<HTMLInputElement>;
  @ViewChild('editRationCardImageInput') editRationCardImageInput!: ElementRef<HTMLInputElement>;

  // ====== البيانات الأساسية ======
  users: User[] = [];
  filteredList: User[] = [];
  activeTab: 'users' | 'admins' | 'free-clients' = 'users';

  // ====== الفلترة والبحث ======
  searchTerm = '';
  selectedStatus = '';

  // ====== إحصائيات المديرين ======
  adminsList: User[] = [];
  filteredAdminsList: User[] = [];
  adminSearchTerm = '';
  adminStatusFilter = '';

  // ====== العملاء الأحرار ======
  freeClients: FreeClient[] = [];
  filteredFreeClients: FreeClient[] = [];
  freeClientSearchTerm = '';
  freeClientStatusFilter = '';

  // ====== إحصائيات العملاء الأحرار ======
  freeClientsStats = {
    total: 0,
    active: 0,
    inactive: 0,
    avgDiscount: 0
  };

  // ====== الإحصائيات العامة ======
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalMonthlyBread: 0,
    totalConsumedBread: 0,
    totalRemainingBread: 0,
    adminCount: 0,
    clientCount: 0,
    freeClientCount: 0
  };

  // ====== إحصائيات منفصلة للعملاء والمديرين ======
  clientStats = {
    total: 0,
    active: 0,
    inactive: 0
  };

  adminStats = {
    total: 0,
    active: 0,
    inactive: 0
  };

  // ====== التحكم في المودالات ======
  showAddDepartmentModal = false;
  showEditUserModal = false;
  showAddAdminModal = false;
  showAddFreeClientModal = false;
  showEditFreeClientModal = false;
  showPassword = false;
  showEditPassword = false;
  showAdminPassword = false;
  showFreeClientPassword = false;
  showEditFreeClientPassword = false;
  showRationCardPassword = false;
  showEditRationCardPassword = false;

  // ====== التحكم في مودال تعديل المدير ======
  showEditAdminModal = false;
  showEditAdminPassword = false;

  // ====== نموذج تعديل المدير ======
  selectedAdmin: any = {
    _id: '',
    fullname: '',
    username: '',
    status: 'active',
    newPassword: ''
  };

  // ====== نموذج المدير الجديد (مبسط) ======
  newAdmin: any = {
    fullname: '',
    username: '',
    password: ''
  };

  // ====== نموذج العميل الحر الجديد ======
  newFreeClient: any = {
    fullname: '',
    phone: '',
    address: '',
    governorate: '',
    center: '',
    village: '',
    username: '',
    password: '',
    monthlyBread: 0,
    dailyBreadQuantity: 0,  // <-- الكمية اليومية
    breadPrice: 0.5,
    discountPercentage: 0,
    notes: '',
    subscriptionEndDate: null,
    familyMembers: 0
  };

  // ====== نموذج تعديل العميل الحر ======
  selectedFreeClient: any = {
    _id: '',
    fullname: '',
    phone: '',
    username: '',
    address: '',
    governorate: '',
    center: '',
    village: '',
    monthlyBread: 0,
    dailyBreadQuantity: 0,  // <-- الكمية اليومية
    breadPrice: 0.5,
    customBreadPrice: 0.5,
    discountPercentage: 0,
    notes: '',
    subscriptionEndDate: null,
    familyMembers: 0,
    status: 'active',
    newPassword: ''
  };

  // ====== نماذج الإدخال ======
  newDepartment: any = {
    fullname: '',
    username: '',
    password: '',
    role: 'client',
    nationalId: '',
    nationalIdImage: '',
    nationalIdImageBack: '',
    rationCardNumber: '',
    rationCardPassword: '',
    rationCardImage: '',
    additionalImage: '',
    phone: '',
    address: '',
    familyMembers: 0,
    monthlyBread: 0,
    dailyBreadQuantity: 0,  // <-- الكمية اليومية
    governorate: '',
    center: '',
    village: '',
    rationOutlet: ''
  };

  selectedUser: any = {
    fullname: '',
    username: '',
    role: 'client',
    status: 'active',
    nationalId: '',
    nationalIdImage: '',
    nationalIdImageBack: '',
    rationCardNumber: '',
    rationCardPassword: '',
    rationCardImage: '',
    additionalImage: '',
    phone: '',
    address: '',
    familyMembers: 0,
    monthlyBread: 0,
    dailyBreadQuantity: 0,  // <-- الكمية اليومية
    governorate: '',
    center: '',
    village: '',
    newPassword: '',
    rationOutlet: ''
  };

  constructor(private adminService: AdministrationService, private router: Router) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
    this.loadFreeClients();
  }

  // ====== تحميل المستخدمين ======
  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        const usersArray = Array.isArray(data)
          ? data
          : (data as { data: User[] }).data;

        this.users = (usersArray || []).map((u) => {
          return {
            _id: u._id,
            fullname: u.fullname,
            username: u.username,
            role: u.role,
            status: u.status || 'active',
            nationalId: u.nationalId || '',
            nationalIdImage: u.nationalIdImage || '',
            nationalIdImageBack: u.nationalIdImageBack || '',
            rationCardNumber: u.rationCardNumber || '',
            rationCardImage: u.rationCardImage || '',
            additionalImage: u.additionalImage || '',
            phone: u.phone || '',
            address: u.address || '',
            familyMembers: u.familyMembers || 0,
            monthlyBread: u.monthlyBread || 0,
            dailyBreadQuantity: u.dailyBreadQuantity || 0,  // <-- الكمية اليومية
            consumedBread: u.consumedBread || 0,
            remainingBread: u.remainingBread || 0,
            governorate: u.governorate || '',
            center: u.center || '',
            village: u.village || '',
            lastReceived: u.lastReceived,
            isProfileComplete: u.isProfileComplete || false,
            rationOutlet: u.rationOutlet || '',
            createdAt: u.createdAt,
            clientType: u.clientType || 'regular',
            customBreadPrice: u.customBreadPrice || null,
            discountPercentage: u.discountPercentage || 0,
            notes: u.notes || '',
            subscriptionEndDate: u.subscriptionEndDate || null
          };
        });
        this.applyFilters();
        this.updateStats();
        this.updateAdminsList();
        this.updateFreeClientsList();
      },
      error: (err: HttpErrorResponse) =>
        console.error('خطأ في جلب المستخدمين:', err.message),
    });
  }

  // ====== تحميل الإحصائيات ======
  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (data: any) => {
        const statsData = data.data || data;
        this.stats.totalUsers = statsData.totalUsers || 0;
        this.stats.activeUsers = statsData.activeUsers || 0;
        this.stats.inactiveUsers = statsData.inactiveUsers || 0;
        this.stats.adminCount = statsData.adminCount || 0;
        this.stats.clientCount = statsData.clientCount || 0;
        this.stats.freeClientCount = statsData.freeClientCount || 0;

        if (statsData.freeClientsStats) {
          this.freeClientsStats.total = statsData.freeClientsStats.total || 0;
          this.freeClientsStats.avgDiscount = parseFloat(statsData.freeClientsStats.averageDiscount) || 0;
        }
      },
      error: (err: HttpErrorResponse) =>
        console.error('خطأ في جلب الإحصائيات:', err.message),
    });
  }

  // ====== تحديث الإحصائيات ======
  updateStats(): void {
    this.stats.totalUsers = this.users.length;
    this.stats.activeUsers = this.users.filter(u => u.status === 'active').length;
    this.stats.inactiveUsers = this.users.filter(u => u.status === 'inactive').length;
    this.stats.totalMonthlyBread = this.users.reduce((sum, u) => sum + (u.monthlyBread || 0), 0);
    this.stats.totalConsumedBread = this.users.reduce((sum, u) => sum + (u.consumedBread || 0), 0);
    this.stats.totalRemainingBread = this.users.reduce((sum, u) => sum + (u.remainingBread || 0), 0);
    this.stats.adminCount = this.users.filter(u => u.role === 'admin').length;
    this.stats.clientCount = this.users.filter(u => u.role === 'client').length;
    this.stats.freeClientCount = this.users.filter(u => u.role === 'free_client').length;

    const clients = this.users.filter(u => u.role === 'client');
    this.clientStats.total = clients.length;
    this.clientStats.active = clients.filter(u => u.status === 'active').length;
    this.clientStats.inactive = clients.filter(u => u.status === 'inactive').length;

    const admins = this.users.filter(u => u.role === 'admin');
    this.adminStats.total = admins.length;
    this.adminStats.active = admins.filter(u => u.status === 'active').length;
    this.adminStats.inactive = admins.filter(u => u.status === 'inactive').length;

    // تحديث إحصائيات العملاء الأحرار
    const freeClients = this.users.filter(u => u.role === 'free_client');
    this.freeClientsStats.total = freeClients.length;
    this.freeClientsStats.active = freeClients.filter(u => u.status === 'active').length;
    this.freeClientsStats.inactive = freeClients.filter(u => u.status === 'inactive').length;
    const avgDiscount = freeClients.reduce((sum, u) => sum + (u.discountPercentage || 0), 0);
    this.freeClientsStats.avgDiscount = freeClients.length > 0 ? Math.round(avgDiscount / freeClients.length) : 0;
  }

  // ====== تحميل العملاء الأحرار ======
  loadFreeClients(): void {
    this.adminService.getFreeClients().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.freeClients = Array.isArray(data) ? data : [];
        this.filterFreeClients();
      },
      error: (err: HttpErrorResponse) =>
        console.error('خطأ في جلب العملاء الأحرار:', err.message),
    });
  }

  // ====== تحديث قائمة العملاء الأحرار ======
  updateFreeClientsList(): void {
    this.freeClients = this.users.filter(u => u.role === 'free_client') as FreeClient[];
    this.filterFreeClients();
  }

  // ====== فلترة العملاء الأحرار ======
  filterFreeClients(): void {
    this.filteredFreeClients = this.freeClients.filter((client) => {
      const matchStatus = this.freeClientStatusFilter
        ? client.status === this.freeClientStatusFilter
        : true;
      const matchSearch = this.freeClientSearchTerm
        ? client.fullname?.toLowerCase().includes(this.freeClientSearchTerm.toLowerCase()) ||
          client.username?.toLowerCase().includes(this.freeClientSearchTerm.toLowerCase()) ||
          client.phone?.includes(this.freeClientSearchTerm)
        : true;
      return matchStatus && matchSearch;
    });
  }

  // ====== إعادة تعيين فلاتر العملاء الأحرار ======
  resetFreeClientFilters(): void {
    this.freeClientSearchTerm = '';
    this.freeClientStatusFilter = '';
    this.filterFreeClients();
  }

  // ====== دوال التبويبات ======
  switchTab(tab: 'users' | 'admins' | 'free-clients'): void {
    this.activeTab = tab;
    if (tab === 'admins') {
      this.updateAdminsList();
    } else if (tab === 'free-clients') {
      this.updateFreeClientsList();
    }
  }

  // ====== تحديث قائمة المديرين ======
  updateAdminsList(): void {
    this.adminsList = this.users.filter(u => u.role === 'admin');
    this.filterAdmins();
  }

  // ====== فلترة المديرين ======
  filterAdmins(): void {
    this.filteredAdminsList = this.adminsList.filter((admin) => {
      const matchStatus = this.adminStatusFilter
        ? admin.status === this.adminStatusFilter
        : true;
      const matchSearch = this.adminSearchTerm
        ? admin.fullname?.toLowerCase().includes(this.adminSearchTerm.toLowerCase()) ||
        admin.username?.toLowerCase().includes(this.adminSearchTerm.toLowerCase()) ||
        admin.phone?.includes(this.adminSearchTerm)
        : true;
      return matchStatus && matchSearch;
    });
  }

  // ====== إعادة تعيين فلاتر المديرين ======
  resetAdminFilters(): void {
    this.adminSearchTerm = '';
    this.adminStatusFilter = '';
    this.filterAdmins();
  }

  // ====== عدد المديرين النشطين ======
  getActiveAdminsCount(): number {
    return this.adminsList.filter(a => a.status === 'active').length;
  }

  // ====== عدد المديرين المعطلين ======
  getInactiveAdminsCount(): number {
    return this.adminsList.filter(a => a.status === 'inactive').length;
  }

  // ====== تبديل حالة المدير ======
  toggleAdminStatus(admin: User): void {
    this.toggleStatus(admin);
  }

  // ====== حذف مدير ======
  deleteAdmin(admin: User): void {
    this.deleteUser(admin);
  }

  // ====== تطبيق الفلاتر ======
  applyFilters(): void {
    this.filteredList = this.users.filter((user) => {
      if (user.role === 'admin' || user.role === 'free_client') {
        return false;
      }

      const matchStatus = this.selectedStatus
        ? user.status === this.selectedStatus
        : true;

      const matchSearch = this.searchTerm
        ? user.fullname?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          user.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          user.nationalId?.includes(this.searchTerm) ||
          user.phone?.includes(this.searchTerm) ||
          user.rationCardNumber?.includes(this.searchTerm)
        : true;

      return matchStatus && matchSearch;
    });
  }

  // ====== إعادة تعيين الفلاتر ======
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  // ====== تغيير حالة المستخدم ======
  toggleStatus(user: User): void {
    if (!user._id) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    this.adminService.updateUserStatus(user._id, newStatus).subscribe({
      next: () => {
        user.status = newStatus;
        this.updateStats();
        this.updateAdminsList();
        this.updateFreeClientsList();
        Swal.fire({
          icon: 'success',
          title: `تم ${newStatus === 'active' ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`,
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (err: HttpErrorResponse) => {
        const errorMessage = err.error?.message || err.message;
        Swal.fire({
          icon: 'error',
          title: 'خطأ في تحديث الحالة',
          text: errorMessage,
        });
      },
    });
  }

  // ====== تغيير حالة عميل حر ======
  toggleFreeClientStatus(client: FreeClient): void {
    this.toggleStatus(client);
  }

  // ====== حذف عميل حر ======
  deleteFreeClient(client: FreeClient): void {
    this.deleteUser(client);
  }

  // ====== فتح مودال إضافة مستخدم ======
  openAddUser(): void {
    this.newDepartment = {
      fullname: '',
      username: '',
      password: '',
      role: 'client',
      nationalId: '',
      nationalIdImage: '',
      nationalIdImageBack: '',
      rationCardNumber: '',
      rationCardPassword: '',
      rationCardImage: '',
      additionalImage: '',
      phone: '',
      address: '',
      familyMembers: 0,
      monthlyBread: 0,
      dailyBreadQuantity: 0,  // <-- الكمية اليومية
      governorate: '',
      center: '',
      village: '',
      rationOutlet: ''
    };
    this.showAddDepartmentModal = true;
    this.showPassword = false;
    this.showRationCardPassword = false;

    setTimeout(() => {
      this.resetFileInputs();
    }, 100);
  }

  // ====== فتح مودال إضافة عميل حر ======
  openAddFreeClient(): void {
    this.newFreeClient = {
      fullname: '',
      phone: '',
      address: '',
      governorate: '',
      center: '',
      village: '',
      username: '',
      password: '',
      monthlyBread: 0,
      dailyBreadQuantity: 0,  // <-- الكمية اليومية
      breadPrice: 0.5,
      discountPercentage: 0,
      notes: '',
      subscriptionEndDate: null,
      familyMembers: 0
    };
    this.showFreeClientPassword = false;
    this.showAddFreeClientModal = true;
  }

  // ====== إغلاق مودال إضافة عميل حر ======
  closeAddFreeClient(): void {
    this.showAddFreeClientModal = false;
    this.newFreeClient = {
      fullname: '',
      phone: '',
      address: '',
      governorate: '',
      center: '',
      village: '',
      username: '',
      password: '',
      monthlyBread: 0,
      dailyBreadQuantity: 0,
      breadPrice: 0.5,
      discountPercentage: 0,
      notes: '',
      subscriptionEndDate: null,
      familyMembers: 0
    };
  }

  // ====== حفظ عميل حر جديد ======
  saveFreeClient(): void {
    const { fullname, phone, username, password } = this.newFreeClient;

    if (!fullname?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'الاسم الكامل مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!phone?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'رقم الهاتف مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!username?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'اسم المستخدم مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!password || password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'كلمة المرور ضعيفة',
        text: 'يجب أن تكون 6 أحرف على الأقل',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    const clientData: AddFreeClientData = {
      fullname: fullname.trim(),
      phone: phone.trim(),
      username: username.trim(),
      password: password,
      address: this.newFreeClient.address?.trim() || '',
      governorate: this.newFreeClient.governorate?.trim() || '',
      center: this.newFreeClient.center?.trim() || '',
      village: this.newFreeClient.village?.trim() || '',
      monthlyBread: this.newFreeClient.monthlyBread || 0,
      dailyBreadQuantity: this.newFreeClient.dailyBreadQuantity || 0,  // <-- الكمية اليومية
      breadPrice: this.newFreeClient.breadPrice || 0.5,
      discountPercentage: this.newFreeClient.discountPercentage || 0,
      notes: this.newFreeClient.notes?.trim() || '',
      subscriptionEndDate: this.newFreeClient.subscriptionEndDate || null,
      familyMembers: this.newFreeClient.familyMembers || 0
    };

    this.adminService.addFreeClient(clientData).subscribe({
      next: (response: any) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'تم إضافة العميل الحر بنجاح ✅',
            html: `
              <div style="text-align: right; direction: rtl;">
                <p><strong>الاسم:</strong> ${fullname}</p>
                <p><strong>اسم المستخدم:</strong> ${username}</p>
                <p><strong>الهاتف:</strong> ${phone}</p>
                <p><strong>الكمية اليومية:</strong> ${this.newFreeClient.dailyBreadQuantity || 0}</p>
                <hr>
                <p class="text-muted small">تم إنشاء حساب العميل الحر بنجاح</p>
              </div>
            `,
            timer: 3000,
            showConfirmButton: true
          });
          this.closeAddFreeClient();
          this.loadUsers();
          this.loadStats();
        } else {
          Swal.fire({
            icon: 'error',
            title: response.message || 'خطأ في إضافة العميل الحر'
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: 'خطأ في إضافة العميل الحر',
          text: err.error?.message || err.message
        });
      }
    });
  }

  // ====== فتح مودال تعديل عميل حر ======
  openEditFreeClient(client: FreeClient): void {
    this.selectedFreeClient = {
      _id: client._id,
      fullname: client.fullname || '',
      phone: client.phone || '',
      username: client.username || '',
      address: client.address || '',
      governorate: client.governorate || '',
      center: client.center || '',
      village: client.village || '',
      monthlyBread: client.monthlyBread || 0,
      dailyBreadQuantity: client.dailyBreadQuantity || 0,  // <-- الكمية اليومية
      breadPrice: client.breadPrice || 0.5,
      customBreadPrice: client.customBreadPrice || 0.5,
      discountPercentage: client.discountPercentage || 0,
      notes: client.notes || '',
      subscriptionEndDate: client.subscriptionEndDate || null,
      familyMembers: client.familyMembers || 0,
      status: client.status || 'active',
      newPassword: ''
    };
    this.showEditFreeClientPassword = false;
    this.showEditFreeClientModal = true;
  }

  // ====== إغلاق مودال تعديل عميل حر ======
  closeEditFreeClient(): void {
    this.showEditFreeClientModal = false;
    this.selectedFreeClient = {
      _id: '',
      fullname: '',
      phone: '',
      username: '',
      address: '',
      governorate: '',
      center: '',
      village: '',
      monthlyBread: 0,
      dailyBreadQuantity: 0,
      breadPrice: 0.5,
      customBreadPrice: 0.5,
      discountPercentage: 0,
      notes: '',
      subscriptionEndDate: null,
      familyMembers: 0,
      status: 'active',
      newPassword: ''
    };
  }

  // ====== حفظ تعديل عميل حر ======
  confirmEditFreeClient(): void {
    const { _id, fullname, phone, username, status, newPassword } = this.selectedFreeClient;

    if (!_id) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'معرف العميل غير موجود'
      });
      return;
    }

    if (!fullname?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'الاسم الكامل مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!phone?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'رقم الهاتف مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!username?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'اسم المستخدم مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    const payload: any = {
      fullname: fullname.trim(),
      phone: phone.trim(),
      username: username.trim(),
      address: this.selectedFreeClient.address?.trim() || '',
      governorate: this.selectedFreeClient.governorate?.trim() || '',
      center: this.selectedFreeClient.center?.trim() || '',
      village: this.selectedFreeClient.village?.trim() || '',
      monthlyBread: this.selectedFreeClient.monthlyBread || 0,
      dailyBreadQuantity: this.selectedFreeClient.dailyBreadQuantity || 0,  // <-- الكمية اليومية
      customBreadPrice: this.selectedFreeClient.customBreadPrice || 0.5,
      discountPercentage: this.selectedFreeClient.discountPercentage || 0,
      notes: this.selectedFreeClient.notes?.trim() || '',
      subscriptionEndDate: this.selectedFreeClient.subscriptionEndDate || null,
      familyMembers: this.selectedFreeClient.familyMembers || 0,
      status: status || 'active',
      role: 'free_client'
    };

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        Swal.fire({
          icon: 'warning',
          title: 'كلمة المرور ضعيفة',
          text: 'يجب أن تكون 6 أحرف على الأقل',
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }
      payload.password = newPassword.trim();
    }

    this.adminService.updateUser(_id, payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          const index = this.users.findIndex(u => u._id === _id);
          if (index !== -1) {
            this.users[index] = {
              ...this.users[index],
              ...payload
            };
          }
          this.applyFilters();
          this.updateStats();
          this.updateAdminsList();
          this.updateFreeClientsList();

          Swal.fire({
            icon: 'success',
            title: 'تم تعديل العميل الحر بنجاح',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeEditFreeClient();
        } else {
          Swal.fire({
            icon: 'error',
            title: response.message || 'خطأ في تعديل العميل الحر'
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: 'خطأ في تعديل العميل الحر',
          text: err.error?.message || err.message
        });
      }
    });
  }

  // ====== تجديد اشتراك عميل حر ======
  renewFreeClientSubscription(client: FreeClient): void {
    if (!client._id) return;

    Swal.fire({
      title: 'تجديد اشتراك العميل الحر',
      html: `
        <div style="text-align: right; direction: rtl;">
          <p><strong>العميل:</strong> ${client.fullname}</p>
          <div class="mb-3">
            <label class="form-label">مدة التجديد (شهور)</label>
            <input id="durationMonths" class="form-control" type="number" value="1" min="1" max="12">
          </div>
          <div class="mb-3">
            <label class="form-label">عدد الأرغفة الشهرية (اختياري)</label>
            <input id="monthlyBread" class="form-control" type="number" value="${client.monthlyBread || 0}" min="0">
          </div>
          <div class="mb-3">
            <label class="form-label">الكمية اليومية (اختياري)</label>
            <input id="dailyBreadQuantity" class="form-control" type="number" value="${client.dailyBreadQuantity || 0}" min="0">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'تجديد الاشتراك',
      cancelButtonText: 'إلغاء',
      preConfirm: () => {
        const durationMonths = parseInt((document.getElementById('durationMonths') as HTMLInputElement).value);
        const monthlyBread = parseInt((document.getElementById('monthlyBread') as HTMLInputElement).value);
        const dailyBreadQuantity = parseInt((document.getElementById('dailyBreadQuantity') as HTMLInputElement).value);
        if (!durationMonths || durationMonths < 1) {
          Swal.showValidationMessage('يجب إدخال مدة صحيحة');
          return false;
        }
        return {
          durationMonths,
          monthlyBread: monthlyBread || undefined,
          dailyBreadQuantity: dailyBreadQuantity || undefined
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { durationMonths, monthlyBread, dailyBreadQuantity } = result.value;
        this.adminService.renewFreeClientSubscription(client._id!, durationMonths, monthlyBread).subscribe({
          next: (response: any) => {
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: 'تم تجديد الاشتراك بنجاح',
                html: `
                  <div style="text-align: right; direction: rtl;">
                    <p>تم تجديد اشتراك <strong>${client.fullname}</strong></p>
                    <p class="text-muted small">لمدة ${durationMonths} شهر/شهور</p>
                    ${dailyBreadQuantity ? `<p class="text-muted small">الكمية اليومية: ${dailyBreadQuantity}</p>` : ''}
                  </div>
                `,
                timer: 3000,
                showConfirmButton: true
              });
              this.loadUsers();
              this.loadStats();
            } else {
              Swal.fire({
                icon: 'error',
                title: response.message || 'خطأ في تجديد الاشتراك'
              });
            }
          },
          error: (err: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: 'خطأ في تجديد الاشتراك',
              text: err.error?.message || err.message
            });
          }
        });
      }
    });
  }

  // ====== فتح مودال إضافة مدير ======
  openAddAdmin(): void {
    this.newAdmin = {
      fullname: '',
      username: '',
      password: ''
    };
    this.showAdminPassword = false;
    this.showAddAdminModal = true;
  }

  // ====== إغلاق مودال إضافة مدير ======
  closeAddAdmin(): void {
    this.showAddAdminModal = false;
    this.newAdmin = {
      fullname: '',
      username: '',
      password: ''
    };
  }

  // ====== حفظ مدير جديد ======
  saveAdmin(): void {
    const { fullname, username, password } = this.newAdmin;

    if (!fullname?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'الاسم الكامل مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!username?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'اسم المستخدم مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!password || password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'كلمة المرور ضعيفة',
        text: 'يجب أن تكون 6 أحرف على الأقل',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    this.adminService.addAdmin({
      fullname: fullname.trim(),
      username: username.trim(),
      password: password
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: ' تم إضافة المدير بنجاح',
            html: `
              <div style="text-align: right; direction: rtl;">
                <p><strong>الاسم:</strong> ${fullname}</p>
                <p><strong>اسم المستخدم:</strong> ${username}</p>
                <hr>
                <p class="text-muted small">تم إنشاء حساب المدير بنجاح</p>
              </div>
            `,
            timer: 3000,
            showConfirmButton: true
          });
          this.closeAddAdmin();
          this.loadUsers();
          this.loadStats();
        } else {
          Swal.fire({
            icon: 'error',
            title: response.message || 'خطأ في إضافة المدير'
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: 'خطأ في إضافة المدير',
          text: err.error?.message || err.message
        });
      }
    });
  }

  // ====== إغلاق مودال إضافة مستخدم ======
  closeAddDepartment(): void {
    this.showAddDepartmentModal = false;
    this.resetFileInputs();
  }

  // ====== فتح مودال تعديل مستخدم ======
  openEditUser(user: User): void {
    this.selectedUser = {
      ...user,
      nationalIdImage: user.nationalIdImage || '',
      nationalIdImageBack: user.nationalIdImageBack || '',
      rationCardImage: user.rationCardImage || '',
      additionalImage: user.additionalImage || '',
      rationOutlet: user.rationOutlet || '',
      rationCardPassword: ''
    };
    this.selectedUser.newPassword = '';
    this.showEditUserModal = true;
    this.showEditPassword = false;
    this.showEditRationCardPassword = false;

    this.calculateEditMonthlyBread();

    setTimeout(() => {
      this.resetFileInputs();
    }, 100);
  }

  closeEditUser(): void {
    this.selectedUser = {};
    this.showEditUserModal = false;
    this.showEditPassword = false;
    this.showEditRationCardPassword = false;
    this.resetFileInputs();
  }

  // ====== إعادة تعيين مدخلات الملفات ======
  resetFileInputs(): void {
    const inputs = [
      this.nationalIdImageInput,
      this.nationalIdImageBackInput,
      this.rationCardImageInput,
      this.additionalImageInput,
      this.editNationalIdImageInput,
      this.editNationalIdImageBackInput,
      this.editRationCardImageInput
    ];

    inputs.forEach(input => {
      if (input && input.nativeElement) {
        input.nativeElement.value = '';
      }
    });
  }

  // ====== حفظ تعديل المستخدم ======
  confirmEditUser(): void {
    if (!this.selectedUser._id) return;

    const { fullname, username, role, newPassword, status,
      nationalId, phone, address, familyMembers,
      governorate, center, village, rationOutlet } = this.selectedUser;

    if (!fullname?.trim() || !username?.trim() || !role) {
      Swal.fire({
        icon: 'warning',
        title: 'املأ جميع الحقول المطلوبة',
        text: 'الاسم الكامل، اسم المستخدم، الدور مطلوبة',
      });
      return;
    }

    const calculatedMonthlyBread = (familyMembers || 0) * 150;

    const payload: any = {
      fullname: fullname.trim(),
      username: username.trim(),
      role,
      status: status || 'active',
      nationalId: nationalId?.trim() || '',
      nationalIdImage: this.selectedUser.nationalIdImage || '',
      nationalIdImageBack: this.selectedUser.nationalIdImageBack || '',
      rationCardNumber: this.selectedUser.rationCardNumber || '',
      rationCardPassword: this.selectedUser.rationCardPassword?.trim() || '',
      rationCardImage: this.selectedUser.rationCardImage || '',
      additionalImage: this.selectedUser.additionalImage || '',
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      familyMembers: familyMembers || 0,
      monthlyBread: calculatedMonthlyBread,
      dailyBreadQuantity: this.selectedUser.dailyBreadQuantity || 0,  // <-- الكمية اليومية
      governorate: governorate?.trim() || '',
      center: center?.trim() || '',
      village: village?.trim() || '',
      rationOutlet: rationOutlet?.trim() || '',
    };

    if (newPassword && newPassword.trim()) {
      payload.password = newPassword.trim();
    }

    this.adminService.updateUser(this.selectedUser._id, payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          const index = this.users.findIndex(
            (u) => u._id === this.selectedUser._id
          );
          if (index !== -1) {
            this.users[index] = {
              ...this.users[index],
              ...payload,
            };
          }
          this.applyFilters();
          this.updateStats();
          this.updateAdminsList();
          Swal.fire({
            icon: 'success',
            title: response.message || 'تم تعديل المستخدم بنجاح',
            timer: 2000,
            showConfirmButton: false,
          });
          this.closeEditUser();
        } else {
          Swal.fire({
            icon: 'error',
            title: response.message || 'خطأ أثناء تعديل المستخدم',
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        const errorMessage = err.error?.message || err.message;
        Swal.fire({
          icon: 'error',
          title: 'خطأ أثناء تعديل المستخدم',
          text: errorMessage,
        });
      },
    });
  }

  // ====== حذف مستخدم ======
  deleteUser(user: User): void {
    if (!user._id) return;
    Swal.fire({
      title: `هل أنت متأكد من حذف المستخدم "${user.fullname}"؟`,
      text: 'لا يمكن التراجع عن هذا الإجراء!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذفه',
      cancelButtonText: 'إلغاء',
    }).then((res) => {
      if (!res.isConfirmed) return;
      this.adminService.deleteUser(user._id!).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.users = this.users.filter((u) => u._id !== user._id);
            this.applyFilters();
            this.updateStats();
            this.updateAdminsList();
            this.updateFreeClientsList();
            Swal.fire({
              icon: 'success',
              title: response.message || 'تم حذف المستخدم',
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: response.message || 'خطأ أثناء الحذف',
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          const errorMessage = err.error?.message || err.message;
          Swal.fire({
            icon: 'error',
            title: 'خطأ أثناء الحذف',
            text: errorMessage,
          });
        },
      });
    });
  }

  // ====== حفظ مستخدم جديد (عميل) ======
  saveDepartment(): void {
    const { username, password, role } = this.newDepartment;

    if (!username?.trim()) {
      Swal.fire({ icon: 'warning', title: 'اسم المستخدم مطلوب' });
      return;
    }

    if (!password) {
      Swal.fire({ icon: 'warning', title: 'كلمة المرور مطلوبة' });
      return;
    }

    if (password.length < 6) {
      Swal.fire({ icon: 'warning', title: 'كلمة المرور ضعيفة', text: 'يجب أن تكون 6 أحرف على الأقل' });
      return;
    }

    const familyMembers = this.newDepartment.familyMembers || 0;
    const monthlyBread = familyMembers * 150;
    const dailyBreadQuantity = this.newDepartment.dailyBreadQuantity || 0;

    const userData = {
      username: username.trim(),
      password: password,
      role: role || 'client',
      fullname: this.newDepartment.fullname?.trim() || '',
      nationalId: this.newDepartment.nationalId?.trim() || '',
      nationalIdImage: this.newDepartment.nationalIdImage || '',
      nationalIdImageBack: this.newDepartment.nationalIdImageBack || '',
      rationCardNumber: this.newDepartment.rationCardNumber?.trim() || '',
      rationCardPassword: this.newDepartment.rationCardPassword?.trim() || '',
      rationCardImage: this.newDepartment.rationCardImage || '',
      additionalImage: this.newDepartment.additionalImage || '',
      phone: this.newDepartment.phone?.trim() || '',
      address: this.newDepartment.address?.trim() || '',
      familyMembers: familyMembers,
      monthlyBread: monthlyBread,
      dailyBreadQuantity: dailyBreadQuantity,  // <-- الكمية اليومية
      governorate: this.newDepartment.governorate?.trim() || '',
      center: this.newDepartment.center?.trim() || '',
      village: this.newDepartment.village?.trim() || '',
      rationOutlet: this.newDepartment.rationOutlet?.trim() || '',
      isFirstLogin: true,
      status: 'active',
      consumedBread: 0,
      remainingBread: monthlyBread
    };

    this.adminService.addUser(userData as any).subscribe({
      next: (response: any) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'تم إنشاء الحساب بنجاح ',
            html: `
            <div style="text-align: right; direction: rtl;">
              <p>تم إنشاء حساب للمستخدم <strong>${username}</strong></p>
              <p class="text-muted small">عدد الأفراد: ${familyMembers}</p>
              <p class="text-muted small">عدد الأرغفة الشهرية: ${monthlyBread}</p>
              <p class="text-muted small">الكمية اليومية: ${dailyBreadQuantity}</p>
              <hr>
              <p class="text-info">سيطلب من المستخدم إكمال بياناته الشخصية عند تسجيل الدخول لأول مرة</p>
            </div>
          `,
            timer: 3000,
            showConfirmButton: true,
          });
          this.closeAddDepartment();
          this.loadUsers();
          this.loadStats();
        } else {
          Swal.fire({ icon: 'error', title: response.message || 'خطأ أثناء إنشاء الحساب' });
        }
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire({ icon: 'error', title: 'خطأ أثناء إنشاء الحساب', text: err.error?.message || err.message });
      },
    });
  }

  // ====== دوال رفع الصور ======

  triggerFileInput(fieldName: string): void {
    const inputMap: { [key: string]: ElementRef<HTMLInputElement> } = {
      'nationalIdImage': this.nationalIdImageInput,
      'nationalIdImageBack': this.nationalIdImageBackInput,
      'rationCardImage': this.rationCardImageInput,
      'additionalImage': this.additionalImageInput,
      'editNationalIdImage': this.editNationalIdImageInput,
      'editNationalIdImageBack': this.editNationalIdImageBackInput,
      'editRationCardImage': this.editRationCardImageInput
    };

    const inputRef = inputMap[fieldName];
    if (inputRef && inputRef.nativeElement) {
      inputRef.nativeElement.click();
    } else {
      console.error('لم يتم العثور على عنصر الإدخال:', fieldName);
    }
  }

  onFileSelected(event: any, fieldName: string): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'حجم الملف كبير', text: 'الحد الأقصى 5 ميجابايت' });
      event.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'warning', title: 'نوع ملف غير مدعوم', text: 'يرجى رفع صورة فقط' });
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;

      if (fieldName === 'editNationalIdImage') {
        this.selectedUser.nationalIdImage = imageData;
      } else if (fieldName === 'editNationalIdImageBack') {
        this.selectedUser.nationalIdImageBack = imageData;
      } else if (fieldName === 'editRationCardImage') {
        this.selectedUser.rationCardImage = imageData;
      } else if (fieldName === 'nationalIdImage') {
        this.newDepartment.nationalIdImage = imageData;
      } else if (fieldName === 'nationalIdImageBack') {
        this.newDepartment.nationalIdImageBack = imageData;
      } else if (fieldName === 'rationCardImage') {
        this.newDepartment.rationCardImage = imageData;
      } else if (fieldName === 'additionalImage') {
        this.newDepartment.additionalImage = imageData;
      }
    };
    reader.onerror = (error) => {
      console.error('خطأ في قراءة الملف:', error);
      Swal.fire({
        icon: 'error',
        title: 'خطأ في قراءة الملف',
        text: 'حدث خطأ أثناء محاولة قراءة الملف'
      });
    };
    reader.readAsDataURL(file);
  }

  removeImage(fieldName: string): void {
    const inputMap: { [key: string]: ElementRef<HTMLInputElement> } = {
      'nationalIdImage': this.nationalIdImageInput,
      'nationalIdImageBack': this.nationalIdImageBackInput,
      'rationCardImage': this.rationCardImageInput,
      'additionalImage': this.additionalImageInput,
      'editNationalIdImage': this.editNationalIdImageInput,
      'editNationalIdImageBack': this.editNationalIdImageBackInput,
      'editRationCardImage': this.editRationCardImageInput
    };

    const inputRef = inputMap[fieldName];
    if (inputRef && inputRef.nativeElement) {
      inputRef.nativeElement.value = '';
    }

    if (fieldName === 'editNationalIdImage') {
      this.selectedUser.nationalIdImage = '';
    } else if (fieldName === 'editNationalIdImageBack') {
      this.selectedUser.nationalIdImageBack = '';
    } else if (fieldName === 'editRationCardImage') {
      this.selectedUser.rationCardImage = '';
    } else if (fieldName === 'nationalIdImage') {
      this.newDepartment.nationalIdImage = '';
    } else if (fieldName === 'nationalIdImageBack') {
      this.newDepartment.nationalIdImageBack = '';
    } else if (fieldName === 'rationCardImage') {
      this.newDepartment.rationCardImage = '';
    } else if (fieldName === 'additionalImage') {
      this.newDepartment.additionalImage = '';
    }
  }

  // ====== تبديل إظهار كلمة المرور ======
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleEditPassword(): void {
    this.showEditPassword = !this.showEditPassword;
  }

  toggleAdminPassword(): void {
    this.showAdminPassword = !this.showAdminPassword;
  }

  // ====== تبديل إظهار كلمة سر بطاقة التموين ======
  toggleRationCardPassword(): void {
    this.showRationCardPassword = !this.showRationCardPassword;
  }

  toggleEditRationCardPassword(): void {
    this.showEditRationCardPassword = !this.showEditRationCardPassword;
  }

  // ====== فتح مودال تعديل مدير ======
  openEditAdmin(admin: User): void {
    this.selectedAdmin = {
      _id: admin._id,
      fullname: admin.fullname || '',
      username: admin.username || '',
      status: admin.status || 'active',
      newPassword: ''
    };
    this.showEditAdminModal = true;
    this.showEditAdminPassword = false;
  }

  // ====== إغلاق مودال تعديل مدير ======
  closeEditAdmin(): void {
    this.showEditAdminModal = false;
    this.selectedAdmin = {
      _id: '',
      fullname: '',
      username: '',
      status: 'active',
      newPassword: ''
    };
    this.showEditAdminPassword = false;
  }

  // ====== تبديل إظهار كلمة مرور تعديل المدير ======
  toggleEditAdminPassword(): void {
    this.showEditAdminPassword = !this.showEditAdminPassword;
  }

  // ====== حفظ تعديل المدير ======
  confirmEditAdmin(): void {
    const { _id, fullname, username, status, newPassword } = this.selectedAdmin;

    if (!_id) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'معرف المدير غير موجود'
      });
      return;
    }

    if (!fullname?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'الاسم الكامل مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!username?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'اسم المستخدم مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    const payload: any = {
      fullname: fullname.trim(),
      username: username.trim(),
      status: status || 'active',
      role: 'admin'
    };

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        Swal.fire({
          icon: 'warning',
          title: 'كلمة المرور ضعيفة',
          text: 'يجب أن تكون 6 أحرف على الأقل',
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }
      payload.password = newPassword.trim();
    }

    this.adminService.updateUser(_id, payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          const index = this.users.findIndex(u => u._id === _id);
          if (index !== -1) {
            this.users[index] = {
              ...this.users[index],
              ...payload
            };
          }
          this.applyFilters();
          this.updateStats();
          this.updateAdminsList();

          Swal.fire({
            icon: 'success',
            title: ' تم تعديل المدير بنجاح',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeEditAdmin();
        } else {
          Swal.fire({
            icon: 'error',
            title: response.message || 'خطأ في تعديل المدير'
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: 'خطأ في تعديل المدير',
          text: err.error?.message || err.message
        });
      }
    });
  }

  // ====== حساب عدد الأرغفة تلقائياً من عدد الأفراد ======
  calculateMonthlyBread(): void {
    const familyMembers = this.newDepartment.familyMembers || 0;
    this.newDepartment.monthlyBread = familyMembers * 150;
  }

  // ====== حساب عدد الأرغفة في التعديل ======
  calculateEditMonthlyBread(): void {
    const familyMembers = this.selectedUser.familyMembers || 0;
    this.selectedUser.monthlyBread = familyMembers * 150;
  }

  // ====== الانتقال إلى صفحة الملف الشخصي ======
  viewProfile(userId: string | undefined): void {
    if (!userId) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'معرف المستخدم غير موجود',
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    this.router.navigate(['/profile', userId]);
  }
}
