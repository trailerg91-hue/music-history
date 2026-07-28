import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import instrumentsData from './InstrumentsData.js';
import Instrument from './models/Instrument.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbURI = process.env.MONGODB_URI;
if (!dbURI) {
  throw new Error('MONGODB_URI is not set (backend/.env)');
}

mongoose
  .connect(dbURI)
  .then(async () => {
    console.log('MongoDB Atlas-თან კავშირი წარმატებულია!');

    try {
      await Instrument.deleteMany({});
      await Instrument.insertMany(instrumentsData);
      console.log('ინსტრუმენტები წარმატებით აიტვირთა ღრუბელში!');
    } catch (error) {
      console.error('შეცდომა მონაცემთა ბაზაში ჩაწერისას:', error);
    } finally {
      mongoose.connection.close();
    }
  });
