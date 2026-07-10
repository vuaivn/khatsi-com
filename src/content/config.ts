import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['kinh-dien', 'phat-hoc', 'tu-tap']),
    tags: z.array(z.string()).default([]),
    // Metadata thư viện — tạo tag tra cứu chéo
    author: z.string().optional(),   // tác giả / giảng sư (VD "Thích Từ Thông")
    work: z.string().optional(),     // tác phẩm / tên kinh (VD "Chứng Đạo Ca")
    youtubePlaylist: z.string().optional(), // id playlist YouTube
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    source: z.string().optional(), // nguồn/bản quyền cho kinh sách công khai
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
