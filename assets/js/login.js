//login.js
document.addEventListener('DOMContentLoaded', function () {
  initializeSavedCredentials();
  setupPasswordToggle();
  setupLoginHandler();
});

//  تحميل البريد وكلمة المرور من localStorage
function initializeSavedCredentials() {
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('rememberMe');

  const savedEmail = localStorage.getItem('savedEmail');
  const savedPassword = localStorage.getItem('savedPassword');

  if (savedEmail && savedPassword) {
    emailInput.value = savedEmail;
    passwordInput.value = savedPassword;
    rememberMeCheckbox.checked = true;
  }
}

//  تفعيل زر إظهار/إخفاء كلمة المرور
function setupPasswordToggle() {
  const togglePassword = document.querySelector('.toggle-password');
  const passwordInput = document.getElementById('password');

  if (togglePassword) {
    togglePassword.addEventListener('click', function () {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      this.classList.toggle('fa-eye-slash');
      this.classList.toggle('fa-eye');
    });
  }
}

//  معالجة تسجيل الدخول
function setupLoginHandler() {
  const loginBtn = document.querySelector('.main__bgcolor');
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('rememberMe');

  loginBtn.addEventListener('click', async function (e) {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      return Swal.fire({
        icon: 'warning',
        title: 'تحذير',
        text: 'يرجى تعبئة البريد وكلمة المرور'
      });
    }

    Swal.fire({
      title: 'جاري التحقق...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch('https://askprof-gojl.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      Swal.close();

      if (response.ok && data.token) {
        //لتذكرني
        if (rememberMeCheckbox.checked) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password);
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
        }

        localStorage.setItem('token', data.token);
        
Swal.fire({
  icon: 'success',
  title: 'تم تسجيل الدخول',
  text: 'جاري تحويلك...',
  timer: 2000,
  showConfirmButton: false
}).then(() => {
  //التوجيه بعد تسجيل الدخول

  const redirectPath = localStorage.getItem("redirectAfterLogin");

  if (redirectPath && redirectPath.includes("profile.html")) {
    //  إذا كان من صفحة البروفايل → ننتقل إلى دليل المهنيين
    window.location.href = "../pages/professional.html";
  } else if (redirectPath) {
    // باقي الصفحات → نرجع لنفس الصفحة
    window.location.href = redirectPath;
  } else {
    //  لا يوجد مسار محفوظ → نفتح الرئيسية أو الدليل
    window.location.href = "../index.html"; // أو "../pages/professionals.html" إذا بدك
  }

  //  حذف التوجيه بعد تسجيل الدخول
  localStorage.removeItem("redirectAfterLogin");
});


      } else {
        Swal.fire({
          icon: 'error',
          title: 'فشل تسجيل الدخول',
          text: data.message || 'حدث خطأ أثناء محاولة تسجيل الدخول'
        });
      }
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'خطأ في الاتصال',
        text: 'تعذر الاتصال بالخادم'
      });
    }
  });
}