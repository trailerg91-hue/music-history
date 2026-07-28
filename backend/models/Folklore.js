import mongoose from 'mongoose';
import { localizedString } from './localized.js';

const FolkloreSchema = new mongoose.Schema({
  id: String,
  title: localizedString(),
  tag: localizedString(),
  description: localizedString(),
  imageUrl: String,
  youtubeUrl: String,
});

export default mongoose.model('Folklore', FolkloreSchema);
