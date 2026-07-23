import mongoose from 'mongoose';

const FolkloreSchema = new mongoose.Schema({
  id: String,
  title: String,
  tag: String,
  description: String,
  imageUrl: String,
  youtubeUrl: String
});

// აქ ვიყენებთ export default-ს, რათა იმპორტი სწორად იმუშაოს
export default mongoose.model('Folklore', FolkloreSchema);