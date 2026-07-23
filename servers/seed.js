import mongoose from 'mongoose';
import instrumentsData from './InstrumentsData.js';
import Instrument from './models/Instrument.js';

// ზუსტად იგივე Atlas-ის ლინკი ბაზის სახელით
const dbURI = "mongodb+srv://trailerg91_db_user:rmPJ7B3ZJwcwCoVC@folkdata.c4byu6y.mongodb.net/history_of_music?appName=folkData";
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