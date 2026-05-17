import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // El cargador estándar en Astro 6

const pagesCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/pages' }),
    schema: z.object({
        title: z.string(),
    }),
});

export const collections = {
    'pages': pagesCollection,
};