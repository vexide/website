import { z, defineCollection } from "astro:content";

const blog = defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      date: z.date(),
      description: z.string(),
      author: z.string(),
      thumbnail: z.object({
        url: z.string(),
        alt: z.string()
      }),
      tags: z.array(z.string()),
      draft: z.boolean().optional(),
    })
});

const docs = defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      category: z.string(),
      page: z.number(),
    })
});

export const collections = {
	docs,
	blog,
};
