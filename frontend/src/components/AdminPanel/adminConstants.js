import { API_BASE } from '../../api.js';

export const EPOCHS_API = `${API_BASE}/history`;
export const INSTRUMENTS_API = `${API_BASE}/instruments`;
export const FOLK_API = `${API_BASE}/folklore`;
export const TRANSLATION_STATUS_API = `${API_BASE}/admin/translation-status`;

export const emptyEpoch = {
  eraKa: '',
  yearRangeKa: '',
  descriptionKa: '',
  countryNameKa: '',
  countryDescriptionKa: '',
  celebrationTextKa: '',
  warTextKa: '',
  mourningTextKa: '',
  imageMode: 'file',
  imageFile: null,
  imageUrl: '',
  audioMode: 'file',
  audioFile: null,
  audioUrl: '',
};

export const emptyInstrument = {
  nameKa: '',
  category: 'string',
  typeKa: 'სიმებიანი',
  categoryLabelKa: 'სიმებიანი',
  descriptionKa: '',
  imageMode: 'file',
  imageFile: null,
  imageUrl: '',
  isFolk: false,
};

export const emptyFolk = {
  id: '',
  titleKa: '',
  tagKa: '',
  descriptionKa: '',
  imageMode: 'file',
  imageFile: null,
  imageUrl: '',
  youtubeUrl: '',
};

export const CATEGORY_MAP = {
  string: 'სიმებიანი',
  wind: 'სასულე',
  percussion: 'დასარტყამი',
  keyboard: 'კლავიშებიანი',
};

export const TABLE_GAP = { marginTop: 22 };

export function appendMedia(formData, form, fileKey, urlKey, fieldName) {
  if (form[`${fileKey}Mode`] === 'file' && form[`${fileKey}File`]) formData.append(fieldName, form[`${fileKey}File`]);
  else if (form[`${fileKey}Mode`] === 'link' && form[urlKey]) formData.append(urlKey, form[urlKey]);
}

export function appendLocalizedFields(formData, form, key) {
  formData.append(`${key}Ka`, form[`${key}Ka`] || '');
  formData.append(`${key}En`, form[`${key}En`] || '');
}

export function authHeaders() {
  const token = localStorage.getItem('token');
  return token
    ? { Authorization: `Bearer ${token}`, 'X-Lang': localStorage.getItem('lang') || 'ka' }
    : { 'X-Lang': localStorage.getItem('lang') || 'ka' };
}

export function translationHintText(ui, status) {
  if (!status.loaded) return ui.autoTranslateChecking;
  if (status.provider === 'offline') return ui.autoTranslateOffline;
  if (status.enabled) {
    const providerLabel =
      status.provider === 'gemini'
        ? 'Gemini'
        : status.provider === 'openai'
          ? 'OpenAI'
          : status.provider === 'offline'
            ? 'offline fallback'
            : 'AI';
    return ui.autoTranslateReady.replace('{provider}', providerLabel);
  }
  return ui.autoTranslateMissing;
}
