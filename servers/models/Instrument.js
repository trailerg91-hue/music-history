import mongoose from 'mongoose';

const instrumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  era: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isFolk: { type: Boolean, required: true }
});

const Instrument = mongoose.model('Instrument', instrumentSchema);

export default Instrument;