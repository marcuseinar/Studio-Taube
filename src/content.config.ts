import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CATEGORIES = [
  'konsultation',
  'ansiktsbehandlingar',
  'avancerad-hudvard',
  'co2-laser',
  'head-spa',
  'lash-browlift',
  'fransforlangning',
  'fransar-bryn',
  'massage',
  'tandblekning',
  'elevbehandlingar',
] as const;

/**
 * Marks how trustworthy a translation is. Swedish is always authored by the
 * salon; English treatment copy must be reviewed by a human before it can be
 * called 'human'. See CLAUDE.md §9.
 */
const translationStatus = z.enum(['human', 'needs-review']).default('human');

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(CATEGORIES),
    durationMinutes: z.number().int().positive(),
    priceSek: z.number().int().nonnegative(),
    priceFrom: z.boolean().default(false),
    isFree: z.boolean().default(false),
    requiresConsultation: z.boolean().default(false),
    performedByStudent: z.boolean().default(false),
    bokadirektServiceId: z.number().int().positive().optional(),
    bokadirektSlug: z.string(),
    summary: z.string(),
    order: z.number().int().default(0),
    featured: z.boolean().default(false),
    translationStatus,
  }),
});

const campaigns = defineCollection({
  loader: glob({ base: './src/content/campaigns', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    /* Both optional: Bokadirekt campaigns have no end date, they run until
       the salon removes them. Never invent one. */
    validFrom: z.coerce.date().optional(),
    validTo: z.coerce.date().optional(),
    priceSek: z.number().int().positive(),
    ordinaryPriceSek: z.number().int().positive().optional(),
    durationMinutes: z.number().int().positive(),
    bokadirektServiceId: z.number().int().positive().optional(),
    bokadirektSlug: z.string(),
    requiresConsultation: z.boolean().default(false),
    priority: z.number().int().default(0),
    translationStatus,
  }),
});

const staff = defineCollection({
  loader: glob({ base: './src/content/staff', pattern: '**/*.md' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bokadirektStaffId: z.number().int().positive().optional(),
    order: z.number().int().default(0),
    translationStatus,
  }),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.coerce.date(),
    translationStatus,
  }),
});

export const collections = { services, campaigns, staff, pages };
export { CATEGORIES };
export type ServiceCategory = (typeof CATEGORIES)[number];
