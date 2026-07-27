import { z } from 'zod'

export const runInputSchema = z.object({
  plannedWorkoutId: z.string().nullable(),
  runDate: z.iso.date(),
  distanceKm: z.number().positive('Enter a distance greater than zero').max(100, 'Distance must be under 100 km'),
  durationSeconds: z.number().int().positive('Enter a valid duration').max(86_400, 'Duration must be under 24 hours'),
  effort: z.enum(['easy', 'moderate', 'hard', 'max']).nullable(),
  notes: z.string().max(280, 'Keep notes under 280 characters'),
})
