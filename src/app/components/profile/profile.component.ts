import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrationService } from '../../service/user.service';
import { User } from '../../model/user';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userId: string = '';
  user: User | null = null;
  isLoading: boolean = true;
  isEditing: boolean = false;
  showPassword: boolean = false;

  // متغيرات عرض الصور
  showImageViewer: boolean = false;
  imageViewerSrc: string = '';
  imageViewerTitle: string = '';
  zoomLevel: number = 1;

  // ====== متغيرات رفع الصور ======
  uploadingImages: boolean = false;
  newImages: { [key: string]: string } = {}; // لتخزين الصور المرفوعة حديثاً
  imageFileMap: { [key: string]: File } = {}; // لتخزين ملفات الصور للرفع

  // نسخة للتعديل
  editUser: any = {
    fullname: '',
    username: '',
    phone: '',
    address: '',
    nationalId: '',
    rationCardNumber: '',
    familyMembers: 0,
    monthlyBread: 0,
    governorate: '',
    center: '',
    village: '',
    rationOutlet: '',
    nationalIdImage: '',
    nationalIdImageBack: '',
    rationCardImage: '',
    additionalImage: '',
    newPassword: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdministrationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      if (this.userId) {
        this.loadUserProfile();
      } else {
        // إذا لم يوجد ID في الرابط، استخدم المستخدم الحالي من localStorage
        this.loadCurrentUserFromStorage();
      }
    });
  }

  // ====== تحميل ملف المستخدم بواسطة ID ======
  loadUserProfile(): void {
    this.isLoading = true;
    this.adminService.getUserById(this.userId).subscribe({
      next: (data: any) => {
        this.user = data.data || data;
        if (this.user) {
          this.editUser = { ...this.user };
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('خطأ في جلب بيانات المستخدم:', err);
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء تحميل بيانات المستخدم'
        });
        this.isLoading = false;
      }
    });
  }

  // ====== تحميل المستخدم الحالي من localStorage ======
  loadCurrentUserFromStorage(): void {
    this.isLoading = true;
    const currentUser = this.adminService.getCurrentUser();
    if (currentUser && currentUser._id) {
      // جلب البيانات الكاملة من الـ API باستخدام ID المستخدم
      this.adminService.getUserById(currentUser._id).subscribe({
        next: (data: any) => {
          this.user = data.data || data;
          if (this.user) {
            this.editUser = { ...this.user };
          }
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('خطأ في جلب بيانات المستخدم:', err);
          // في حالة الخطأ، استخدم البيانات من localStorage
          this.user = currentUser;
          this.editUser = { ...currentUser };
          this.isLoading = false;
        }
      });
    } else {
      // إذا لم يوجد مستخدم، حاول جلب المستخدم الحالي من الـ API
      this.loadCurrentUserFromAPI();
    }
  }

  // ====== تحميل المستخدم الحالي من الـ API ======
  loadCurrentUserFromAPI(): void {
    this.isLoading = true;
    // استخدام getAllUsers ثم فلترة المستخدم الحالي (هذه طريقة بديلة)
    this.adminService.getAllUsers().subscribe({
      next: (users: any) => {
        const usersArray = Array.isArray(users) ? users : (users.data || []);
        // البحث عن المستخدم الحالي باستخدام الـ token أو localStorage
        const currentUser = this.adminService.getCurrentUser();
        if (currentUser && currentUser._id) {
          this.user = usersArray.find((u: any) => u._id === currentUser._id) || null;
        } else {
          // إذا لم يتم العثور على المستخدم، استخدم أول مستخدم (للتجربة)
          this.user = usersArray[0] || null;
        }
        if (this.user) {
          this.editUser = { ...this.user };
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('خطأ في جلب بيانات المستخدمين:', err);
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء تحميل بيانات المستخدم'
        });
        this.isLoading = false;
      }
    });
  }

  // ====== تفعيل وضع التعديل ======
  enableEditing(): void {
    this.isEditing = true;
    if (this.user) {
      this.editUser = { ...this.user };
      // تنظيف بيانات الصور المؤقتة عند بدء التعديل
      this.newImages = {};
      this.imageFileMap = {};
    }
  }

  // ====== إلغاء التعديل ======
  cancelEditing(): void {
    this.isEditing = false;
    if (this.user) {
      this.editUser = { ...this.user };
    }
    // تنظيف بيانات الصور المؤقتة
    this.newImages = {};
    this.imageFileMap = {};
    this.uploadingImages = false;
  }

  // ====== حفظ التعديلات (معدل لدعم رفع الصور) ======
  saveProfile(): void {
    if (!this.user?._id) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'معرف المستخدم غير موجود'
      });
      return;
    }

    // التحقق من الحقول المطلوبة
    if (!this.editUser.fullname?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'الاسم الكامل مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!this.editUser.phone?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'رقم الهاتف مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!this.editUser.address?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'العنوان مطلوب',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    // حساب عدد الأرغفة تلقائياً
    const familyMembers = this.editUser.familyMembers || 0;
    const monthlyBread = familyMembers * 150;

    // إعداد البيانات للإرسال
    const payload: any = {
      fullname: this.editUser.fullname.trim(),
      username: this.editUser.username,
      phone: this.editUser.phone.trim(),
      address: this.editUser.address.trim(),
      nationalId: this.editUser.nationalId?.trim() || '',
      rationCardNumber: this.editUser.rationCardNumber?.trim() || '',
      familyMembers: familyMembers,
      monthlyBread: monthlyBread,
      governorate: this.editUser.governorate?.trim() || '',
      center: this.editUser.center?.trim() || '',
      village: this.editUser.village?.trim() || '',
      rationOutlet: this.editUser.rationOutlet?.trim() || '',
      nationalIdImage: this.editUser.nationalIdImage || '',
      nationalIdImageBack: this.editUser.nationalIdImageBack || '',
      rationCardImage: this.editUser.rationCardImage || '',
      additionalImage: this.editUser.additionalImage || ''
    };

    // إذا كان هناك كلمة مرور جديدة
    if (this.editUser.newPassword && this.editUser.newPassword.trim()) {
      if (this.editUser.newPassword.trim().length < 6) {
        Swal.fire({
          icon: 'warning',
          title: 'كلمة المرور ضعيفة',
          text: 'يجب أن تكون 6 أحرف على الأقل',
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }
      payload.password = this.editUser.newPassword.trim();
    }

    // عرض مؤشر تحميل أثناء الحفظ
    Swal.fire({
      title: 'جاري الحفظ...',
      text: 'يرجى الانتظار',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    // التحقق من وجود صور جديدة للرفع
    const hasNewImages = Object.keys(this.imageFileMap).length > 0;

    if (hasNewImages) {
      // رفع الصور أولاً ثم تحديث البيانات
      this.uploadImages().then((uploadResponse: any) => {
        // تحديث payload بمسارات الصور من الاستجابة
        if (uploadResponse && uploadResponse.data) {
          Object.keys(uploadResponse.data).forEach(key => {
            if (uploadResponse.data[key]) {
              payload[key] = uploadResponse.data[key];
            }
          });
        }
        // ثم تحديث بيانات المستخدم
        const userId = this.user?._id || '';
        return this.adminService.updateUser(userId, payload).toPromise();
      }).then((response: any) => {
        this.handleSaveResponse(response);
      }).catch((error: any) => {
        this.handleSaveError(error);
      });
    } else {
      // لا توجد صور جديدة، فقط تحديث البيانات
      const userId = this.user._id || '';
      this.adminService.updateUser(userId, payload).subscribe({
        next: (response: any) => {
          this.handleSaveResponse(response);
        },
        error: (err: HttpErrorResponse) => {
          this.handleSaveError(err);
        }
      });
    }
  }

  // ====== معالجة استجابة الحفظ ======
  private handleSaveResponse(response: any): void {
    if (response.success) {
      this.user = { ...this.user, ...response.data };
      this.isEditing = false;
      // تنظيف بيانات الصور المؤقتة
      this.newImages = {};
      this.imageFileMap = {};
      this.uploadingImages = false;

      Swal.fire({
        icon: 'success',
        title: '✅ تم حفظ التغييرات بنجاح',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: response.message || 'حدث خطأ أثناء حفظ التغييرات'
      });
    }
  }

  // ====== معالجة خطأ الحفظ ======
  private handleSaveError(error: any): void {
    console.error('خطأ في الحفظ:', error);
    this.uploadingImages = false;
    Swal.fire({
      icon: 'error',
      title: 'خطأ',
      text: error?.message || error?.error?.message || 'حدث خطأ أثناء حفظ التغييرات'
    });
  }

  // ====== العودة إلى الصفحة السابقة ======
  goBack(): void {
    this.router.navigate(['/administration']);
  }

  // ====== حساب عدد الأرغفة تلقائياً ======
  calculateMonthlyBread(): void {
    const familyMembers = this.editUser.familyMembers || 0;
    this.editUser.monthlyBread = familyMembers * 150;
  }

  // ====== دوال عرض الصور ======
  hasUserImages(user: any): boolean {
    return !!(
      (typeof user?.nationalIdImage === 'string' && user.nationalIdImage) ||
      (typeof user?.nationalIdImageBack === 'string' && user.nationalIdImageBack) ||
      (typeof user?.rationCardImage === 'string' && user.rationCardImage) ||
      (typeof user?.additionalImage === 'string' && user.additionalImage)
    );
  }

  getImageUrl(image: string | File | null | undefined): string {
    if (typeof image === 'string') {
      return image;
    }
    return '';
  }

  openImageViewer(imageSrc: string | File | null | undefined, title: string): void {
    if (typeof imageSrc === 'string' && imageSrc) {
      this.imageViewerSrc = imageSrc;
      this.imageViewerTitle = title;
      this.zoomLevel = 1;
      this.showImageViewer = true;
      document.body.style.overflow = 'hidden';
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'لا يمكن عرض الصورة',
        text: 'الصورة غير متوفرة',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  closeImageViewer(): void {
    this.showImageViewer = false;
    this.imageViewerSrc = '';
    this.imageViewerTitle = '';
    this.zoomLevel = 1;
    document.body.style.overflow = '';
  }

  zoomImage(direction: string): void {
    if (direction === 'in') {
      this.zoomLevel = Math.min(this.zoomLevel + 0.2, 3);
    } else if (direction === 'out') {
      this.zoomLevel = Math.max(this.zoomLevel - 0.2, 0.5);
    }
  }

  resetZoom(): void {
    this.zoomLevel = 1;
  }

  downloadImage(): void {
    if (this.imageViewerSrc) {
      const link = document.createElement('a');
      link.href = this.imageViewerSrc;
      link.download = this.imageViewerTitle || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // ====== تبديل إظهار كلمة المرور ======
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // =============================================
  // ====== دوال رفع الصور ======
  // =============================================

  /**
   * معالجة اختيار ملف الصورة
   */
  onFileSelected(event: any, fieldName: string): void {
    const file = event.target.files[0];
    if (!file) return;

    // التحقق من حجم الملف (حد أقصى 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'حجم الملف كبير جداً',
        text: 'الحد الأقصى لحجم الصورة هو 5 ميجابايت',
        timer: 3000,
        showConfirmButton: false
      });
      event.target.value = '';
      return;
    }

    // التحقق من نوع الملف
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'warning',
        title: 'نوع الملف غير مدعوم',
        text: 'الصيغ المدعومة: JPG, PNG, GIF, WEBP',
        timer: 3000,
        showConfirmButton: false
      });
      event.target.value = '';
      return;
    }

    // قراءة الملف وعرضه كمعاينة
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // تخزين الصورة كـ base64 للعرض الفوري
      this.editUser[fieldName] = e.target.result;
      // تخزين الملف للرفع
      this.imageFileMap[fieldName] = file;
      // تخزين الصورة في قائمة الصور الجديدة
      this.newImages[fieldName] = e.target.result;

      Swal.fire({
        icon: 'success',
        title: 'تم رفع الصورة بنجاح',
        text: 'لا تنسى حفظ التغييرات لتثبيت الصورة',
        timer: 2000,
        showConfirmButton: false
      });
    };
    reader.readAsDataURL(file);
  }

  /**
   * حذف صورة من المستخدم
   */
  removeImage(fieldName: string): void {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم حذف هذه الصورة نهائياً',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        // حذف الصورة من editUser
        this.editUser[fieldName] = '';
        // حذف الملف من الخريطة إذا كان موجوداً
        delete this.imageFileMap[fieldName];
        // حذف من الصور الجديدة
        delete this.newImages[fieldName];

        Swal.fire({
          icon: 'success',
          title: 'تم حذف الصورة',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }

  /**
   * التحقق من وجود صور جديدة
   */
  hasNewImages(): boolean {
    return Object.keys(this.newImages).length > 0;
  }

  /**
   * الحصول على عدد الصور الجديدة
   */
  getNewImagesCount(): number {
    return Object.keys(this.newImages).length;
  }

  /**
   * الحصول على قائمة الصور الجديدة
   */
  getNewImagesList(): { key: string, url: string }[] {
    return Object.keys(this.newImages).map(key => ({
      key: key,
      url: this.newImages[key]
    }));
  }

  /**
   * التحقق مما إذا كانت الصورة جديدة
   */
  isNewImage(fieldName: string): boolean {
    return !!this.newImages[fieldName];
  }

  /**
   * رفع الصور إلى الخادم - الطريقة المعدلة
   * يتم إرسال الصور كـ base64 مباشرة مع تحديث المستخدم
   */
  uploadImages(): Promise<any> {
    return new Promise((resolve, reject) => {
      const files = Object.keys(this.imageFileMap);
      if (files.length === 0) {
        resolve({});
        return;
      }

      this.uploadingImages = true;

      // إنشاء payload يحتوي على الصور كـ base64
      const imagePayload: any = {};
      files.forEach(key => {
        // استخدام الصورة المخزنة في editUser (base64)
        imagePayload[key] = this.editUser[key] || '';
      });

      // إرسال الصور كـ base64 مع تحديث المستخدم
      const userId = this.user?._id || '';
      this.adminService.updateUser(userId, imagePayload).subscribe({
        next: (response: any) => {
          this.uploadingImages = false;
          resolve(response);
        },
        error: (error: any) => {
          this.uploadingImages = false;
          reject(error);
        }
      });
    });
  }
}
