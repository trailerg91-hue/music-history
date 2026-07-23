import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  era: { type: String, required: true },
  yearRange: { type: String, required: true },
  countries: { type: Array, required: true }
});

export default mongoose.model('History', HistorySchema);