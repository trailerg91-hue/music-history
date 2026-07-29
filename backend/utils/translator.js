import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { transliterate as toLatin } from 'transliteration';

const TRANSLATION_PROVIDER = String(process.env.AI_TRANSLATION_PROVIDER || 'auto').trim().toLowerCase();
const OPENAI_API_KEY = String(process.env.OPENAI_API_KEY || '').trim();
const OPENAI_TRANSLATION_MODEL = String(process.env.OPENAI_TRANSLATION_MODEL || 'gpt-4.1-mini').trim();
const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || '').trim();
const GEMINI_TRANSLATION_MODEL = String(process.env.GEMINI_TRANSLATION_MODEL || 'gemini-2.0-flash').trim();

const openaiClient = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const geminiClient = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const TERM_OVERRIDES = new Map([
  ['კაჰონი', 'Cajon'],
  ['სიმებიანი', 'String'],
  ['სასულე', 'Wind'],
  ['დასარტყამი', 'Percussion'],
  ['კლავიშებიანი', 'Keyboard'],
  ['ქართული', 'Georgian'],
  ['ფოლკლორი', 'Folklore'],
  ['მუსიკა', 'Music'],
]);

function cleanText(value) {
  return String(value ?? '').trim();
}

function activeProvider() {
  if (TRANSLATION_PROVIDER === 'offline') return 'offline';
  if (TRANSLATION_PROVIDER === 'gemini') return geminiClient ? 'gemini' : null;
  if (TRANSLATION_PROVIDER === 'openai') return openaiClient ? 'openai' : null;
  if (geminiClient) return 'gemini';
  if (openaiClient) return 'openai';
  return 'offline';
}

export function hasTranslationClient() {
  const provider = activeProvider();
  return provider === 'gemini' || provider === 'openai';
}

export function getTranslationStatus() {
  const provider = activeProvider();
  return {
    enabled: Boolean(provider),
    provider,
    model:
      provider === 'gemini'
        ? GEMINI_TRANSLATION_MODEL
        : provider === 'openai'
          ? OPENAI_TRANSLATION_MODEL
          : provider === 'offline'
            ? 'transliteration+dictionary'
          : null,
  };
}

function titleCaseWords(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function translateOffline(text) {
  const source = cleanText(text);
  if (!source) return '';
  if (TERM_OVERRIDES.has(source)) return TERM_OVERRIDES.get(source);

  const wordCount = source.split(/\s+/).filter(Boolean).length;
  const looksLongForm =
    source.length > 80 ||
    wordCount > 8 ||
    /[.!?]\s/.test(source) ||
    source.includes('\n');

  if (looksLongForm) return source;

  const transliterated = cleanText(toLatin(source));
  return transliterated ? titleCaseWords(transliterated) : source;
}

export async function translateGeorgianToEnglish(text) {
  const source = cleanText(text);
  if (!source) return '';
  const provider = activeProvider();
  if (!provider) return source;
  if (provider === 'offline') return translateOffline(source);

  try {
    let translated = '';

    if (provider === 'gemini') {
      const response = await geminiClient.models.generateContent({
        model: GEMINI_TRANSLATION_MODEL,
        contents: `Translate Georgian text into natural English. Return only the translated text. Preserve meaning, proper nouns, punctuation, and line breaks. Do not add explanations or quotation marks.\n\n${source}`,
      });
      translated = cleanText(response.text);
    } else {
      const response = await openaiClient.responses.create({
        model: OPENAI_TRANSLATION_MODEL,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: 'Translate Georgian text into natural English. Return only the translated text. Preserve meaning, proper nouns, punctuation, and line breaks. Do not add explanations or quotation marks.',
              },
            ],
          },
          {
            role: 'user',
            content: [{ type: 'input_text', text: source }],
          },
        ],
      });
      translated = cleanText(response.output_text);
    }

    return translated || source;
  } catch (error) {
    console.error('Auto-translation failed:', error?.message || error);
    return translateOffline(source);
  }
}

export async function localizeWithAutoEnglish(kaValue, enValue) {
  const ka = cleanText(kaValue);
  const en = cleanText(enValue);

  if (!ka && !en) {
    return { ka: '', en: '' };
  }

  if (en) {
    return { ka, en };
  }

  const translated = await translateGeorgianToEnglish(ka);
  return { ka, en: cleanText(translated) || ka };
}
