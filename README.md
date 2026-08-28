# AMRI — Association for Mathematics, Research and Innovation

> A modern, research-focused web platform for presenting AMRI's research, programs, events, innovations, and membership opportunities.

AMRI is implemented as a full-stack web application with a React/Vite frontend, an Express/MongoDB backend, secure administrator authentication, Cloudinary image uploads, and SMTP-powered email workflows.

---

## ✨ Overview

The AMRI website provides two primary experiences:

### Public Website
Visitors can:

- Explore AMRI and its mission
- Browse research areas and publications
- Discover programs and initiatives
- View upcoming and past events
- Explore innovation projects
- Submit membership applications
- Send messages through the contact form
- Request registration links for events and programs

### Admin Portal
Authorized administrators can:

- Sign in securely
- View dashboard statistics
- Create, edit, publish, feature, and delete content
- Manage research entries
- Manage events
- Manage programs
- Manage innovation projects
- Upload images through Cloudinary
- Manage administrator accounts according to role permissions
- View/update their admin profile

---

## 🧱 Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI development |
| Vite | Development server and production build |
| React Router | Client-side routing |
| Tailwind CSS 4 | Styling and design system |
| Axios | API communication |
| Lucide React | UI icons |
| Oxlint | Code linting |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | REST API |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| JWT | Admin authentication |
| bcryptjs | Password hashing |
| Nodemailer | Email delivery |
| Cloudinary | Image storage |
| Multer | Image upload handling |
| Helmet | HTTP security headers |
| express-rate-limit | Login rate limiting |
| express-validator | Validation support |
| slugify | URL-friendly content slugs |

---

## 📁 Project Structure

```text
amri/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── logo.png
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── ContentForm.jsx
│   │   │   ├── DataTable.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── Button.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── PageHero.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminProfile.jsx
│   │   │   ├── EventsManager.jsx
│   │   │   ├── InnovationsManager.jsx
│   │   │   ├── ProgramsManager.jsx
│   │   │   └── ResearchManager.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Events.jsx
│   │   ├── Home.jsx
│   │   ├── Innovation.jsx
│   │   ├── Membership.jsx
│   │   ├── NotFound.jsx
│   │   ├── Programs.jsx
│   │   ├── Register.jsx
│   │   └── Research.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── contentService.js
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── backend/
│   └── backend/
│       ├── config/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── scripts/
│       ├── services/
│       ├── utils/
│       ├── server.js
│       ├── package.json
│       └── .env.example
│
├── index.html
├── package.json
├── vite.config.js
├── postcss.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Install the following before running AMRI locally:

- Node.js 18+
- npm
- MongoDB database (local MongoDB or MongoDB Atlas)
- Cloudinary account for admin image uploads
- SMTP email account for contact, membership, and registration emails

---

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd amri
```

---

## 2. Install Frontend Dependencies

From the project root:

```bash
npm install
```

---

## 3. Configure the Backend

Move into the backend application:

```bash
cd backend/backend
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Configure the required environment variables.

### Backend Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
PORT=5000

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_amri_email@example.com
EMAIL_PASSWORD=your_smtp_or_gmail_app_password
EMAIL_FROM=your_amri_email@example.com
```

### Important

Never commit `.env` files or credentials to Git.

For Gmail SMTP, use an **App Password** where required rather than storing your normal Gmail account password.

---

## 4. Configure the Frontend API URL

The frontend supports:

```env
VITE_API_URL=http://localhost:5000/api
```

Create a root `.env.local` file if you want to explicitly configure it:

```env
VITE_API_URL=http://localhost:5000/api
```

If `VITE_API_URL` is not provided, the application falls back to:

```text
http://localhost:5000/api
```

---

## 5. Create the First Admin

From:

```text
backend/backend/
```

run:

```bash
npm run create-admin
```

Follow the prompts to create the initial administrator.

The backend supports two roles:

- `admin`
- `superadmin`

Super administrators have additional administrator-management permissions.

---

## 6. Start the Backend

From:

```text
backend/backend/
```

run:

```bash
npm run dev
```

The API will normally be available at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "AMRI API is running"
}
```

For production:

```bash
npm start
```

---

## 7. Start the Frontend

Open a second terminal and return to the project root:

```bash
cd ../..
npm run dev
```

Vite will provide the local development URL, normally:

```text
http://localhost:5173
```

---

# 🖥️ Application Routes

## Public Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About AMRI |
| `/research` | Research |
| `/programs` | Programs |
| `/events` | Events |
| `/membership` | Membership |
| `/innovation` | Innovation |
| `/contact` | Contact |
| `/register` | Event/program registration |
| `*` | 404 page |

## Admin Routes

| Route | Purpose |
|---|---|
| `/admin/login` | Administrator login |
| `/admin/dashboard` | Dashboard |
| `/admin/research` | Research management |
| `/admin/events` | Event management |
| `/admin/programs` | Program management |
| `/admin/innovations` | Innovation management |
| `/admin/profile` | Admin profile |

Admin pages are protected through the application's authentication and protected-route system.

---

# 🔌 API Reference

All API routes are prefixed with:

```text
/api
```

## Health

```http
GET /api/health
```

Checks whether the backend is running.

---

## Authentication

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Superadmin-only administrator management:

```http
GET    /api/auth/admins
POST   /api/auth/admins
PATCH  /api/auth/admins/:id/promote
DELETE /api/auth/admins/:id
```

Authentication uses JWT bearer tokens.

---

## Research

```http
GET    /api/research
GET    /api/research/:id
GET    /api/research/admin/all

POST   /api/research
PUT    /api/research/:id
DELETE /api/research/:id

PATCH  /api/research/:id/publish
PATCH  /api/research/:id/feature
```

---

## Events

```http
GET    /api/events
GET    /api/events/:id
GET    /api/events/admin/all

POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id

PATCH  /api/events/:id/publish
PATCH  /api/events/:id/feature
```

---

## Programs

```http
GET    /api/programs
GET    /api/programs/:id
GET    /api/programs/admin/all

POST   /api/programs
PUT    /api/programs/:id
DELETE /api/programs/:id

PATCH  /api/programs/:id/publish
PATCH  /api/programs/:id/feature
```

---

## Innovations

```http
GET    /api/innovations
GET    /api/innovations/:id
GET    /api/innovations/admin/all

POST   /api/innovations
PUT    /api/innovations/:id
DELETE /api/innovations/:id

PATCH  /api/innovations/:id/publish
PATCH  /api/innovations/:id/feature
```

---

## Image Uploads

Authenticated administrators can upload images through:

```http
POST /api/upload/image
```

The image is uploaded to Cloudinary under the `amri` folder.

The API returns the secure Cloudinary URL and public ID.

---

## Contact Form

```http
POST /api/contact
```

Expected payload:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hello AMRI team."
}
```

The message is delivered to the configured AMRI email account. The visitor's email is used as `Reply-To`, allowing the AMRI team to reply directly to the sender.

---

## Membership

```http
POST /api/membership
```

Expected payload:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "membershipType": "Student"
}
```

The application is delivered to the configured AMRI email account.

---

## Event & Program Registration

```http
POST /api/registrations
```

Expected payload:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "type": "event",
  "id": "CONTENT_ID"
}
```

The backend:

1. Validates the registration request.
2. Finds the selected event or program.
3. Checks that a registration link has been configured.
4. Saves the registration request in MongoDB.
5. Sends the registration link to the applicant by email.

The same registration workflow supports both:

```text
type = event
type = program
```

---

# 🗃️ Data Models

The backend currently uses the following MongoDB models:

### Admin

Stores administrator identity, email, hashed password, and role.

### Research

Stores research titles, descriptions, authors, departments, research areas, publication information, media, links, publication status, and featured state.

### Event

Stores event details including date, time, location, organizer, speaker, registration link, images, gallery, publication status, and featured state.

### Program

Stores program details including duration, eligibility, dates, application deadline, registration link, brochure, coordinator, publication status, and featured state.

### Innovation

Stores innovation projects including technologies, innovators, problem statement, solution, impact, media, external links, publication status, and featured state.

### Registration

Stores registration requests for events and programs, including applicant information and the selected content.

---

# 🔐 Security

The application includes several security measures:

- JWT-based administrator authentication
- Password hashing with bcrypt
- Role-based authorization
- Protected admin routes
- Protected content-management endpoints
- Helmet security headers
- CORS configuration
- Login rate limiting
- Environment-based secret configuration
- Passwords excluded from normal admin responses
- Automatic frontend logout/redirect when an API request returns HTTP 401

### Production Security Checklist

Before deploying publicly:

- [ ] Replace all development secrets
- [ ] Use a strong, unique `JWT_SECRET`
- [ ] Use a production MongoDB user with appropriate permissions
- [ ] Configure production `CLIENT_URL`
- [ ] Configure production SMTP credentials
- [ ] Configure Cloudinary production credentials
- [ ] Enable HTTPS
- [ ] Confirm `.env` is ignored by Git
- [ ] Never expose SMTP, MongoDB, JWT, or Cloudinary secrets in frontend code
- [ ] Review CORS settings for the production domain
- [ ] Remove unnecessary development logging

---

# 📧 Email Architecture

AMRI uses Nodemailer with SMTP.

The system currently supports three email workflows:

```text
Website Contact Form
        ↓
POST /api/contact
        ↓
Nodemailer / SMTP
        ↓
AMRI Email Inbox
```

```text
Membership Form
        ↓
POST /api/membership
        ↓
Nodemailer / SMTP
        ↓
AMRI Email Inbox
```

```text
Event / Program Registration
        ↓
POST /api/registrations
        ↓
MongoDB Registration Record
        ↓
Nodemailer / SMTP
        ↓
Applicant Email
```

For contact and membership submissions, the configured AMRI mailbox is the recipient and the visitor/applicant address is configured as `Reply-To`.

---

# ☁️ Image Management

Administrator-uploaded images are handled through:

```text
Frontend
   ↓
Authenticated API request
   ↓
Multer
   ↓
Cloudinary
   ↓
Secure image URL
   ↓
MongoDB content record
```

Cloudinary credentials must remain server-side and should never be exposed through Vite environment variables.

---

# 🎨 Design System

AMRI uses a distinctive academic/research visual language inspired by:

- Research notebooks
- Mathematical annotations
- Chalkboard-style presentation
- Editorial typography
- Paper-like content surfaces
- Hand-drawn/chalk-inspired UI details

Primary design tokens are maintained in:

```text
src/index.css
```

Tailwind utility classes are used throughout the application for layout, typography, spacing, color, and responsive behavior.

---

# 🧩 Content Management Workflow

Administrators can manage four major content collections:

```text
Research
Events
Programs
Innovations
```

Each collection supports a common publishing workflow:

```text
Create
  ↓
Draft
  ↓
Edit
  ↓
Publish
  ↓
Feature (optional)
```

Public pages consume published content through the API, while authenticated admin pages can access the complete management collection.

---

# 🧪 Development Commands

## Frontend

From the project root:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Production build

```bash
npm run build
```

The production frontend is generated in:

```text
dist/
```

## Backend

From `backend/backend/`:

```bash
npm run dev
npm start
npm run create-admin
```

---

# 🛠️ Troubleshooting

## Backend cannot connect to MongoDB

Check:

```env
MONGODB_URI=...
```

Make sure:

- The URI is valid
- The database is reachable
- Your IP/network is allowed by MongoDB Atlas if applicable
- The database user has the required permissions

---

## Email is not being sent

Check:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASSWORD=...
EMAIL_FROM=...
```

Also verify that:

- SMTP credentials are correct
- Gmail App Password is being used where required
- The backend can reach the SMTP server
- The terminal reports a successful email connection

---

## Frontend cannot reach the API

Verify:

```env
VITE_API_URL=http://localhost:5000/api
```

Also confirm the backend is running on port `5000`.

Test:

```text
http://localhost:5000/api/health
```

---

## Admin is redirected to login

The frontend stores the JWT in:

```text
localStorage
```

under:

```text
amri_admin_token
```

A `401 Unauthorized` API response automatically clears the token and redirects the user to:

```text
/admin/login
```

If the session has expired, log in again.

---

## Images fail to upload

Check all three Cloudinary settings:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Also confirm the logged-in administrator has permission to access the upload endpoint.

---

# 🌐 Deployment

AMRI can be deployed using a split frontend/backend architecture.

A typical production setup is:

```text
                    ┌─────────────────────┐
                    │      Visitors       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React / Vite Build  │
                    │   Static Hosting    │
                    └──────────┬──────────┘
                               │
                         HTTPS API
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Express / Node.js   │
                    │      Backend        │
                    └──────┬──────┬───────┘
                           │      │
                ┌──────────┘      └──────────┐
                ▼                            ▼
        ┌──────────────┐             ┌──────────────┐
        │   MongoDB    │             │  Cloudinary  │
        └──────────────┘             └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ SMTP / Email │
                    └──────────────┘
```

When deploying:

1. Build the frontend with `npm run build`.
2. Host the generated `dist/` directory on your frontend platform.
3. Deploy `backend/backend/server.js` as the Node/Express service.
4. Set `VITE_API_URL` to the production API base URL.
5. Set `CLIENT_URL` to the production frontend URL.
6. Configure MongoDB, Cloudinary, JWT, and SMTP environment variables on the backend.
7. Enable HTTPS.
8. Verify the health endpoint and all form workflows.

---

# 📌 Current Application Scope

The current implementation includes:

- Responsive public website
- React-based navigation and routing
- Admin authentication
- Role-based admin authorization
- Research management
- Event management
- Program management
- Innovation management
- Publishing and featured-content controls
- Dashboard statistics
- Cloudinary image uploads
- Contact email workflow
- Membership email workflow
- Event/program registration workflow
- Registration persistence in MongoDB
- SMTP email delivery
- API health check
- Protected API endpoints
- Login rate limiting
- Centralized API/error handling utilities

---

# 🔮 Recommended Future Improvements

Potential next-stage enhancements include:

- Admin management for stored registration records
- Registration export to CSV/Excel
- Rich-text editing for research/program/event descriptions
- Search engine optimization metadata
- Sitemap and robots configuration
- Automated transactional email templates
- Email delivery monitoring
- Audit logs for administrator actions
- Password reset workflow
- Two-factor authentication for administrators
- Automated database backups
- Automated CI/CD pipeline
- Automated frontend/backend tests
- Production observability and error tracking

---

# 🤝 Contribution Guidelines

When contributing:

1. Create a dedicated feature branch.
2. Keep frontend and backend changes focused.
3. Avoid committing credentials or environment files.
4. Run the frontend lint/build checks before submitting changes.
5. Test API workflows when changing backend routes.
6. Verify authentication behavior when modifying protected routes.
7. Update this README when setup or architecture changes.

Example:

```bash
git checkout -b feature/your-feature
```

---

# 📄 License

This project is currently configured with the backend package's `ISC` license metadata.

Before public distribution, confirm the intended licensing terms for the complete AMRI project and its assets.

---

## AMRI

**Association for Mathematics, Research and Innovation**

A digital platform for mathematics, research, programs, events, innovation, and collaboration.
