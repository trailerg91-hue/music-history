import mongoose from 'mongoose';
import { localizedString } from './localized.js';

const instrumentSchema = new mongoose.Schema({
  name: localizedString(true),
  category: { type: String, required: true },
  categoryLabel: localizedString(),
  type: localizedString(true),
  era: localizedString(),
  description: localizedString(true),
  imageUrl: { type: String, required: true },
  isFolk: { type: Boolean, required: true },
  audioUrl: String,
});

export default mongoose.model('Instrument', instrumentSchema);
