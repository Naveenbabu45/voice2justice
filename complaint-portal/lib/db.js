import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/complaints.db';
let db = null;

export function getDB() {
  if (db) return db;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

function initSchema(database) {
  database.exec(`
    /* ── Complaints ──────────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY, complaint_no TEXT UNIQUE NOT NULL,
      language TEXT NOT NULL DEFAULT 'en', name TEXT NOT NULL,
      phone TEXT NOT NULL, address TEXT NOT NULL,
      complaint_type TEXT NOT NULL, incident_date TEXT NOT NULL,
      incident_location TEXT NOT NULL, incident_description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', priority TEXT NOT NULL DEFAULT 'normal',
      assigned_to TEXT, officer_notes TEXT, ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Status History ──────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT, complaint_id TEXT NOT NULL,
      old_status TEXT, new_status TEXT NOT NULL,
      changed_by TEXT DEFAULT 'system', note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (complaint_id) REFERENCES complaints(id)
    );

    /* ── Admin Users ─────────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL, full_name TEXT,
      role TEXT NOT NULL DEFAULT 'officer', last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Public Users (victims / citizens) ───────────────── */
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT NOT NULL,
      preferred_language TEXT NOT NULL DEFAULT 'en',
      is_verified INTEGER NOT NULL DEFAULT 0,
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Chat Sessions ───────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      complaint_id TEXT,
      language TEXT NOT NULL DEFAULT 'en',
      status TEXT NOT NULL DEFAULT 'active',
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      FOREIGN KEY (user_id)     REFERENCES users(id),
      FOREIGN KEY (complaint_id) REFERENCES complaints(id)
    );

    /* ── Chat Messages ───────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      audio_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    );

    /* ── Indexes ─────────────────────────────────────────── */
    CREATE INDEX IF NOT EXISTS idx_complaints_phone  ON complaints(phone);
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_complaints_date   ON complaints(created_at);
    CREATE INDEX IF NOT EXISTS idx_complaints_no     ON complaints(complaint_no);
    CREATE INDEX IF NOT EXISTS idx_users_phone       ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_chat_session_user ON chat_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_msgs_session ON chat_messages(session_id);
  `);

  /* Seed configured admin */
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is required');
  }

  const adminExists = database.prepare('SELECT id FROM admins WHERE username = ?').get(adminUsername);
  if (!adminExists) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    database.prepare('INSERT INTO admins (username, password_hash, full_name, role) VALUES (?,?,?,?)')
      .run(adminUsername, hash, 'System Administrator', 'superadmin');
  }
}

/* ── Complaint CRUD ─────────────────────────────────────────────── */
export function createComplaint(data) {
  const database = getDB();
  const id = uuidv4();
  const complaint_no = generateComplaintNumber();
  database.prepare(`
    INSERT INTO complaints (id,complaint_no,language,name,phone,address,complaint_type,incident_date,incident_location,incident_description,ip_address)
    VALUES (@id,@complaint_no,@language,@name,@phone,@address,@complaint_type,@incident_date,@incident_location,@incident_description,@ip_address)
  `).run({ id, complaint_no, ...data });
  database.prepare(`INSERT INTO status_history (complaint_id,new_status,changed_by,note) VALUES (?,?,?,?)`)
    .run(id, 'pending', 'system', 'Complaint registered');
  return { id, complaint_no };
}

export function getComplaintById(id) {
  return getDB().prepare('SELECT * FROM complaints WHERE id=? OR complaint_no=?').get(id, id);
}
export function getComplaintHistory(cid) {
  return getDB().prepare('SELECT * FROM status_history WHERE complaint_id=? ORDER BY created_at ASC').all(cid);
}
export function getAllComplaints({ page=1, limit=15, status, search, language }={}) {
  const database = getDB();
  const offset = (page-1)*limit;
  let where='1=1'; const params=[];
  if (status && status!=='all') { where+=' AND status=?'; params.push(status); }
  if (language && language!=='all') { where+=' AND language=?'; params.push(language); }
  if (search) {
    where+=' AND (name LIKE ? OR phone LIKE ? OR complaint_no LIKE ? OR incident_description LIKE ?)';
    const s=`%${search}%`; params.push(s,s,s,s);
  }
  const total=database.prepare(`SELECT COUNT(*) as count FROM complaints WHERE ${where}`).get(...params).count;
  const rows=database.prepare(`SELECT * FROM complaints WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params,limit,offset);
  return { complaints:rows, total, page, limit, pages:Math.ceil(total/limit) };
}
export function updateComplaintStatus(id, status, note, changed_by='admin') {
  const database = getDB();
  const current = database.prepare('SELECT status FROM complaints WHERE id=?').get(id);
  if (!current) return null;
  database.prepare(`UPDATE complaints SET status=?, updated_at=datetime('now') WHERE id=?`).run(status, id);
  database.prepare(`INSERT INTO status_history (complaint_id,old_status,new_status,changed_by,note) VALUES (?,?,?,?,?)`).run(id, current.status, status, changed_by, note||null);
  return getComplaintById(id);
}
export function updateComplaintDetails(id, updates) {
  const database = getDB();
  const allowed=['priority','assigned_to','officer_notes'];
  const sets=[]; const vals=[];
  for (const [k,v] of Object.entries(updates)) {
    if (allowed.includes(k) && v!==undefined) { sets.push(`${k}=?`); vals.push(v); }
  }
  if (!sets.length) return getComplaintById(id);
  sets.push(`updated_at=datetime('now')`);
  database.prepare(`UPDATE complaints SET ${sets.join(',')} WHERE id=?`).run(...vals, id);
  return getComplaintById(id);
}
export function getDashboardStats() {
  const database = getDB();
  const total    = database.prepare('SELECT COUNT(*) as n FROM complaints').get().n;
  const pending  = database.prepare("SELECT COUNT(*) as n FROM complaints WHERE status='pending'").get().n;
  const active   = database.prepare("SELECT COUNT(*) as n FROM complaints WHERE status IN ('under_investigation','fir_registered')").get().n;
  const resolved = database.prepare("SELECT COUNT(*) as n FROM complaints WHERE status IN ('resolved','closed')").get().n;
  const today    = database.prepare("SELECT COUNT(*) as n FROM complaints WHERE date(created_at)=date('now')").get().n;
  const thisWeek = database.prepare("SELECT COUNT(*) as n FROM complaints WHERE created_at>=datetime('now','-7 days')").get().n;
  const byType     = database.prepare('SELECT complaint_type, COUNT(*) as count FROM complaints GROUP BY complaint_type ORDER BY count DESC').all();
  const byStatus   = database.prepare('SELECT status, COUNT(*) as count FROM complaints GROUP BY status').all();
  const byLanguage = database.prepare('SELECT language, COUNT(*) as count FROM complaints GROUP BY language').all();
  const recent     = database.prepare('SELECT * FROM complaints ORDER BY created_at DESC LIMIT 10').all();
  const daily      = database.prepare(`SELECT date(created_at) as day,COUNT(*) as count FROM complaints WHERE created_at>=datetime('now','-30 days') GROUP BY day ORDER BY day ASC`).all();
  return { total, pending, active, resolved, today, thisWeek, byType, byStatus, byLanguage, recent, daily };
}

/* ── Admin Auth ─────────────────────────────────────────────────── */
export function findAdmin(username) { return getDB().prepare('SELECT * FROM admins WHERE username=?').get(username); }
export function updateAdminLogin(id) { getDB().prepare(`UPDATE admins SET last_login=datetime('now') WHERE id=?`).run(id); }

/* ── Public User Auth ───────────────────────────────────────────── */
export function createUser({ full_name, phone, email, password, preferred_language='en' }) {
  const database = getDB();
  const id = uuidv4();
  const password_hash = bcrypt.hashSync(password, 10);
  try {
    database.prepare(`
      INSERT INTO users (id,full_name,phone,email,password_hash,preferred_language)
      VALUES (?,?,?,?,?,?)
    `).run(id, full_name.trim(), phone.replace(/\D/g,''), email||null, password_hash, preferred_language);
    return { id, full_name, phone };
  } catch (e) {
    if (e.message.includes('UNIQUE')) throw new Error('Phone number already registered');
    throw e;
  }
}
export function findUserByPhone(phone) {
  return getDB().prepare('SELECT * FROM users WHERE phone=?').get(phone.replace(/\D/g,''));
}
export function findUserById(id) {
  return getDB().prepare('SELECT * FROM users WHERE id=?').get(id);
}
export function updateUserLogin(id) {
  getDB().prepare(`UPDATE users SET last_login=datetime('now') WHERE id=?`).run(id);
}

/* ── Chat Session CRUD ──────────────────────────────────────────── */
export function createChatSession({ user_id, language }) {
  const database = getDB();
  const id = uuidv4();
  database.prepare(`INSERT INTO chat_sessions (id,user_id,language) VALUES (?,?,?)`)
    .run(id, user_id||null, language||'en');
  return id;
}
export function linkSessionToComplaint(session_id, complaint_id) {
  getDB().prepare(`UPDATE chat_sessions SET complaint_id=? WHERE id=?`).run(complaint_id, session_id);
}
export function closeChatSession(session_id) {
  getDB().prepare(`UPDATE chat_sessions SET status='completed',ended_at=datetime('now') WHERE id=?`).run(session_id);
}
export function saveChatMessage({ session_id, role, content, audio_url=null }) {
  return getDB().prepare(`INSERT INTO chat_messages (session_id,role,content,audio_url) VALUES (?,?,?,?)`)
    .run(session_id, role, content, audio_url).lastInsertRowid;
}
export function getChatHistory(session_id) {
  return getDB().prepare('SELECT * FROM chat_messages WHERE session_id=? ORDER BY created_at ASC').all(session_id);
}
export function getUserSessions(user_id) {
  return getDB().prepare(`
    SELECT cs.*, c.complaint_no, c.status as complaint_status
    FROM chat_sessions cs
    LEFT JOIN complaints c ON c.id = cs.complaint_id
    WHERE cs.user_id=?
    ORDER BY cs.started_at DESC
  `).all(user_id);
}

/* ── Helpers ────────────────────────────────────────────────────── */
function generateComplaintNumber() {
  const now=new Date();
  const yr=now.getFullYear(), mo=String(now.getMonth()+1).padStart(2,'0');
  const rand=Math.floor(Math.random()*90000)+10000;
  return `CMP${yr}${mo}${rand}`;
}
