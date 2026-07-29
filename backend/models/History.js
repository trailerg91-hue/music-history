import mongoose from 'mongoose';
import { localizedString } from './localized.js';

const HistorySectionSchema = new mongoose.Schema({
  text: localizedString(),
  audio: String,
}, { _id: false });

const CountrySchema = new mongoose.Schema({
  id: String,
  name: localizedString(),
  title: localizedString(),
  summary: localizedString(),
  side: String,
  imageUrl: String,
  image: String,
  img: String,
  sections: {
    celebration: HistorySectionSchema,
    war: HistorySectionSchema,
    mourning: HistorySectionSchema,
  },
}, { _id: false });

const HistorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  era: localizedString(true),
  yearRange: localizedString(true),
  description: localizedString(),
  countries: { type: [CountrySchema], required: true },
});

export default mongoose.model('History', HistorySchema);
