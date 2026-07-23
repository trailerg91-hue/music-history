import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Folklore from './models/Folklore.js';
import History from './models/History.js';
import Instrument from './models/Instrument.js';

const app = express();
app.use(cors());
app.use(express.json());

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
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));

const dbURI = "mongodb+srv://trailerg91_db_user:rmPJ7B3ZJwcwCoVC@folkdata.c4byu6y.mongodb.net/history_of_music?appName=folkData";

mongoose.connect(dbURI)
  .then(() => console.log('ბაზა დაკავშირებულია!'))
  .catch((err) => console.log(err));

// ==================== FOLKLORE მარშრუტები ====================
app.get('/api/folklore', async (req, res) => {
  try {
    const data = await Folklore.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/folklore', upload.single('image'), async (req, res) => {
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

app.delete('/api/folklore/:id', async (req, res) => {
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

app.post('/api/history', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
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

app.delete('/api/history/:id', async (req, res) => {
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

app.post('/api/instruments', upload.single('image'), async (req, res) => {
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

app.delete('/api/instruments/:id', async (req, res) => {
  try {
    await Instrument.findByIdAndDelete(req.params.id);
    res.json({ message: "წარმატებით წაიშალა" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`სერვერი მუშაობს პორტზე ${PORT}`));