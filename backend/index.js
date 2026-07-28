import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Folklore from './models/Folklore.js';
import History from './models/History.js';
import Instrument from './models/Instrument.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { validateEmail } from './utils/validation.js';
import { sendVerificationEmail, isTestMailMode } from './utils/mailer.js';
import { getTranslationStatus, hasTranslationClient, localizeWithAutoEnglish } from './utils/translator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/.env (fallback: monorepo root .env)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const NODE_ENV = (process.env.NODE_ENV || 'development').toLowerCase();
const IS_DEV_LIKE = NODE_ENV === 'development' || NODE_ENV === 'test';

const app = express();
// Vite (5173) loads images from API (5000) — allow cross-origin embedding
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : true,
    credentials: true,
  })
);
app.use(express.json());

const rawJwtSecret = String(process.env.JWT_SECRET || '').trim();
const WEAK_JWT_SECRETS = new Set(['', 'dev_change_me', 'generate-a-long-random-secret', 'change-me-to-a-long-random-secret-of-32-plus-chars']);
let JWT_SECRET = rawJwtSecret || 'dev_change_me';
if (!IS_DEV_LIKE && (WEAK_JWT_SECRETS.has(JWT_SECRET) || JWT_SECRET.length < 32)) {
  // Don't crash Render deploys over missing secrets — generate a process-local secret.
  JWT_SECRET = crypto.randomBytes(48).toString('base64url');
  console.warn('JWT_SECRET is missing/weak; generated a temporary secret for this process. Set JWT_SECRET in env for stable sessions.');
}
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'saba.kapanadze22@gmail.com')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const MAIN_ADMIN_EMAILS = new Set(ADMIN_EMAILS);

if (!IS_DEV_LIKE && isTestMailMode()) {
  console.warn('EMAIL_MODE=test is active in production. Set EMAIL_MODE=smtp (+ SMTP_*) when you want real email delivery.');
}

const authRequired = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  const token = header.slice('Bearer '.length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email?, isAdmin }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const loadCurrentUser = async (req, res, next) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ message: 'Invalid token' });
    const user = await User.findById(req.user.userId).select('fullName email isAdmin emailVerified');
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.authUser = user;
    next();
  } catch {
    return res.status(500).json({ message: 'Failed' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.authUser?.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  next();
};

const requireMainAdmin = (req, res, next) => {
  if (!MAIN_ADMIN_EMAILS.has(String(req.authUser?.email || '').toLowerCase())) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// uploads always next to this file (backend/uploads), not process cwd
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.UPLOAD_MAX_BYTES) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype;
    const field = file.fieldname;

    const imageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const audioMimes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];

    if (field === 'image') {
      if (!imageMimes.includes(mime)) return cb(new Error('Invalid image type'));
      return cb(null, true);
    }
    if (field === 'audio') {
      if (!audioMimes.includes(mime)) return cb(new Error('Invalid audio type'));
      return cb(null, true);
    }

    // instruments uses single('image') -> fieldname is still "image"
    cb(null, true);
  },
});

app.use('/uploads', express.static(UPLOADS_DIR));

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  throw new Error('MONGODB_URI is not set');
}

mongoose.connect(dbURI)
  .then(async () => {
    console.log('ბაზა დაკავშირებულია!');
    // ძველი ანგარიშები (სანამ ვერიფიკაცია დაემატებოდა) არ ჩაიკეტოს
    await User.updateMany(
      { emailVerified: { $exists: false } },
      { $set: { emailVerified: true } }
    );
  })
  .catch((err) => console.log(err));

// Basic brute-force protection (auth + admin writes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';

const readLang = (req) => String(req.headers['x-lang'] || 'ka').toLowerCase() === 'en' ? 'en' : 'ka';
const msg = (req, ka, en) => (readLang(req) === 'en' ? en : ka);
const fromBodyTranslated = async (body, key, fallback = '') =>
  localizeWithAutoEnglish(body[`${key}Ka`] ?? body[key] ?? fallback, body[`${key}En`] ?? fallback);

if (!hasTranslationClient()) {
  console.log('AI auto-translation is disabled; missing Gemini/OpenAI credentials.');
}

function makeVerificationPayload() {
  const token = crypto.randomBytes(32).toString('hex');
  const code = String(crypto.randomInt(100000, 999999));
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, code, expires };
}

async function issueVerification(user) {
  const { token, code, expires } = makeVerificationPayload();
  user.emailVerificationToken = token;
  user.emailVerificationCode = code;
  user.emailVerificationExpires = expires;
  user.emailVerified = false;
  await user.save();

  const verifyUrl = `${FRONTEND_URL}/?verifyToken=${token}`;
  const delivery = await sendVerificationEmail({ to: user.email, verifyUrl, code });
  return { token, code, delivery };
}

function mailErrorMessage(error) {
  if (error?.code === 'SMTP_NOT_CONFIGURED') {
    return 'მეილის გაგზავნა ჯერ არ არის ჩართული სერვერზე.';
  }
  if (error?.code === 'SMTP_SEND_FAILED') {
    return 'კოდის გაგზავნა ვერ მოხერხდა. სცადე თავიდან.';
  }
  return null;
}

function verificationResponse({ message, code, delivery }) {
  const payload = {
    needsVerification: true,
    message,
    emailMode: delivery?.mode || 'test',
  };
  // სატესტო რეჟიმში კოდს ვაბრუნებთ UI-ში საჩვენებლად (2FA/SMTP არ სჭირდება)
  if (delivery?.mode === 'test') {
    payload.code = code;
  }
  return payload;
}

app.get('/api/admin/translation-status', authRequired, loadCurrentUser, requireAdmin, async (req, res) => {
  try {
    res.json(getTranslationStatus());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== AUTH ====================
app.post('/api/auth/register', authLimiter, async (req, res) => {
  return res.status(403).json({
    message: msg(
      req,
      'რეგისტრაცია გამორთულია. შესვლა ხელმისაწვდომია მხოლოდ ადმინისტრატორისთვის.',
      'Registration is disabled. Sign-in is available only for administrators.'
    ),
  });
});

app.post('/api/auth/verify-email', authLimiter, async (req, res) => {
  try {
    const token = String(req.body?.token || '').trim();
    const code = String(req.body?.code || '').trim();
    const email = String(req.body?.email || '').toLowerCase().trim();

    if (!token && !(code && email)) {
      return res.status(400).json({ message: 'საჭიროა ვერიფიკაციის ტოკენი ან კოდი' });
    }

    let user = null;
    if (token) {
      user = await User.findOne({ emailVerificationToken: token });
    } else {
      user = await User.findOne({ email, emailVerificationCode: code });
    }

    if (!user) return res.status(400).json({ message: 'ვერიფიკაციის კოდი/ლინკი არასწორია' });
    if (user.emailVerified) return res.json({ message: 'ელ-ფოსტა უკვე დადასტურებულია' });

    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: 'ვერიფიკაციის ვადა ამოიწურა. მოითხოვე ახალი კოდი.' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ message: 'ელ-ფოსტა წარმატებით დადასტურდა. ახლა შეგიძლია შეხვიდე.' });
  } catch {
    res.status(500).json({ message: 'ვერიფიკაცია ვერ მოხერხდა' });
  }
});

app.post('/api/auth/resend-verification', authLimiter, async (req, res) => {
  try {
    const emailCheck = validateEmail(req.body?.email);
    if (!emailCheck.ok) return res.status(400).json({ message: emailCheck.message });

    const user = await User.findOne({ email: emailCheck.email });
    const genericMessage = msg(
      req,
      'თუ ანგარიში არსებობს და დადასტურებული არ არის, ვერიფიკაციის ინსტრუქცია გაიგზავნება.',
      'If the account exists and is not verified, verification instructions will be sent.'
    );
    if (!user || user.emailVerified) return res.json({ message: genericMessage });

    const { code, delivery } = await issueVerification(user);
    return res.json(
      verificationResponse({
        message: genericMessage,
        code,
        delivery,
      })
    );
  } catch (e) {
    const msg = mailErrorMessage(e);
    if (msg) return res.status(503).json({ message: msg });
    res.status(500).json({ message: 'გაგზავნა ვერ მოხერხდა' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const emailCheck = validateEmail(req.body?.email);
    if (!emailCheck.ok) return res.status(400).json({ message: emailCheck.message });
    if (!req.body?.password) return res.status(400).json({ message: 'პაროლი სავალდებულოა' });

    const user = await User.findOne({ email: emailCheck.email });
    if (!user) return res.status(401).json({ message: 'არასწორი ელ-ფოსტა ან პაროლი' });

    const ok = await bcrypt.compare(String(req.body.password), user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'არასწორი ელ-ფოსტა ან პაროლი' });

    if (!user.isAdmin) {
      return res.status(403).json({
        message: msg(
          req,
          'შესვლა ხელმისაწვდომია მხოლოდ ადმინისტრატორისთვის.',
          'Sign-in is available only for administrators.'
        ),
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        needsVerification: true,
        message: 'ჯერ დაადასტურე ელ-ფოსტა. შეამოწმე ინბოქსი ან მოითხოვე ახალი კოდი.',
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
      },
    });
  } catch {
    res.status(500).json({ message: 'შესვლა ვერ მოხერხდა' });
  }
});

app.get('/api/auth/me', authRequired, loadCurrentUser, async (req, res) => {
  try {
    const user = req.authUser;
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.emailVerified) return res.status(403).json({ message: 'Email not verified' });

    // ახალი token, რომ მომდევნო refresh-ზე id უკვე სწორი იყოს
    const freshToken = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: freshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
      },
    });
  } catch {
    res.status(500).json({ message: 'Failed' });
  }
});

// ==================== ADMIN USER ENDPOINTS ====================
app.get('/api/admin/users', authRequired, loadCurrentUser, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('fullName email isAdmin');
    res.json(
      users.map((u) => ({
        id: u._id,
        fullName: u.fullName,
        email: u.email,
        isAdmin: u.isAdmin,
      }))
    );
  } catch {
    res.status(500).json({ message: 'Failed' });
  }
});

app.put('/api/admin/users/:id', authRequired, loadCurrentUser, requireAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { isAdmin } = req.body || {};
    if (typeof isAdmin !== 'boolean') return res.status(400).json({ message: 'Invalid isAdmin' });

    const target = await User.findById(req.params.id).select('email isAdmin');
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (String(target.email).toLowerCase() === String(req.authUser.email).toLowerCase() && !isAdmin) {
      return res.status(400).json({ message: 'Cannot remove your own admin access' });
    }

    await User.findByIdAndUpdate(req.params.id, { isAdmin });
    res.json({ message: 'Updated' });
  } catch {
    res.status(500).json({ message: 'Failed' });
  }
});

app.delete('/api/admin/users/:id', authRequired, loadCurrentUser, requireAdmin, requireMainAdmin, async (req, res) => {
  try {
    const target = await User.findById(req.params.id).select('email');
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (String(target.email).toLowerCase() === String(req.authUser.email).toLowerCase()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Failed' });
  }
});

// ==================== FOLKLORE მარშრუტები ====================
app.get('/api/folklore', async (req, res) => {
  try {
    const data = await Folklore.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/folklore', authRequired, loadCurrentUser, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const itemData = {
      id: req.body.id,
      title: await fromBodyTranslated(req.body, 'title'),
      tag: await fromBodyTranslated(req.body, 'tag'),
      description: await fromBodyTranslated(req.body, 'description'),
      youtubeUrl: req.body.youtubeUrl || '',
      imageUrl: req.body.imageUrl || '',
    };
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      itemData.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }
    const newItem = new Folklore(itemData);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/folklore/:id', authRequired, loadCurrentUser, requireAdmin, requireMainAdmin, async (req, res) => {
  try {
    await Folklore.findByIdAndDelete(req.params.id);
    res.json({ message: "წარმატებით წაიშალა" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== HISTORY (ეპოქები) მარშრუტები ====================
app.get('/api/history', async (req, res) => {
  try {
    const data = await History.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post(
  '/api/history',
  authRequired,
  loadCurrentUser,
  requireAdmin,
  upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]),
  async (req, res) => {
  try {
    const era = await fromBodyTranslated(req.body, 'era');
    const yearRange = await fromBodyTranslated(req.body, 'yearRange');
    const description = await fromBodyTranslated(req.body, 'description');
    const countryName = await fromBodyTranslated(req.body, 'countryName');
    const countryDescription = await fromBodyTranslated(req.body, 'countryDescription');
    const celebrationText = await fromBodyTranslated(req.body, 'celebrationText');
    const warText = await fromBodyTranslated(req.body, 'warText');
    const mourningText = await fromBodyTranslated(req.body, 'mourningText');

    const itemData = {
      id: req.body.id,
      era,
      yearRange,
      description,
    };
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    if (req.files) {
      if (req.files['audio']) {
        itemData.audioUrl = `${baseUrl}/uploads/${req.files['audio'][0].filename}`;
      }
      if (req.files['image']) {
        itemData.imageUrl = `${baseUrl}/uploads/${req.files['image'][0].filename}`;
      }
    }

    itemData.countries = [{
      id: req.body.countryId || '',
      name: countryName,
      title: countryName,
      summary: countryDescription,
      imageUrl: itemData.imageUrl || req.body.imageUrl || '',
      sections: {
        celebration: { text: celebrationText },
        war: { text: warText },
        mourning: { text: mourningText, audio: itemData.audioUrl || req.body.audioUrl || '' },
      },
    }];

    const newItem = new History(itemData);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/history/:id', authRequired, loadCurrentUser, requireAdmin, requireMainAdmin, async (req, res) => {
  try {
    await History.findByIdAndDelete(req.params.id);
    res.json({ message: "წარმატებით წაიშალა" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== INSTRUMENT (საკრავები) მარშრუტები ====================
app.get('/api/instruments', async (req, res) => {
  try {
    const data = await Instrument.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/instruments', authRequired, loadCurrentUser, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const name = await fromBodyTranslated(req.body, 'name');
    const categoryLabel = await fromBodyTranslated(req.body, 'categoryLabel', req.body.category);
    const type = await fromBodyTranslated(req.body, 'type');
    const description = await fromBodyTranslated(req.body, 'description');

    const itemData = {
      name,
      category: req.body.category,
      categoryLabel,
      type,
      description,
      isFolk: req.body.isFolk === 'true' || req.body.isFolk === true,
      imageUrl: req.body.imageUrl || '',
      audioUrl: req.body.audioUrl || '',
    };
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      itemData.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }
    const newItem = new Instrument(itemData);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/instruments/:id', authRequired, loadCurrentUser, requireAdmin, requireMainAdmin, async (req, res) => {
  try {
    await Instrument.findByIdAndDelete(req.params.id);
    res.json({ message: "წარმატებით წაიშალა" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`სერვერი მუშაობს პორტზე ${PORT}`));