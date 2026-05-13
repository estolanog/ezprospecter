// Mock leads data — shared across pages
export type LeadStatus = "novo" | "contatado" | "qualificado" | "negociando" | "fechado" | "perdido";

export interface Lead {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  reviews: number;
  website?: string;
  status: LeadStatus;
  createdAt: string;
  lat: number;
  lng: number;
}

const categories = [
  "Restaurante", "Clínica Odontológica", "Academia", "Salão de Beleza",
  "Pet Shop", "Auto Mecânica", "Loja de Roupas", "Padaria", "Farmácia",
  "Escritório de Advocacia", "Imobiliária", "Construtora",
];

const cities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre"];

const streets = [
  "Av. Paulista", "Rua Oscar Freire", "Av. Brigadeiro Faria Lima",
  "Rua Augusta", "Av. Atlântica", "Rua Visconde de Pirajá",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const businessNames = [
  "Estrela", "Premium", "Elite", "Master", "Top", "Real", "Royal",
  "Prime", "Imperial", "Diamante", "Ouro", "Vitrine", "Central",
];

export function generateMockLeads(query: string, city: string, count = 16): Lead[] {
  const cat = query || rand(categories);
  return Array.from({ length: count }, (_, i) => {
    const id = `lead-${Date.now()}-${i}`;
    return {
      id,
      name: `${cat} ${rand(businessNames)} ${Math.floor(Math.random() * 999)}`,
      category: cat,
      address: `${rand(streets)}, ${100 + Math.floor(Math.random() * 9000)}`,
      city: city || rand(cities),
      phone: `(${10 + Math.floor(Math.random() * 89)}) 9${1000 + Math.floor(Math.random() * 8999)}-${1000 + Math.floor(Math.random() * 8999)}`,
      rating: Number((3 + Math.random() * 2).toFixed(1)),
      reviews: Math.floor(Math.random() * 800) + 5,
      website: Math.random() > 0.4 ? `www.${cat.toLowerCase().replace(/\s+/g, "")}.com.br` : undefined,
      status: "novo" as LeadStatus,
      createdAt: new Date().toISOString(),
      lat: -23.55 + (Math.random() - 0.5) * 0.5,
      lng: -46.63 + (Math.random() - 0.5) * 0.5,
    };
  });
}

// Pre-populated CRM leads
export const seedPipelineLeads: Lead[] = [
  ...generateMockLeads("Restaurante", "São Paulo", 4).map((l, i) => ({
    ...l,
    status: (["novo", "contatado", "qualificado", "negociando"] as LeadStatus[])[i],
  })),
  ...generateMockLeads("Clínica Odontológica", "Rio de Janeiro", 3).map((l, i) => ({
    ...l,
    status: (["contatado", "qualificado", "fechado"] as LeadStatus[])[i],
  })),
  ...generateMockLeads("Academia", "Belo Horizonte", 3).map((l, i) => ({
    ...l,
    status: (["novo", "negociando", "fechado"] as LeadStatus[])[i],
  })),
];

export const statusConfig: Record<LeadStatus, { label: string; color: string; dot: string }> = {
  novo: { label: "Novo", color: "bg-info/10 text-info border-info/30", dot: "bg-info" },
  contatado: { label: "Contatado", color: "bg-warning/10 text-warning border-warning/30", dot: "bg-warning" },
  qualificado: { label: "Qualificado", color: "bg-primary/10 text-primary border-primary/30", dot: "bg-primary" },
  negociando: { label: "Negociando", color: "bg-purple-500/10 text-purple-400 border-purple-500/30", dot: "bg-purple-400" },
  fechado: { label: "Fechado", color: "bg-success/10 text-success border-success/30", dot: "bg-success" },
  perdido: { label: "Perdido", color: "bg-destructive/10 text-destructive border-destructive/30", dot: "bg-destructive" },
};
