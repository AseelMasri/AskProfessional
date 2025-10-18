//professionalReviws.js
//  تحويل التقييم الرقمي إلى أيقونات
function getStarsHTML(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += `<i class="${i <= rating ? "fas" : "far"} fa-star"></i>`;
  }
  return stars;
}

//  متغيرات عامة
let allReviews = []; // لتخزين جميع التقييمات القادمة من السيرفر
let currentReviewIndex = 0; // أين وصلنا في عرض التقييمات
const REVIEWS_PER_LOAD = 3; //  عدد التقييمات التي نعرضها في كل دفعة

// عرض الدفعة التالية
function renderNextReviews() {
  const listContainer = document.getElementById("reviews-list");
  const showAllBtn = document.getElementById("btn-show-all");
  if (!listContainer) return;

  const nextBatch = allReviews.slice(currentReviewIndex, currentReviewIndex + REVIEWS_PER_LOAD);
  //بعد العرض، نحدّث المؤشر:
//currentReviewIndex += REVIEWS_PER_LOAD; // يصير 2
  // أخذ مجموعة جديدة من التقييمات لعرضها.

  nextBatch.forEach((r) => {
    const div = document.createElement("div");
    div.className = "review";
    div.innerHTML = `
      <div class="avatar-and-content">
        <div class="avatar">
          <img src="../assets/images/reservationProfile.png" alt="${r.user?.username || 'مستخدم'}" />
        </div>
        <div class="content-wrapper">
          <span class="name">${r.user?.username || 'مستخدم'}</span>
          <p class="text">${r.comment}</p>
        </div>
      </div>
      <div class="stars">${getStarsHTML(r.rating)}</div>
    `;
    listContainer.appendChild(div);
  });

  currentReviewIndex += REVIEWS_PER_LOAD;

  if (currentReviewIndex >= allReviews.length && showAllBtn) {
    showAllBtn.classList.add("d-none");
  }
}

//  جلب التقييمات من الباك
function fetchReviews() {
  const id = getProfessionalIdFromURL();
  if (!id) return;

  axios.get(`https://askprof-gojl.onrender.com/Review/getReviews/${id}`)
    .then((res) => {
      allReviews = res.data.reviews || [];
      currentReviewIndex = 0;

      const listContainer = document.getElementById("reviews-list");
      if (listContainer) listContainer.innerHTML = '';

      renderNextReviews();

      const showAllBtn = document.getElementById("btn-show-all");
      if (allReviews.length > REVIEWS_PER_LOAD && showAllBtn) {
        showAllBtn.classList.remove("d-none");
      }
    })
    .catch((err) => {
      console.error("فشل في جلب التقييمات:", err);
    });
}

//  إعداد زر "عرض المزيد"
function setupShowAllButton() {
  const showAllBtn = document.getElementById("btn-show-all");
  if (!showAllBtn) return;
  showAllBtn.addEventListener("click", renderNextReviews);
}

//  إعداد زر "إضافة تقييم"
function setupAddReviewButton() {
  const btn = document.getElementById("add-review-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const id = getProfessionalIdFromURL();
    const token = localStorage.getItem("token");

    const result = await Swal.fire({
      title: "إضافة تقييم",
      html: `
        <input type="number" id="review-rating" class="swal2-input" min="1" max="5" placeholder="التقييم من 5">
        <textarea id="review-comment" class="swal2-textarea" placeholder="اكتب رأيك هنا..."></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "إرسال",
      cancelButtonText: "إلغاء",
      preConfirm: () => {
        const rating = parseInt(document.getElementById("review-rating").value);
        const comment = document.getElementById("review-comment").value.trim();

        if (!rating || rating < 1 || rating > 5 || !comment) {
          Swal.showValidationMessage("يرجى إدخال تقييم بين 1 و 5 وتعليق");
          return false;
        }

        return { rating, comment };
      }
    });

    if (!result.value) return;

    try {
      await axios.post(
        `https://askprof-gojl.onrender.com/Review/addReview/${id}`,
        {
          rating: result.value.rating,
          comment: result.value.comment,
        },
        { headers: { token } }
      );

      Swal.fire("تم الإرسال", "تم إرسال التقييم بنجاح", "success");
      fetchReviews();
    } catch (err) {
      console.error("فشل في إرسال التقييم:", err);
      Swal.fire("خطأ", err.response?.data?.message || "حدث خطأ", "error");
    }
  });
}

//  إخفاء زر إضافة تقييم إذا كان صاحب الملف أو مهني
function hideAddReviewIfOwner() {
  const addReviewBtn = document.getElementById("add-review-btn");
  if (!addReviewBtn) return;

  const userId = getIdFromToken();
  const profileId = getProfessionalIdFromURL();

  if (!userId || !profileId) return;

  if (userId === profileId || isProfessionalUser()) {
    addReviewBtn.classList.add("d-none");
  }
}

//  عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  fetchReviews();
  setupShowAllButton();
  setupAddReviewButton();
  hideAddReviewIfOwner();
});
