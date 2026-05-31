"use client";

import algoliasearch from "algoliasearch/lite";
import { useEffect, useRef, useState, useCallback } from "react";

// ── Client ───────────────────────────────────────────────────────────────────

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "";
const SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ?? "";
const INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? "properties";

const searchClient = APP_ID && SEARCH_KEY ? algoliasearch(APP_ID, SEARCH_KEY) : null;
const index = searchClient ? searchClient.initIndex(INDEX_NAME) : null;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PropertySearchResult {
  objectID: string;
  name: string;
  slug: string;
  city: string;
  locality: string;
  pincode: string;
  addressLine1: string;
  genderPolicy: string;
  tier: string;
  verificationStatus: string;
  isListed: boolean;
  mainPhotoUrl: string | null;
  availableBeds: number;
  totalBeds: number;
  minPrice: number;
  maxPrice: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  _geoloc?: { lat: number; lng: number };
  _highlightResult?: Record<string, unknown>;
}

export interface SearchFilters {
  city?: string;
  locality?: string;
  genderPolicy?: string;
  tier?: string;
  amenities?: string[];
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface UsePropertySearchOptions {
  query?: string;
  filters?: SearchFilters;
  page?: number;
  hitsPerPage?: number;
  enabled?: boolean;
}

export interface UsePropertySearchResult {
  results: PropertySearchResult[];
  total: number;
  totalPages: number;
  page: number;
  loading: boolean;
  error: string | null;
  searchId: string | null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePropertySearch({
  query = "",
  filters = {},
  page = 0,
  hitsPerPage = 12,
  enabled = true,
}: UsePropertySearchOptions): UsePropertySearchResult {
  const [results, setResults] = useState<PropertySearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(async () => {
    if (!enabled) return;

    // Without Algolia configured, return empty
    if (!index) {
      setResults([]);
      setTotal(0);
      setTotalPages(0);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const facetFilters: string[][] = [];

      if (filters.genderPolicy) facetFilters.push([`genderPolicy:${filters.genderPolicy}`]);
      if (filters.tier) facetFilters.push([`tier:${filters.tier}`]);
      if (filters.city) facetFilters.push([`city:${filters.city}`]);
      if (filters.locality) facetFilters.push([`locality:${filters.locality}`]);
      if (filters.amenities?.length) {
        facetFilters.push(filters.amenities.map((a) => `amenities:${a}`));
      }

      const numericFilters: string[] = [];
      if (filters.minPrice) numericFilters.push(`minPrice >= ${filters.minPrice}`);
      if (filters.maxPrice) numericFilters.push(`maxPrice <= ${filters.maxPrice}`);
      numericFilters.push('availableBeds >= 1');

      const searchParams: Parameters<typeof index.search>[1] = {
        page,
        hitsPerPage,
        facetFilters: facetFilters.length ? facetFilters : undefined,
        numericFilters: numericFilters.length ? numericFilters : undefined,
        filters: 'isListed:true AND verificationStatus:VERIFIED',
        clickAnalytics: true,
      };

      // Geo-search — spread in separately to avoid read-only assignment
      const geoParams = filters.lat !== undefined && filters.lng !== undefined
        ? {
            aroundLatLng: `${filters.lat}, ${filters.lng}`,
            aroundRadius: filters.radiusKm ? filters.radiusKm * 1000 : 10_000,
          }
        : {};

      const response = await index.search<PropertySearchResult>(query, { ...searchParams, ...geoParams });

      setResults(response.hits);
      setTotal(response.nbHits);
      setTotalPages(response.nbPages);
      setSearchId(response.queryID ?? null);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, [query, JSON.stringify(filters), page, hitsPerPage, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runSearch, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [runSearch]);

  return { results, total, totalPages, page, loading, error, searchId };
}

// ── Click tracking ────────────────────────────────────────────────────────────

export function trackPropertyClick(
  objectID: string,
  position: number,
  queryID: string | null,
): void {
  if (!searchClient || !queryID) return;
  // Algolia Insights — fire-and-forget
  searchClient.search([
    {
      indexName: INDEX_NAME,
      params: { clickedObjectIDsAfterSearch: [objectID], positions: [position], queryID },
    },
  ] as any).catch(() => {});
}

// ── Autocomplete suggestions ──────────────────────────────────────────────────

export async function getSearchSuggestions(query: string): Promise<PropertySearchResult[]> {
  if (!index || query.length < 2) return [];

  try {
    const { hits } = await index.search<PropertySearchResult>(query, {
      hitsPerPage: 5,
      filters: 'isListed:true',
      attributesToRetrieve: ['objectID', 'name', 'city', 'locality', 'slug', 'mainPhotoUrl', 'minPrice'],
    });
    return hits;
  } catch {
    return [];
  }
}
