export const site = {
  name: 'Khất Sĩ',
  domain: 'khatsi.com',
  url: 'https://khatsi.com',
  tagline: 'Thư viện Phật pháp · Thiểu dục tri túc',
  description:
    'Khất Sĩ — thư viện Phật pháp trực tuyến. Lưu giữ và lan tỏa kinh sách, pháp âm, bài luận giải theo tinh thần người học và hành giáo lý nhà Phật: giản dị, tỉnh thức, thiểu dục tri túc.',
  email: 'lienhe@khatsi.com',
  author: { name: 'Khất Sĩ' },
  // Mạng lưới site cùng chủ (cross-link rel=me)
  network: [
    { label: 'nguyenngocvu.com', url: 'https://nguyenngocvu.com' },
    { label: 'vu.ai.vn', url: 'https://vu.ai.vn' },
  ],
  social: {
    youtube: 'https://www.youtube.com/@cusiminhvan',
    facebook: 'https://www.facebook.com/vutrocsaigon/',
  },
};

// Danh mục bài viết / luận giải
export const categories = [
  { slug: 'kinh-dien', name: 'Kinh điển', desc: 'Kinh Phật và các bản dịch, chú giải công khai.' },
  { slug: 'phat-hoc', name: 'Phật học', desc: 'Giáo lý căn bản, khái niệm và luận giải dễ hiểu.' },
  { slug: 'tu-tap', name: 'Tu tập', desc: 'Thiền, chánh niệm và ứng dụng Phật pháp vào đời sống.' },
];

// Các kho nội dung chính (trang chủ)
export const collectionsNav = [
  { icon: '📜', title: 'Kinh sách', desc: 'Kho kinh điển và bản dịch, phân loại theo chủ đề.', link: '/kinh-sach' },
  { icon: '✍️', title: 'Bài viết', desc: 'Luận giải, Phật học ứng dụng và ghi chép tu học.', link: '/blog' },
  { icon: '🎧', title: 'Pháp âm', desc: 'Bài giảng audio & video chọn lọc.', link: '/phap-am' },
  { icon: '📖', title: 'Thuật ngữ', desc: 'Từ điển Phật học tra cứu nhanh.', link: '/thuat-ngu' },
];

export function categoryName(slug: string) {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}
