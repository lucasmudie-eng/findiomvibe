// src/lib/football/schema.ts

// We mirror the core football types so DTOs stay in sync.
import type {
  LeagueId,
  TeamId,
  Fixture,
  Result,
  TableEntry,
  LeagueBundle,
} from "./types";

/**
 * DTO types – these are the shapes we expect from our
 * (future) external feeds or intermediate transforms.
 *
 * Right now they just alias the core types to avoid
 * duplicating shape definitions.
 */

export type FixtureDTO = Fixture & {
  league: LeagueId | string;
  homeId: TeamId | string;
  awayId: TeamId | string;
};

export type ResultDTO = Result & {
  league: LeagueId | string;
  homeId: TeamId | string;
  awayId: TeamId | string;
};

export type TableEntryDTO = TableEntry & {
  teamId: TeamId | string;
};

export type LeagueBundleDTO = LeagueBundle & {
  league: LeagueId | string;
  table: TableEntryDTO[];
};

/**
 * Lightweight “schema” objects to preserve the old API.
 * They currently just act as typed pass-throughs.
 * If/when we need real runtime validation, we can bolt it
 * back on here without touching the rest of the app.
 */

export const FixtureSchema = {
  parse(input: unknown): FixtureDTO {
    return input as FixtureDTO;
  },
};

export const ResultSchema = {
  parse(input: unknown): ResultDTO {
    return input as ResultDTO;
  },
};

export const TableEntrySchema = {
  parse(input: unknown): TableEntryDTO {
    return input as TableEntryDTO;
  },
};

export const LeagueBundleSchema = {
  parse(input: unknown): LeagueBundleDTO {
    return input as LeagueBundleDTO;
  },
};