# 🛡️ Multilingual AI Police Complaint Portal

A full-stack, production-ready web application for filing and managing police complaints in **Telugu, Hindi, and English** — powered by Claude AI.

---

## 🗂️ Project Structure

```
complaint-portal/
├── app/
│   ├── page.js                      # Landing / Language selection
│   ├── chat/page.js                 # AI Chat — complaint filing
│   ├── track/page.js                # Public complaint tracking
│   ├── admin/
│   │   ├── page.js                  # Admin login
│   │   ├── dashboard/page.js        # Stats & analytics dashboard
│   │   ├── complaints/
│   │   │   ├── page.js              # All complaints list + filters
│   │   │   └── [id]/page.js         # Complaint detail + management
│   ├── api/
│   │   ├── chat/route.js            # POST — AI chat (Claude)
│   │   ├── complaints/
│   │   │   ├── route.js             # GET (admin) / POST (public)
│   │   │   └── [id]/route.js        # GET (track) / PATCH (admin)
│   │   ├── stats/route.js           # GET — Dashboard stats
│   │   └── auth/route.js            # POST login / GET verify / DELETE logout
│   ├── layout.js
│   └── globals.css
├── lib/
│   ├── db.js                        # SQLite database (better-sqlite3)
│   ├── auth.js                      # JWT authentication
│   └── constants.js                 # Languages, prompts, configs
├── data/
│   └── complaints.db                # SQLite database (auto-created)
├── .env.example
├── .env.local                       # Your secrets (gitignored)
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd complaint-portal
chmod +x setup.sh
./setup.sh
```

### 2. Configure Environment

Edit `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...       # Required — get from console.anthropic.com
ADMIN_PASSWORD=YourSecurePassword  # Change this!
JWT_SECRET=random-long-string      # Change this!
```

### 3. Run

```bash
npm run dev
```

Open **http://localhost:3000**

---

## 🌐 Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Language selection landing | Public |
| `/chat` | AI-guided complaint filing | Public |
| `/track` | Track complaint by ID | Public |
| `/admin` | Admin login | Private |
| `/admin/dashboard` | Stats & analytics | Admin |
| `/admin/complaints` | All complaints + filters | Admin |
| `/admin/complaints/[id]` | Complaint detail + status | Admin |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/chat` | AI conversation turn | None |
| `POST` | `/api/complaints` | Submit complaint | None |
| `GET` | `/api/complaints` | List complaints (paginated) | Admin |
| `GET` | `/api/complaints/:id` | Get complaint + history | None* |
| `PATCH` | `/api/complaints/:id` | Update status/details | Admin |
| `GET` | `/api/stats` | Dashboard statistics | Admin |
| `POST` | `/api/auth` | Admin login | None |
| `GET` | `/api/auth` | Verify token | Admin |
| `DELETE` | `/api/auth` | Logout | Admin |

*Public gets redacted fields; admin gets full details.

---

## 🤖 AI Flow

1. Citizen selects language (EN / HI / TE)
2. AI officer greets and asks for name
3. Step-by-step guided data collection (7 fields)
4. AI validates and acknowledges each input
5. Once complete, AI emits structured `COMPLAINT_JSON` in message
6. Frontend parses it, shows summary panel
7. Citizen confirms → `POST /api/complaints` → stored in SQLite
8. Complaint ID generated (e.g., `CMP20240512345`)

---

## 🔒 Security

- **JWT authentication** for all admin routes (8hr expiry)
- **HttpOnly cookies** + Bearer token dual support
- **bcrypt** password hashing
- **IP logging** on complaint submission
- Admin-only fields hidden from public tracking API
- Input validation on all endpoints

---

## 🎨 Design

- **Theme**: Government-official gold-on-navy with Ashoka Chakra motifs
- **Fonts**: Cinzel (headings) + Crimson Pro (body)
- **Animations**: Subtle fade-ins, message animations, dot-pulse typing
- **Responsive**: Mobile-first, works on all screen sizes

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Database | SQLite via better-sqlite3 |
| Auth | JWT + bcryptjs |
| Styling | Tailwind CSS + custom CSS |
| Language | JavaScript (no TypeScript required) |

---

## 🛣️ Roadmap / Next Steps

- [ ] SMS/WhatsApp OTP phone verification
- [ ] Email confirmation with PDF receipt
- [ ] Multi-officer role management
- [ ] Export complaints to Excel/PDF
- [ ] Voice input (Web Speech API)
- [ ] PostgreSQL migration for production scale
- [ ] Docker + deployment guide

---

## 📝 Admin Credentials

Set `ADMIN_USERNAME` and a strong `ADMIN_PASSWORD` in `.env.local` for local development
or in your hosting provider's environment variables for deployment. Credentials are not
stored in source control.

---

## 📄 License

Built for demonstration purposes. Adapt for production use with appropriate security hardening.
