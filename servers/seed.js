import dotenv from 'dotenv';
import mongoose from 'mongoose';
import instrumentsData from './InstrumentsData.js';
import Instrument from './models/Instrument.js';

dotenv.config();

const dbURI = process.env.MONGODB_URI;
if (!dbURI) {
  throw new Error('MONGODB_URI is not set');
}

mongoose.connect(dbURI)
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