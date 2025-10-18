//الإعداد 
const token = localStorage.getItem("token");

// بياناتي المستخرَجة من التوكن (معتمِدًا على tokenUtils.js)
const myId    = getIdFromToken();              //  من tokenUtils.js
const myModel = isProfessionalUser() ? "Professional" : "User"; // أو getModelFromToken()

const socket = io("https://askprof-gojl.onrender.com");

// معرّفات من الرابط
const urlParams      = new URLSearchParams(window.location.search);
const conversationId = urlParams.get("conversationId");
const professionalId = urlParams.get("professionalId");

// عناصر DOM
const chatMessages = document.querySelector('.chat-messages');
const input= document.querySelector('input.form-control');
const sendBtn = document.getElementById("sendBtn");
const proName           = document.getElementById("proName");
const proAvatar         = document.getElementById("proAvatar");
const myAvatarContainer = document.getElementById("myAvatar");

// متغيّرات حالة
let receiverId        = null;
let receiverImage     = null;
let myProfilePicture  = null;
let lastSentMessage   = null;
let lastSentTime      = 0;
let limit             = 20;
let skip              = 0;
let allMessagesLoaded = false;

// Spinner أعلى الرسائل 
const spinner = document.createElement("div");
spinner.innerHTML =
  `<div class="text-center py-2" id="loadingSpinner">
     <div class="spinner-border text-warning" role="status">
       <span class="visually-hidden">جاري التحميل...</span>
     </div>
   </div>`;
spinner.style.display = "none";
spinner.id = "spinner-top";
chatMessages.prepend(spinner);

// فعاليات الإدخال والإرسال 
input.addEventListener("input", () => {
  sendBtn.disabled = input.value.trim() === "";
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.repeat && input.value.trim()) handleSend();
});

sendBtn.addEventListener("click", handleSend);

// ============ الانضمام إلى الغرفة أو إنشاؤها ============
if (conversationId) {
  socket.emit("joinRoom", conversationId);
  fetchConversationAndSetReceiver(conversationId);
} else if (professionalId) {
  createConversationWithProfessional(professionalId);
}

// ============ تحميل المزيد عند التمرير للأعلى ============
chatMessages.addEventListener("scroll", async () => {
  if (chatMessages.scrollTop === 0 && !allMessagesLoaded) {
    spinner.style.display = "block";
    const prevHeight = chatMessages.scrollHeight;
    await loadMoreMessages();
    spinner.style.display = "none";
    chatMessages.scrollTop = chatMessages.scrollHeight - prevHeight;
  }
});

//  إرسال رسالة 
function handleSend() {
  const text = input.value.trim();
  const now  = Date.now();
  if (!text || !conversationId) return;

  // منع التكرار السريع
  if (text === lastSentMessage && now - lastSentTime < 3000) return;

  lastSentMessage = text;
  lastSentTime    = now;

  sendMessage(text);
  input.value = "";
  sendBtn.disabled = true;
}

// استقبال رسائل Socket
socket.on("newMessage", (msg) => renderMessage(msg));

//  وظائف Ajax وSocket 

async function sendMessage(text) {
  try {
    socket.emit("sendMessage", {
      conversationId,
      senderId: myId,
      senderModel: myModel,
      text
    });
  } catch (err) {
    console.error("فشل إرسال الرسالة:", err);
    Swal.fire("خطأ", "فشل إرسال الرسالة", "error");
  }
}

async function loadMoreMessages() {
  try {
    const res = await axios.get(
      `https://askprof-gojl.onrender.com/chat/messages/${conversationId}?limit=${limit}&skip=${skip}`,
      { headers: { token } }
    );
    const { messages } = res.data;

    if (messages.length < limit) allMessagesLoaded = true;
    skip += messages.length;

    messages.reverse().forEach((msg) => {
      const first  = document.querySelector(".chat-messages #spinner-top").nextSibling;
      const msgEl  = renderMessage(msg, true);
      chatMessages.insertBefore(msgEl, first);
    });
  } catch (err) {
    console.error("فشل تحميل المزيد من الرسائل:", err);
  }
}

async function createConversationWithProfessional(proId) {
  try {
    const res = await axios.post(
      "https://askprof-gojl.onrender.com/chat/conversations",
      { receiverId: proId, receiverModel: "Professional" },
      { headers: { token } }
    );
    const newId = res.data._id || res.data.conversationId;
    window.location.href = `professionalChat.html?conversationId=${newId}`;
  } catch (err) {
    console.error("فشل إنشاء المحادثة:", err);
    Swal.fire("خطأ", "لم يتم بدء المحادثة مع المهني", "error");
  }
}

async function fetchConversationAndSetReceiver(convoId) {
  try {
    const res = await axios.get(
      `https://askprof-gojl.onrender.com/chat/messages/${convoId}?limit=${limit}&skip=${skip}`,
      { headers: { token } }
    );
    const { receiver, sender, messages } = res.data;

    if (receiver) {
      receiverId    = receiver._id;
      receiverImage = receiver.profilePicture || null;

      // عرض معلومات المهني
      if (proName)   proName.textContent = receiver.username || "مهني";
      if (proAvatar) {
        proAvatar.innerHTML = receiver.profilePicture
          ? `<img src="${receiver.profilePicture}" class="rounded-circle" style="width:60px;height:60px;object-fit:cover;" onerror="this.onerror=null;this.src='../assets/images/default-user.jpg';">`
          : `<i class="fa-solid fa-user" style="color:#f7921e;font-size:28px;"></i>`;
      }
    }

    if (sender?.profilePicture) myProfilePicture = sender.profilePicture;

    skip += messages.length;

    // عرض الرسائل أقدم → أحدث
    messages.forEach((msg) => {
      const msgEl = renderMessage(msg, true);
      chatMessages.appendChild(msgEl);
    });

    // التمرير لأسفل
    setTimeout(() => (chatMessages.scrollTop = chatMessages.scrollHeight), 100);
  } catch (err) {
    console.error("فشل تحميل الرسائل:", err);
    Swal.fire("خطأ", "فشل تحميل الرسائل", "error");
  }
}

//  عرض رسالة واحدة 
function renderMessage(msg, returnElement = false) {
  const isMe        = msg.sender.userId === myId; //يتحقق إن كانت الرسالة صادرة من المستخدم الحالي 
  const senderModel = msg.sender.userModel;//يقرأ نوع المرسل

  const wrapper = document.createElement("div");
  wrapper.className = `d-flex align-items-start mb-4 ${isMe ? "justify-content-end" : ""}`;//اصطفاف الرسالة يمينًا اذا كانت الي

  const myDefaultAvatar =
    `<div class="ms-2">
       <div class="rounded-circle d-flex align-items-center justify-content-center contact-img"
            style="width:35px;height:35px;">
         <i class="fa-solid fa-user" style="color:#f7921e;font-size:20px;"></i>
       </div>
     </div>`;

  const otherDefaultAvatar =
    `<div class="me-2">
       <div class="rounded-circle d-flex align-items-center justify-content-center contact-img"
            style="width:35px;height:35px;">
         <i class="fa-solid fa-user" style="color:#f7921e;font-size:20px;"></i>
       </div>
     </div>`;

  const avatarHTML = isMe
    ? (myModel === "Professional" && myProfilePicture
        ? `<div class="ms-2"><img src="${myProfilePicture}" class="rounded-circle contact-img" style="width:35px;height:35px;object-fit:cover;" onerror="this.onerror=null;this.src='../assets/images/default-user.jpg';"></div>`
        : myDefaultAvatar)
    : (senderModel === "Professional" && receiverImage
        ? `<div class="me-2"><img src="${receiverImage}" class="rounded-circle contact-img" style="width:35px;height:35px;object-fit:cover;" onerror="this.onerror=null;this.src='../assets/images/default-user.jpg';"></div>`
        : otherDefaultAvatar);

  wrapper.innerHTML = `
    ${!isMe ? avatarHTML : ""}
    <div>
      <div class="${
        isMe
          ? "professional-message px-3 py-2 mb-1 text-start"
          : "bg-warning text-white rounded-3 px-3 py-2 mb-1 text-start"
      }" style="max-width:300px;font-size:14px;">${msg.text}</div>
      <div class="text-muted small ${isMe ? "text-end" : ""}">
        ${formatTime(msg.createdAt)}
      </div>
    </div>
    ${isMe ? avatarHTML : ""}
  `;

  if (returnElement) return wrapper;
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// تنسيق الوقت 
//تحويل الوقت من صيغة معقدة الى صيغة عربية بسيطة
function formatTime(isoDate) { // نحول من iso لdate
  return new Date(isoDate).toLocaleTimeString("ar-EG", { //نعرض الوقت بصيغة عربية
    hour: "2-digit",
    minute: "2-digit",
    //الاشي التلقائي رح يكون 12 ساعة النظام اذا بدي 24 ساعة في خاصية hour12:false
  });
}