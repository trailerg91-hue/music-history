import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const loc = (v) => {
  if (v && typeof v === 'object' && ('ka' in v || 'en' in v)) {
    return {
      ka: String(v.ka || ''),
      en: String(v.en || v.ka || ''),
    };
  }
  const text = String(v || '');
  return { ka: text, en: text };
};

const isLocalized = (v) => v && typeof v === 'object' && !Array.isArray(v) && ('ka' in v || 'en' in v);
const clone = (v) => (v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v);

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const folklore = await mongoose.connection.collection('folklores').find({}).toArray();
  for (const item of folklore) {
    const next = {};
    if (!isLocalized(item.title)) next.title = loc(item.title);
    if (!isLocalized(item.tag)) next.tag = loc(item.tag);
    if (!isLocalized(item.description)) next.description = loc(item.description);
    if (Object.keys(next).length) {
      await mongoose.connection.collection('folklores').updateOne({ _id: item._id }, { $set: next });
    }
  }

  const instruments = await mongoose.connection.collection('instruments').find({}).toArray();
  for (const item of instruments) {
    const next = {};
    if (!isLocalized(item.name)) next.name = loc(item.name);
    if (!isLocalized(item.type)) next.type = loc(item.type);
    if (!isLocalized(item.era)) next.era = loc(item.era);
    if (!isLocalized(item.description)) next.description = loc(item.description);
    if (!isLocalized(item.categoryLabel)) next.categoryLabel = loc(item.categoryLabel || item.category);
    if (Object.keys(next).length) {
      await mongoose.connection.collection('instruments').updateOne({ _id: item._id }, { $set: next });
    }
  }

  const history = await mongoose.connection.collection('histories').find({}).toArray();
  for (const item of history) {
    const next = {};
    if (!isLocalized(item.era)) next.era = loc(item.era);
    if (!isLocalized(item.yearRange)) next.yearRange = loc(item.yearRange);
    if (!isLocalized(item.description)) next.description = loc(item.description);

    const countries = clone(item.countries || []);
    let countriesChanged = false;
    for (const country of countries) {
      if (!isLocalized(country.name)) {
        country.name = loc(country.name || country.title);
        countriesChanged = true;
      }
      if (!isLocalized(country.title)) {
        country.title = loc(country.title || country.name);
        countriesChanged = true;
      }
      if (!isLocalized(country.summary)) {
        country.summary = loc(country.summary || country.description || '');
        countriesChanged = true;
      }
      for (const key of Object.keys(country.sections || {})) {
        if (!isLocalized(country.sections[key]?.text)) {
          country.sections[key].text = loc(country.sections[key]?.text || '');
          countriesChanged = true;
        }
      }
    }
    if (countriesChanged) next.countries = countries;

    if (Object.keys(next).length) {
      await mongoose.connection.collection('histories').updateOne({ _id: item._id }, { $set: next });
    }
  }

  await mongoose.disconnect();
  console.log('i18n migration completed');
};

migrate().catch((e) => { console.error(e); process.exit(1); });
