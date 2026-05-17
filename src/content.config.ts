import { defineCollection} from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const pagesCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/pages' }),
    schema: z.object({
        title: z.string(),
    }),
});

const newsCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/news' }),
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(), // Converte automaticamente o texto a data
        description: z.string().optional(), // Un resumo opcional
    }),
});

export const collections = {
    'pages': pagesCollection,
    'news': newsCollection
};