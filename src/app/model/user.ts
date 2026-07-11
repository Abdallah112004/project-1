// ==================== user.model.ts ====================

/**
 * بيانات تسجيل الدخول
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * بيانات المستخدم الكاملة (متوافقة مع النظام الجديد)
 */
export interface User {
  _id?: string;

  // ====== بيانات الحساب (إجبارية) ======
  username: string;
  password?: string;
  newPassword?: string;
  role: 'admin' | 'client' | 'free_client';

  // ====== نوع العميل ======
  clientType?: 'regular' | 'free';

  // ====== حالة الحساب ======
  status?: 'active' | 'inactive';
  isFirstLogin?: boolean;
  isProfileComplete?: boolean;

  // ====== بيانات شخصية (اختيارية) ======
  fullname?: string;
  nationalId?: string;
  nationalIdImage?: string | File;
  nationalIdImageBack?: string | File;
  rationCardNumber?: string;
  rationCardPassword?: string;  // <-- كلمة سر بطاقة التموين
  rationCardImage?: string | File;
  additionalImage?: string | File;
  phone?: string;
  address?: string;
  familyMembers?: number;

  // ====== بيانات جغرافية (اختيارية) ======
  governorate?: string;
  center?: string;
  village?: string;
  location?: {
    lat: number;
    lng: number;
  };

  // ====== بيانات الأرغفة ======
  monthlyBread?: number;
  dailyBreadQuantity?: number;  // <-- الكمية اليومية المطلوبة
  consumedBread?: number;
  remainingBread?: number;
  dailyShare?: number; // الحصة اليومية
  breadPrice?: number; // سعر الرغيف
  customBreadPrice?: number | null; // سعر مخصص للعميل الحر
  discountPercentage?: number; // نسبة الخصم للعميل الحر
  monthlyCost?: number; // التكلفة الشهرية
  monthStart?: Date | string; // بداية الشهر
  lastUpdated?: Date | string; // آخر تحديث
  lastReceived?: Date | string;
  totalConsumedThisMonth?: number;
  totalRemainingThisMonth?: number;

  // ====== سجل الاستهلاك الشهري ======
  consumptionHistory?: ConsumptionHistory[];

  // ====== بيانات القطاع (اختياري) ======
  sector?: string | Sector;
  sectorName?: string;

  // ====== بيانات إضافية (اختيارية) ======
  rationOutlet?: string;
  department?: string;
  notes?: string; // ملاحظات للعميل الحر
  subscriptionEndDate?: Date | string | null; // تاريخ انتهاء الاشتراك
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * بيانات العميل الحر
 */
export interface FreeClient extends User {
  role: 'free_client';
  clientType: 'free';
  customBreadPrice: number;
  discountPercentage: number;
  notes: string;
  subscriptionEndDate: Date | string | null;
}

/**
 * بيانات إضافة عميل حر
 */
export interface AddFreeClientData {
  fullname: string;
  phone: string;
  address?: string;
  governorate?: string;
  center?: string;
  village?: string;
  username: string;
  password: string;
  monthlyBread?: number;
  dailyBreadQuantity?: number;  // <-- الكمية اليومية
  breadPrice?: number;
  discountPercentage?: number;
  notes?: string;
  subscriptionEndDate?: Date | string;
  familyMembers?: number;
}

/**
 * تقرير العملاء الأحرار
 */
export interface FreeClientReport {
  summary: {
    totalFreeClients: number;
    totalMonthlyBread: number;
    totalConsumed: number;
    totalRemaining: number;
    averageDiscount: string;
    totalRevenue: string;
    currency: string;
  };
  clients: FreeClientReportItem[];
}

/**
 * عنصر تقرير العميل الحر
 */
export interface FreeClientReportItem {
  id: string;
  fullname: string;
  phone: string;
  address: string;
  governorate: string;
  center: string;
  village: string;
  monthlyBread: number;
  dailyBreadQuantity: number;  // <-- الكمية اليومية
  consumed: number;
  remaining: number;
  breadPrice: number;
  customBreadPrice: number;
  discount: number;
  status: string;
  subscriptionEnd: Date | string | null;
  notes: string;
}

/**
 * إحصائيات العملاء الأحرار
 */
export interface FreeClientStats {
  totalFreeClients: number;
  totalMonthlyBread: number;
  totalConsumed: number;
  totalRemaining: number;
  averageDiscount: number;
  totalRevenue: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
}

/**
 * سجل الاستهلاك الشهري
 */
export interface ConsumptionHistory {
  month: number;
  year: number;
  monthlyAllocation: number;
  consumed: number;
  remaining: number;
  cost: number;
  date: Date | string;
}

/**
 * بيانات الأرغفة والكميات
 */
export interface BreadQuantities {
  monthlyBread: number;
  dailyBreadQuantity: number;  // <-- الكمية اليومية
  consumedBread: number;
  remainingBread: number;
  dailyShare: number;
  monthlyCost: number;
  breadPrice: number;
  daysInMonth: number;
  currentMonth: number;
  currentYear: number;
  isNewMonth: boolean;
  discountPercentage?: number;
  customBreadPrice?: number | null;
  subscriptionEndDate?: Date | string | null;
}

/**
 * بيانات التقرير الكامل للمستخدم
 */
export interface FullReport {
  user: {
    fullname: string;
    phone: string;
    address: string;
    familyMembers: number;
    nationalId: string;
    rationCardNumber: string;
    role?: string;
    clientType?: string;
  };
  breadDetails: {
    monthlyTotal: number;
    dailyBreadQuantity: number;  // <-- الكمية اليومية
    dailyShare: number;
    consumed: number;
    remaining: number;
    daysInMonth: number;
    currentMonth: number;
    currentYear: number;
    consumptionRate: string;
  };
  financialDetails: {
    breadPrice: number;
    customBreadPrice?: number | null;
    discountPercentage?: number;
    monthlyTotalCost: string;
    dailyCost: string;
    consumedCost: string;
    remainingCost: string;
    currency: string;
  };
  status: {
    isProfileComplete: boolean;
    hasRemaining: boolean;
    isActive: boolean;
    needsReset: boolean;
    subscriptionEndDate?: Date | string | null;
  };
}

/**
 * بيانات التقرير الشهري
 */
export interface MonthlyReport {
  period: {
    month: number;
    year: number;
    monthName: string;
  };
  summary: {
    totalUsers: number;
    regularClients: number;
    freeClients: number;
    totalMonthlyBread: number;
    totalDailyBreadQuantity: number;  // <-- إجمالي الكمية اليومية
    totalConsumed: number;
    totalRemaining: number;
    totalCost: string;
    currency: string;
    averageConsumption: string;
  };
  users: MonthlyUserReport[];
}

/**
 * تقرير مستخدم شهري
 */
export interface MonthlyUserReport {
  userId: string;
  fullname: string;
  phone: string;
  role: string;
  clientType: string;
  monthlyBread: number;
  dailyBreadQuantity: number;  // <-- الكمية اليومية
  consumed: number;
  remaining: number;
  breadPrice: number;
  discount: number;
  monthlyCost: string;
  consumptionRate: string;
  status: string;
}

/**
 * إحصائيات الخبز العامة
 */
export interface BreadStats {
  totalMonthlyBread: number;
  totalDailyBreadQuantity: number;  // <-- إجمالي الكمية اليومية
  totalConsumedBread: number;
  totalRemainingBread: number;
  totalBreadCost: number;
  averageConsumption: number;
  activeUsers: number;
  totalUsers: number;
}

/**
 * استجابة تسجيل الدخول
 */
export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

/**
 * التوكن المفكوك
 */
export interface DecodedToken {
  userId: string;
  name?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

/**
 * بيانات القطاع
 */
export interface Sector {
  _id?: string;
  sector: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * بيانات إضافة قطاع
 */
export interface addSector {
  sector: string;
}

/**
 * بيانات الأرغفة اليومية
 */
export interface DailyRation {
  _id?: string;
  client: string | User;
  date: Date | string;
  quantity: number;
  isReceived: boolean;
  receivedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * بيانات حجز الغد
 */
export interface Reservation {
  _id?: string;
  client: string | User;
  reservedDate: Date | string;
  quantity: number;
  createdAt?: Date | string;
  modifiedAt?: Date | string;
}

/**
 * بيانات سجل التعديلات
 */
export interface Log {
  _id?: string;
  client: string | User;
  action: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date | string;
  createdAt?: Date | string;
}

/**
 * بيانات الإحصائيات
 */
export interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalMonthlyBread: number;
  totalDailyBreadQuantity: number;  // <-- إجمالي الكمية اليومية
  totalConsumedBread: number;
  totalRemainingBread: number;
  totalReservations?: number;
  pendingReservations?: number;
  adminCount?: number;
  clientCount?: number;
  freeClientCount?: number;
  freeClientsStats?: {
    total: number;
    totalMonthlyBread: number;
    totalDailyBreadQuantity: number;  // <-- الكمية اليومية
    totalConsumed: number;
    averageDiscount: string;
    totalRevenue: string;
  };
}

/**
 * بيانات تقرير العميل
 */
export interface ClientDashboard {
  user: {
    fullname: string;
    phone: string;
    address: string;
    familyMembers: number;
    role?: string;
    clientType?: string;
    isProfileComplete: boolean;
  };
  bread: {
    monthlyAllocation: number;
    dailyBreadQuantity: number;  // <-- الكمية اليومية
    dailyShare: number;
    consumedThisMonth: number;
    remainingThisMonth: number;
    consumptionPercentage: number;
    daysInMonth: number;
    remainingDays: number;
  };
  financial: {
    breadPrice: number;
    customBreadPrice?: number | null;
    discountPercentage?: number;
    monthlySubscription: string;
    dailyCost: string;
    remainingCost: string;
    consumedCost: string;
    currency: string;
  };
  period: {
    month: number;
    year: number;
    monthName: string;
    isNewMonth: boolean;
  };
  status: {
    hasRemaining: boolean;
    isActive: boolean;
    needsProfileCompletion: boolean;
    subscriptionEndDate?: Date | string | null;
    isSubscriptionExpired?: boolean;
  };
}

/**
 * بيانات كشف التوزيع
 */
export interface DistributionReport {
  date: Date | string;
  clients: {
    fullname: string;
    phone: string;
    address: string;
    quantity: number;
    isReceived: boolean;
    receivedAt?: Date | string;
  }[];
  totalQuantity: number;
  totalReceived: number;
  totalPending: number;
}

/**
 * خيارات الفلترة والبحث
 */
export interface FilterOptions {
  searchTerm?: string;
  sector?: string;
  status?: 'active' | 'inactive' | 'all';
  governorate?: string;
  center?: string;
  sortBy?: 'fullname' | 'username' | 'monthlyBread' | 'dailyBreadQuantity' | 'consumedBread' | 'remainingBread';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  role?: 'admin' | 'client' | 'free_client' | 'all';
  clientType?: 'regular' | 'free' | 'all';
}

/**
 * استجابة قائمة المستخدمين مع ترقيم
 */
export interface PaginatedUsersResponse {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * بيانات تحديث كمية الغد
 */
export interface TomorrowReservation {
  clientId: string;
  quantity: number;
  canModify: boolean;
  message?: string;
}

/**
 * بيانات العميل للعرض في الجدول
 */
export interface UserTableRow {
  _id?: string;
  fullname: string;
  username: string;
  role: 'admin' | 'client' | 'free_client';
  clientType?: 'regular' | 'free';
  sector?: string;
  sectorName?: string;
  status: 'active' | 'inactive';
  nationalId: string;
  phone: string;
  address: string;
  familyMembers: number;
  monthlyBread: number;
  dailyBreadQuantity: number;  // <-- الكمية اليومية
  consumedBread: number;
  remainingBread: number;
  dailyShare: number;
  monthlyCost: number;
  governorate: string;
  center: string;
  village?: string;
  lastReceived?: Date | string;
  isProfileComplete?: boolean;
  breadPrice?: number;
  customBreadPrice?: number | null;
  discountPercentage?: number;
  subscriptionEndDate?: Date | string | null;
  notes?: string;
}

// ==================== للتوافق مع الكود القديم ====================
export interface Department {
  _id?: string;
  username: string;
  fullname: string;
  password: string;
  role: 'user' | 'admin';
  sector?: string;
}

/**
 * دالة للتحقق من اكتمال الملف الشخصي
 */
export function isProfileComplete(user: User): boolean {
  // للعميل الحر - الملف مكتمل دائماً
  if (user.role === 'free_client') {
    return true;
  }

  // للعميل العادي
  const requiredFields: (keyof User)[] = [
    'fullname',
    'nationalId',
    'phone',
    'address',
    'familyMembers',
    'rationOutlet'
  ];

  return requiredFields.every(field => {
    const value = user[field];
    if (field === 'familyMembers') {
      return typeof value === 'number' && value > 0;
    }
    return typeof value === 'string' && value.trim() !== '';
  });
}

/**
 * دالة لحساب الحصة اليومية
 */
export function calculateDailyShare(monthlyBread: number): number {
  if (!monthlyBread || monthlyBread <= 0) return 0;
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.ceil(monthlyBread / daysInMonth);
}

/**
 * دالة لحساب الكمية اليومية المطلوبة
 */
export function calculateDailyBreadQuantity(monthlyBread: number, customDailyQuantity?: number): number {
  // إذا تم تحديد كمية يومية مخصصة، استخدمها
  if (customDailyQuantity && customDailyQuantity > 0) {
    return customDailyQuantity;
  }

  // وإلا احسبها من الرصيد الشهري
  if (!monthlyBread || monthlyBread <= 0) return 0;
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.ceil(monthlyBread / daysInMonth);
}

/**
 * دالة لحساب التكلفة الشهرية
 */
export function calculateMonthlyCost(monthlyBread: number, breadPrice: number = 0.5): number {
  return (monthlyBread || 0) * (breadPrice || 0.5);
}

/**
 * دالة لحساب نسبة الاستهلاك
 */
export function calculateConsumptionRate(consumed: number, monthly: number): string {
  if (!monthly || monthly <= 0) return '0';
  return ((consumed / monthly) * 100).toFixed(2);
}

/**
 * دالة للتحقق من صلاحية اشتراك العميل الحر
 */
export function isSubscriptionValid(subscriptionEndDate: Date | string | null): boolean {
  if (!subscriptionEndDate) return true;
  const now = new Date();
  return new Date(subscriptionEndDate) > now;
}

/**
 * دالة لحساب الأيام المتبقية في الاشتراك
 */
export function getSubscriptionDaysRemaining(subscriptionEndDate: Date | string | null): number | null {
  if (!subscriptionEndDate) return null;
  const now = new Date();
  const end = new Date(subscriptionEndDate);
  if (end <= now) return 0;
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * دالة لحساب السعر بعد الخصم
 */
export function calculateDiscountedPrice(basePrice: number, discountPercentage: number): number {
  return basePrice * (1 - discountPercentage / 100);
}

/**
 * دالة مساعدة لتحويل المستخدم القديم إلى الجديد
 */
export function convertToNewUser(oldUser: any): User {
  const monthlyBread = oldUser.monthlyBread || 0;
  const dailyBreadQuantity = oldUser.dailyBreadQuantity || calculateDailyBreadQuantity(monthlyBread);

  const newUser: User = {
    _id: oldUser._id,
    username: oldUser.username || oldUser.name || '',
    role: oldUser.role === 'admin' ? 'admin' :
           oldUser.role === 'free_client' ? 'free_client' : 'client',
    clientType: oldUser.clientType || (oldUser.role === 'free_client' ? 'free' : 'regular'),
    status: oldUser.status || 'active',
    fullname: oldUser.fullname || oldUser.name || '',
    nationalId: oldUser.nationalId || '',
    phone: oldUser.phone || '',
    address: oldUser.address || '',
    familyMembers: oldUser.familyMembers || 0,
    monthlyBread: monthlyBread,
    dailyBreadQuantity: dailyBreadQuantity,  // <-- الكمية اليومية
    consumedBread: oldUser.consumedBread || 0,
    remainingBread: oldUser.remainingBread || 0,
    dailyShare: oldUser.dailyShare || calculateDailyShare(monthlyBread),
    breadPrice: oldUser.breadPrice || 0.5,
    customBreadPrice: oldUser.customBreadPrice || null,
    discountPercentage: oldUser.discountPercentage || 0,
    monthlyCost: oldUser.monthlyCost || calculateMonthlyCost(monthlyBread, oldUser.breadPrice || 0.5),
    governorate: oldUser.governorate || '',
    center: oldUser.center || '',
    village: oldUser.village || '',
    sector: oldUser.sector || '',
    sectorName: oldUser.sectorName || '',
    rationOutlet: oldUser.rationOutlet || '',
    department: oldUser.department || '',
    notes: oldUser.notes || '',
    subscriptionEndDate: oldUser.subscriptionEndDate || null,
    isFirstLogin: oldUser.isFirstLogin !== undefined ? oldUser.isFirstLogin : true,
    monthStart: oldUser.monthStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    lastUpdated: oldUser.lastUpdated || new Date(),
    createdAt: oldUser.createdAt,
    updatedAt: oldUser.updatedAt
  };

  // التحقق من اكتمال الملف
  newUser.isProfileComplete = isProfileComplete(newUser);

  return newUser;
}

/**
 * دالة مساعدة لتحويل المستخدم الجديد إلى القديم (للتوافق مع الـ API القديم)
 */
export function convertToOldUser(newUser: User): any {
  return {
    _id: newUser._id,
    username: newUser.username,
    fullname: newUser.fullname || '',
    role: newUser.role === 'admin' ? 'admin' :
          newUser.role === 'free_client' ? 'free_client' : 'user',
    clientType: newUser.clientType || 'regular',
    status: newUser.status || 'active',
    nationalId: newUser.nationalId || '',
    phone: newUser.phone || '',
    address: newUser.address || '',
    familyMembers: newUser.familyMembers || 0,
    monthlyBread: newUser.monthlyBread || 0,
    dailyBreadQuantity: newUser.dailyBreadQuantity || 0,  // <-- الكمية اليومية
    consumedBread: newUser.consumedBread || 0,
    remainingBread: newUser.remainingBread || 0,
    dailyShare: newUser.dailyShare || 0,
    breadPrice: newUser.breadPrice || 0.5,
    customBreadPrice: newUser.customBreadPrice || null,
    discountPercentage: newUser.discountPercentage || 0,
    monthlyCost: newUser.monthlyCost || 0,
    governorate: newUser.governorate || '',
    center: newUser.center || '',
    village: newUser.village || '',
    sector: newUser.sector || '',
    sectorName: newUser.sectorName || '',
    rationOutlet: newUser.rationOutlet || '',
    department: newUser.department || '',
    notes: newUser.notes || '',
    subscriptionEndDate: newUser.subscriptionEndDate || null,
    isFirstLogin: newUser.isFirstLogin !== undefined ? newUser.isFirstLogin : true,
    isProfileComplete: newUser.isProfileComplete || false,
    monthStart: newUser.monthStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    lastUpdated: newUser.lastUpdated || new Date(),
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt
  };
}

/**
 * دالة لإنشاء مستخدم جديد بإدخال أساسي فقط
 */
export function createBasicUser(username: string, password: string, role: 'admin' | 'client' | 'free_client' = 'client'): User {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    username,
    password,
    role,
    clientType: role === 'free_client' ? 'free' : 'regular',
    status: 'active',
    isFirstLogin: role !== 'free_client',
    isProfileComplete: role === 'free_client',
    fullname: '',
    nationalId: '',
    phone: '',
    address: '',
    familyMembers: 0,
    monthlyBread: 0,
    dailyBreadQuantity: 0,  // <-- الكمية اليومية
    consumedBread: 0,
    remainingBread: 0,
    dailyShare: 0,
    breadPrice: 0.5,
    customBreadPrice: role === 'free_client' ? 0.5 : null,
    discountPercentage: 0,
    monthlyCost: 0,
    governorate: '',
    center: '',
    village: '',
    rationOutlet: '',
    notes: '',
    subscriptionEndDate: null,
    monthStart: monthStart,
    lastUpdated: now,
    consumptionHistory: []
  };
}

/**
 * دالة لإنشاء تقرير كامل من بيانات المستخدم
 */
export function createFullReport(user: User, quantities: BreadQuantities): FullReport {
  const consumptionRate = quantities.monthlyBread > 0
    ? ((quantities.consumedBread / quantities.monthlyBread) * 100).toFixed(2)
    : '0';

  return {
    user: {
      fullname: user.fullname || '',
      phone: user.phone || '',
      address: user.address || '',
      familyMembers: user.familyMembers || 0,
      nationalId: user.nationalId || '',
      rationCardNumber: user.rationCardNumber || '',
      role: user.role,
      clientType: user.clientType
    },
    breadDetails: {
      monthlyTotal: quantities.monthlyBread,
      dailyBreadQuantity: quantities.dailyBreadQuantity || 0,  // <-- الكمية اليومية
      dailyShare: quantities.dailyShare,
      consumed: quantities.consumedBread,
      remaining: quantities.remainingBread,
      daysInMonth: quantities.daysInMonth,
      currentMonth: quantities.currentMonth,
      currentYear: quantities.currentYear,
      consumptionRate: consumptionRate
    },
    financialDetails: {
      breadPrice: quantities.breadPrice,
      customBreadPrice: quantities.customBreadPrice,
      discountPercentage: quantities.discountPercentage,
      monthlyTotalCost: quantities.monthlyCost.toFixed(2),
      dailyCost: (quantities.dailyShare * quantities.breadPrice).toFixed(2),
      consumedCost: (quantities.consumedBread * quantities.breadPrice).toFixed(2),
      remainingCost: (quantities.remainingBread * quantities.breadPrice).toFixed(2),
      currency: 'جنيه'
    },
    status: {
      isProfileComplete: user.isProfileComplete || false,
      hasRemaining: quantities.remainingBread > 0,
      isActive: user.status === 'active',
      needsReset: quantities.isNewMonth,
      subscriptionEndDate: quantities.subscriptionEndDate
    }
  };
}

/**
 * الحقول المطلوبة لإكمال الملف الشخصي
 */
export const PROFILE_REQUIRED_FIELDS: (keyof User)[] = [
  'fullname',
  'nationalId',
  'phone',
  'address',
  'familyMembers',
  'rationOutlet'
];

/**
 * رسائل الخطأ للحقول المطلوبة
 */
export const PROFILE_FIELD_LABELS: Record<string, string> = {
  _id: 'المعرف',
  username: 'اسم المستخدم',
  password: 'كلمة المرور',
  newPassword: 'كلمة المرور الجديدة',
  role: 'الدور',
  clientType: 'نوع العميل',
  status: 'الحالة',
  fullname: 'الاسم الكامل',
  nationalId: 'الرقم القومي',
  nationalIdImage: 'صورة البطاقة (الوجه)',
  nationalIdImageBack: 'صورة البطاقة (الظهر)',
  rationCardNumber: 'رقم بطاقة التموين',
  rationCardPassword: 'كلمة سر بطاقة التموين',  // <--
  rationCardImage: 'صورة بطاقة التموين',
  additionalImage: 'صورة إضافية',
  phone: 'رقم الهاتف',
  address: 'العنوان',
  familyMembers: 'عدد الأفراد',
  governorate: 'المحافظة',
  center: 'المركز',
  village: 'القرية',
  location: 'الموقع',
  monthlyBread: 'عدد الأرغفة الشهرية',
  dailyBreadQuantity: 'الكمية اليومية',  // <--
  consumedBread: 'الأرغفة المستهلكة',
  remainingBread: 'الأرغفة المتبقية',
  dailyShare: 'الحصة اليومية',
  breadPrice: 'سعر الرغيف',
  customBreadPrice: 'سعر الرغيف المخصص',
  discountPercentage: 'نسبة الخصم',
  monthlyCost: 'التكلفة الشهرية',
  monthStart: 'بداية الشهر',
  lastUpdated: 'آخر تحديث',
  lastReceived: 'آخر استلام',
  totalConsumedThisMonth: 'إجمالي المستهلك هذا الشهر',
  totalRemainingThisMonth: 'إجمالي المتبقي هذا الشهر',
  consumptionHistory: 'سجل الاستهلاك',
  sector: 'القطاع',
  sectorName: 'اسم القطاع',
  rationOutlet: 'منفذ صرف التموين',
  department: 'القسم',
  notes: 'ملاحظات',
  subscriptionEndDate: 'تاريخ انتهاء الاشتراك',
  isFirstLogin: 'أول تسجيل دخول',
  isProfileComplete: 'اكتمال الملف',
  createdAt: 'تاريخ الإنشاء',
  updatedAt: 'تاريخ التحديث'
};

/**
 * أنواع الأدوار المتاحة
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  FREE_CLIENT: 'free_client'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * أنواع العملاء
 */
export const CLIENT_TYPES = {
  REGULAR: 'regular',
  FREE: 'free'
} as const;

export type ClientType = typeof CLIENT_TYPES[keyof typeof CLIENT_TYPES];

/**
 * حالات المستخدم
 */
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const;

export type UserStatus = typeof USER_STATUSES[keyof typeof USER_STATUSES];

// ==================== daily-bread.model.ts ====================

export interface DailyBread {
  _id?: string;
  userId: string;
  userFullname: string;
  userUsername: string;
  date: Date;
  day: number; // 1-31
  month: number; // 1-12
  year: number;
  breadCount: number; // عدد الأرغفة المصروفة في هذا اليوم
  remainingBread: number; // الرصيد المتبقي بعد الصرف
  notes?: string;
  createdBy?: string; // من قام بالتسجيل (مدير)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DailyBreadStats {
  totalBreadToday: number;
  totalUsersToday: number;
  averageBreadPerUser: number;
  remainingBreadToday: number;
}

export interface DailyBreadFilter {
  date?: Date;
  month?: number;
  year?: number;
  userId?: string;
  searchTerm?: string;
}

export interface BreadConsumptionSummary {
  userId: string;
  userFullname: string;
  dailyAverage: number;
  totalConsumed: number;
  monthlyAllocation: number;
  remaining: number;
  daysActive: number;
}
