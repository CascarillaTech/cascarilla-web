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

// Datos legais/identificativos da asociación (CIF, domicilio, rexistros...).
// Vive nun .md para poder editalos sen tocar código.
const orgCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/org' }),
    schema: z.object({
        denominacion: z.string(),
        cif: z.string(),
        domicilio: z.string(),
        rexistroXunta: z.string(),
        remac: z.string(),
        email: z.string(),
    }),
});

// Cotas de socio/a e o texto sobre o estado da admisión.
// Igual que orgCollection, en .md para editar sen tocar código.
const membershipCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/membership' }),
    schema: z.object({
        admissionClosed: z.boolean(),
        adminNote: z.string(),
        fees: z.array(z.object({
            name: z.string(),
            amount: z.number(),
            description: z.string(),
            highlight: z.boolean().optional(),
        })),
    }),
});

export const collections = {
    'pages': pagesCollection,
    'news': newsCollection,
    'org': orgCollection,
    'membership': membershipCollection,
};