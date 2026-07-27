import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Folklore from './models/Folklore.js';
import History from './models/History.js';
import Instrument from './models/Instrument.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { validateEmail, validatePassword, validateFullName } from './utils/validation.js';
import { sendVerificationEmail, isTestMailMode } from './utils/mailer.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : true,
    credentials: true,
  })
);
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev_change_me';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'saba.kapanadze22@gmail.com')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

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

const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  next();
};

// uploads ფოლდერის შექმნა
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer-ის კონფიგურაცია ფაილების შესანახად
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  }
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

app.use('/uploads', express.static('uploads'));

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

// ==================== AUTH ====================
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const nameCheck = validateFullName(req.body?.fullName);
    if (!nameCheck.ok) return res.status(400).json({ message: nameCheck.message });

    const emailCheck = validateEmail(req.body?.email);
    if (!emailCheck.ok) return res.status(400).json({ message: emailCheck.message });

    const passwordCheck = validatePassword(req.body?.password);
    if (!passwordCheck.ok) return res.status(400).json({ message: passwordCheck.message });

    const exists = await User.findOne({ email: emailCheck.email });
    if (exists) {
      // სატესტო რეჟიმი: თუ ანგარიში უკვე ვერიფიცირებულია, პაროლის განახლება შეგვიძლია
      if (exists.emailVerified && isTestMailMode()) {
        exists.passwordHash = await bcrypt.hash(String(req.body.password), 10);
        await exists.save();
        return res.status(200).json({
          passwordUpdated: true,
          message: 'სატესტო რეჟიმი: პაროლი განახლდა. ახლა შეგიძლია შეხვიდე იმავე მეილით და ახალი პაროლით.',
        });
      }

      if (!exists.emailVerified) {
        try {
          // ხელახალ რეგისტრაციაზე პაროლიც განახლდება (ძველი არასწორი hash აღარ დარჩეს)
          exists.passwordHash = await bcrypt.hash(String(req.body.password), 10);
          exists.fullName = nameCheck.fullName;
          await exists.save();

          const { code, delivery } = await issueVerification(exists);
          return res.status(200).json(
            verificationResponse({
              message:
                delivery?.mode === 'test'
                  ? 'ანგარიში დაუდასტურებელია. პაროლი განახლდა — ქვემოთ ჩანს ახალი კოდი.'
                  : 'ანგარიში დაუდასტურებელია. პაროლი განახლდა და ახალი კოდი გაიგზავნა.',
              code,
              delivery,
            })
          );
        } catch (mailErr) {
          const msg = mailErrorMessage(mailErr);
          if (msg) return res.status(503).json({ message: msg });
          throw mailErr;
        }
      }
      return res.status(409).json({ message: 'ეს ელ-ფოსტა უკვე რეგისტრირებულია' });
    }

    const isAdmin = ADMIN_EMAILS.includes(emailCheck.email);
    const passwordHash = await bcrypt.hash(String(req.body.password), 10);

    const user = await User.create({
      fullName: nameCheck.fullName,
      email: emailCheck.email,
      passwordHash,
      isAdmin,
      emailVerified: false,
    });

    try {
      const { code, delivery } = await issueVerification(user);
      return res.status(201).json(
        verificationResponse({
          message:
            delivery?.mode === 'test'
              ? 'რეგისტრაცია წარმატებულია. სატესტო რეჟიმი: კოდი გამოჩნდება ქვემოთ (მეილი/2FA არ სჭირდება).'
              : 'რეგისტრაცია წარმატებულია. კოდი გაიგზავნა შენს ელ-ფოსტაზე.',
          code,
          delivery,
        })
      );
    } catch (mailErr) {
      await User.findByIdAndDelete(user._id);
      const msg = mailErrorMessage(mailErr);
      if (msg) return res.status(503).json({ message: msg });
      throw mailErr;
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'რეგისტრაცია ვერ მოხერხდა' });
  }
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
    if (!user) return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
    if (user.emailVerified) return res.json({ message: 'ელ-ფოსტა უკვე დადასტურებულია' });

    const { code, delivery } = await issueVerification(user);
    return res.json(
      verificationResponse({
        message:
          delivery?.mode === 'test'
            ? 'ახალი სატესტო კოდი მზადაა — იხილე ქვემოთ.'
            : 'ახალი ვერიფიკაციის კოდი გაიგზავნა შენს ელ-ფოსტაზე',
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

app.get('/api/auth/me', authRequired, async (req, res) => {
  try {
    let user = null;
    if (req.user?.userId) {
      user = await User.findById(req.user.userId).select('fullName email isAdmin emailVerified');
    }
    // DB migration-ის შემდეგ ძველი token id შეიძლება აღარ ემთხვეოდეს — email-ით ვეძებთ
    const emailHint = req.user?.email || req.headers['x-user-email'];
    if (!user && emailHint) {
      user = await User.findOne({ email: String(emailHint).toLowerCase() }).select(
        'fullName email isAdmin emailVerified'
      );
    }
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
app.get('/api/admin/users', authRequired, requireAdmin, async (req, res) => {
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

app.put('/api/admin/users/:id', authRequired, requireAdmin, async (req, res) => {
  try {
    const { isAdmin } = req.body || {};
    if (typeof isAdmin !== 'boolean') return res.status(400).json({ message: 'Invalid isAdmin' });

    await User.findByIdAndUpdate(req.params.id, { isAdmin });
    res.json({ message: 'Updated' });
  } catch {
    res.status(500).json({ message: 'Failed' });
  }
});

app.delete('/api/admin/users/:id', authRequired, requireAdmin, async (req, res) => {
  try {
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

app.post('/api/folklore', authRequired, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const itemData = { ...req.body };
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

app.delete('/api/folklore/:id', authRequired, requireAdmin, async (req, res) => {
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
  requireAdmin,
  upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]),
  async (req, res) => {
  try {
    const itemData = { ...req.body };
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    if (req.files) {
      if (req.files['audio']) {
        itemData.audioUrl = `${baseUrl}/uploads/${req.files['audio'][0].filename}`;
      }
      if (req.files['image']) {
        itemData.imageUrl = `${baseUrl}/uploads/${req.files['image'][0].filename}`;
      }
    }

    if (req.body.countryName) {
      itemData.countries = [{
        name: req.body.countryName,
        description: req.body.countryDescription || ''
      }];
    }

    const newItem = new History(itemData);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/history/:id', authRequired, requireAdmin, async (req, res) => {
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

app.post('/api/instruments', authRequired, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const itemData = { ...req.body };
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

app.delete('/api/instruments/:id', authRequired, requireAdmin, async (req, res) => {
  try {
    await Instrument.findByIdAndDelete(req.params.id);
    res.json({ message: "წარმატებით წაიშალა" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`სერვერი მუშაობს პორტზე ${PORT}`));