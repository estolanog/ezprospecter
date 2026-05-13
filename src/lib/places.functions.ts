import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Lead, LeadStatus } from "./leads-data";

const inputSchema = z.object({
  query: z.string().min(1).max(120),
  city: z.string().min(1).max(120),
});

interface PlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text: string };
  location?: { latitude: number; longitude: number };
}

export const searchPlaces = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "GOOGLE_MAPS_API_KEY não configurada", leads: [] };
    }

    const textQuery = `${data.query} em ${data.city}`;

    try {
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.location",
        },
        body: JSON.stringify({ textQuery, languageCode: "pt-BR", regionCode: "BR", maxResultCount: 20 }),
      });

      if (!res.ok) {
        const text = await res.text();
        return { ok: false as const, error: `Google API ${res.status}: ${text.slice(0, 200)}`, leads: [] };
      }

      const json = (await res.json()) as { places?: PlaceResult[] };
      const leads: Lead[] = (json.places ?? []).map((p, i) => ({
        id: p.id || `gp-${Date.now()}-${i}`,
        name: p.displayName?.text || "Sem nome",
        category: p.primaryTypeDisplayName?.text || data.query,
        address: p.formattedAddress || "",
        city: data.city,
        phone: p.nationalPhoneNumber || p.internationalPhoneNumber || "—",
        rating: p.rating ?? 0,
        reviews: p.userRatingCount ?? 0,
        website: p.websiteUri,
        status: "novo" as LeadStatus,
        createdAt: new Date().toISOString(),
        lat: p.location?.latitude ?? 0,
        lng: p.location?.longitude ?? 0,
      }));

      return { ok: true as const, error: null, leads };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Erro desconhecido", leads: [] };
    }
  });

export const checkPlacesStatus = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { configured: false, working: false, message: "Chave não configurada" };

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({ textQuery: "café em São Paulo", maxResultCount: 1 }),
    });
    if (res.ok) return { configured: true, working: true, message: "Conectado e operacional" };
    const text = await res.text();
    return { configured: true, working: false, message: `Erro ${res.status}: ${text.slice(0, 150)}` };
  } catch (err) {
    return { configured: true, working: false, message: err instanceof Error ? err.message : "Erro" };
  }
});
