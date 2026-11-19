# Silingan: Barangay Community Feed and Local Engagement Platform

**Project Increment 1: User Accounts, Authentication, and Role-Based Dashboards**

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
