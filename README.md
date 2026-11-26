# Silingan: Barangay Community Feed and Local Engagement Platform

**Project Increment 1: User Accounts, Authentication, and Role-Based Dashboards**  
**Project Increment 2: User Profile and Password Management**

**Course:** IT342 - Systems Integration and Architecture 1  
**Author:** S Brent Sanico  

---

## 📌 Features Implemented in Increment 1

1. **User Account Creation (Registration)**
   - Role-based registration corresponding to SRS actor definitions (`RESIDENT`, `OFFICIAL`, `ADMIN`).
   - Validates required fields (`name`, `email`, `password`, `role`).
   - Prevents duplicate email accounts in PostgreSQL / Supabase.
   - Securely hashes passwords using **BCrypt** (`PasswordEncoder`).
   - Stores user credentials and profile records.

2. **User Login and Logout**
   - User authentication via registered credentials.
   - Generates and signs **JSON Web Tokens (JWT)** with 24-hour expiration.
   - Role claims embedded directly within the JWT.
   - Error handling for invalid credentials or non-existent accounts.
   - Full logout session termination with client-side state and token clearing.
   - Protected API routes enforcing Bearer token validation via `JwtAuthenticationFilter`.

3. **Role-Based User Dashboard**
   - **Resident Dashboard:** Location verification status, submitted concerns tracking, access to hyper-local chronological feed.
   - **Barangay Official Dashboard:** Active concern management queue, official announcement board access, community moderation metrics.
   - **System Administrator Dashboard:** Platform health, barangay registration management, role allocation console.
   - Client and server-side authorization enforcement.

---

## Features Implemented in Increment 2: User Profile and Password Management

1. **User Profile Management** (`My Profile` in the sidebar, or click your name in the top bar)
   - View your own name, email, role, contact number, address, bio, and barangay.
   - Edit name, contact number, address, and bio, with validation in the browser and on the server (Bean Validation).
   - Only the signed-in user's own profile is reachable: every route uses `/api/users/me` and resolves the account from the JWT. Email and role cannot be changed through this endpoint.
2. **Forgot / Reset Password** (`Forgot password?` on the login page)
   - Generates a random 256-bit token that **expires after 30 minutes** and **works once**. Only its SHA-256 hash is stored in the `password_reset_tokens` table.
   - Emails the user a link to `/reset-password?token=...`. The response is the same whether or not the email exists, which prevents account enumeration. Requests are throttled to one per 60 seconds per account.
   - The new password is BCrypt-hashed. All earlier sessions are revoked and any other open reset links are invalidated.
3. **Change Password** (`Change Password` in the sidebar)
   - Requires the current password, a new password that meets the policy, and a matching confirmation. The new password must differ from the current one.
   - The old password stops working immediately, and JWTs issued before the change are rejected (`token_version` check). The current session receives a fresh token.

Password policy (registration, change, and reset): 8–72 characters, with at least one letter and one number.

### New / changed API endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/users/me` | Bearer | View own profile |
| PUT | `/api/users/me` | Bearer | Update own profile |
| PUT | `/api/users/me/password` | Bearer | Change password |
| POST | `/api/auth/forgot-password` | Public | Request a reset link |
| GET | `/api/auth/reset-password/validate?token=` | Public | Check a reset link |
| POST | `/api/auth/reset-password` | Public | Set a new password with a reset token |

### Email configuration for reset links

Set these environment variables before starting the backend, for example with a Gmail App Password:

```powershell
$env:SPRING_MAIL_HOST = "smtp.gmail.com"
$env:SPRING_MAIL_PORT = "587"
$env:SPRING_MAIL_USERNAME = "your.address@gmail.com"
$env:SPRING_MAIL_PASSWORD = "your-16-char-app-password"
$env:MAIL_FROM = "your.address@gmail.com"
```

If `SPRING_MAIL_HOST` is not set, the backend writes the reset link to its console log (`Password reset link for ...`) so the flow can still be tested locally.

### Running without Supabase / automated tests

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=h2"   # in-memory H2 database, data resets on restart
mvn test                                             # 10 API integration tests for Increments 1 and 2
```

Screenshots of every step are in [docs/screenshots](docs/screenshots). The completion report is [docs/Increment-2-Completion-Report.pdf](docs/Increment-2-Completion-Report.pdf).

---

## 🛠️ Tech Stack

- **Backend:** Java 17, Spring Boot 3.3.0, Spring Security 6, Spring Data JPA, JJWT (io.jsonwebtoken 0.12.5), BCrypt
- **Database:** Supabase (Cloud PostgreSQL) / PostgreSQL 15+
- **Frontend:** React 18, Vite 5, Modern CSS Layouts

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Java JDK 17 or higher
- Apache Maven 3.9+
- Node.js 18+ and npm

### 1. Database Configuration
The application is pre-configured to connect to Supabase PostgreSQL in `src/main/resources/application.yml`.
Ensure your database password is set in `application.yml` or passed via environment variable:
```powershell
$env:SUPABASE_PASSWORD = "your_database_password"
```

### 2. Running the Spring Boot Backend
Open a terminal and run:
```powershell
# If using the included portable Maven:
$env:Path = "C:\Users\L23Y19W38\tools\apache-maven-3.9.9\bin;" + $env:Path

cd C:\Users\L23Y19W38\Downloads\silingan
mvn spring-boot:run
```
The backend REST API starts on `http://localhost:8080`.

### 3. Running the React Frontend
Open a second terminal and run:
```powershell
cd C:\Users\L23Y19W38\Downloads\silingan\frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Testing the Requirements

1. Navigate to `http://localhost:5173`.
2. Click **Create Account** and register test accounts:
   - `juan@resident.com` with role **Resident**
   - `kapitan@official.com` with role **Barangay Official**
   - `admin@silingan.gov` with role **System Administrator**
3. Log in with each account and observe the role-tailored dashboards and navigation.
4. Click **Log Out** to confirm secure termination of the session.
