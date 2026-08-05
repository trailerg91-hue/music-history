/** Build a clean YouTube embed URL from watch / share / already-embed links. */
export function toYoutubeEmbed(url) {
  if (!url || typeof url !== 'string') return '';

  const raw = url.trim();
  if (!raw) return '';

  // Already embed
  const embedMatch = raw.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;

  // youtu.be/ID
  const shortMatch = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  // watch?v=ID  (ignore &list= &start_radio= etc.)
  try {
    const u = new URL(raw);
    const id = u.searchParams.get('v');
    if (id) return `https://www.youtube.com/embed/${id}`;
  } catch {
    // fall through
  }

  const vMatch = raw.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (vMatch) return `https://www.youtube.com/embed/${vMatch[1]}`;

  return '';
}
