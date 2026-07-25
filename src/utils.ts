export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}
export function isoDate(d: Date): string {
  return new Date(d).toISOString();
}
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// Slug hóa tiếng Việt cho URL tag
export function slugify(s: string): string {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-');
}

// Gom mọi tag của 1 bài: tags[] + tác giả + tác phẩm (kèm loại)
export function collectTags(data: any): { label: string; kind: string }[] {
  const out: { label: string; kind: string }[] = [];
  if (data.work) out.push({ label: data.work, kind: 'Tác phẩm' });
  if (data.author) out.push({ label: data.author, kind: 'Tác giả' });
  for (const t of data.tags ?? []) out.push({ label: t, kind: 'Chủ đề' });
  return out;
}
