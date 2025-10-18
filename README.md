# AskProfessional
The AskProfessional platform connects users with professionals in various fields such as electricity, construction workshops, and technology.  
It allows users to request services, schedule appointments, send instant messages, and evaluate work quality easily and quickly through a modern and user-friendly Arabic interface.
## Key Features
- Browse professionals by specialization, location, and rating.  
- Schedule appointments directly through the platform.  
- Instant messaging between users and professionals using Socket.IO.  
- Review and rating system based on customer experiences.  
## Front-End Technologies
The front-end was built using HTML, CSS, JavaScript, and Bootstrap to create responsive and user-friendly pages.  
Libraries such as SweetAlert2, Axios, Swiper.js, Socket.IO, Font Awesome, and SheetJS were used to enhance interactivity, design, and functionality.
## Back-End Technologies
The back-end was developed with Node.js and Express.js, using MongoDB as the main database and Mongoose for data modeling.  
Key tools include JWT for authentication, bcryptjs for password security, multer and cloudinary for file handling, nodemailer for email notifications, and Socket.IO for real-time chat.
## Installation & Run (Front-End Only)

### 1) Prerequisites
- Any modern web browser.  
- *(Optional)* A simple local server to avoid CORS issues when using `Axios`.

---

### 2) Clone
```bash
git clone https://github.com/AseelMasri/AskProfessional.git
cd AskProfessional
```
---

### 3) Run Locally
#### Option A: Using VS Code (Live Server)
- Open the project folder in Visual Studio Code.  
- Install the Live Server extension.  
- Right-click on index.html and select Open with Live Server.

#### Option B: Using a Simple HTTP Server
```bash
npx http-server -p 5500
```
## Demo
Live site: https://AseelMasri.github.io/AskProfessional/ 
## Team
- Aseel Masri – Front-End Developer
- Aseel Shaher – Back-End Developer  
- Graduation Project – Palestine Technical University(PTUK)
## Future Work
To enhance performance and expand the platform’s capabilities in the future, several improvements are planned, including:

- **Mobile Applications:** Develop Android and iOS apps with push notifications for easier access and real-time interaction.  
- **Chat Enhancements:** Add typing indicators, online/offline status, and possibly voice or video calls.  
- **Geographical Expansion:** Support more regions with localized options and pricing.  
- **Multilingual Interface:** Provide Arabic and English versions for wider accessibility.  
- **Online Payments:** Integrate secure payment gateways such as credit cards and e-wallets.  
- **Modern Frameworks:** Consider migrating to modern front-end technologies like React.js for better scalability and performance.

