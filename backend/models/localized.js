import mongoose from 'mongoose';

export const LocalizedStringSchema = new mongoose.Schema(
  {
    ka: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  { _id: false }
);

export const localizedString = (required = false) => ({
  type: LocalizedStringSchema,
  required,
  default: () => ({ ka: '', en: '' }),
});
