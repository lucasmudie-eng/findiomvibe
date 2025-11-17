// src/lib/football/schema.ts
import { z } from "zod";

// Minimal schemas for external feeds; extend as your source dictates.
export const FixtureSchema = z.object({
  id: z.string(),
  league: z.string(),
  date: z.string(), // ISO
  homeId: z.string(),
  awayId: z.string(),
  venue: z.string().optional(),
  status: z.enum(["SCHEDULED", "LIVE", "FT"]).default("SCHEDULED"),
});

export const ResultSchema = FixtureSchema.extend({
  status: z.literal("FT"),
  homeGoals: z.number().int().nonnegative(),
  awayGoals: z.number().int().nonnegative(),
});

export const TableEntrySchema = z.object({
  teamId: z.string(),
  played: z.number().int().nonnegative(),
  won: z.number().int().nonnegative(),
  drawn: z.number().int().nonnegative(),
  lost: z.number().int().nonnegative(),
  gf: z.number().int().nonnegative(),
  ga: z.number().int().nonnegative(),
  gd: z.number().int(), // can be negative
  points: z.number().int().nonnegative(),
  pos: z.number().int().positive().optional(),
});

export const LeagueBundleSchema = z.object({
  league: z.string(),
  teams: z.array(z.object({
    id: z.string(),
    name: z.string(),
    league: z.string(),
    isCombination: z.boolean().optional(),
    crestUrl: z.string().url().optional(),
  })),
  fixturesUpcoming: z.array(FixtureSchema),
  resultsRecent: z.array(ResultSchema),
  table: z.array(TableEntrySchema),
  updatedAt: z.string(),
});

export type FixtureDTO = z.infer<typeof FixtureSchema>;
export type ResultDTO = z.infer<typeof ResultSchema>;
export type LeagueBundleDTO = z.infer<typeof LeagueBundleSchema>;