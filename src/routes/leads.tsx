import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MapPin, Star, Phone, Globe, Plus, Loader2, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { type Lead } from "@/lib/leads-data";
import { useLeadsStore } from "@/lib/store";
import { searchPlaces } from "@/lib/places.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Buscar Leads — EZ Prospecter" },
      { name: "description", content: "Prospecte clientes via integração com Google Maps." },
    ],
  }),
  component: LeadsPage,
});

const niches = ["Restaurante", "Clínica Odontológica", "Academia", "Salão de Beleza", "Pet Shop", "Auto Mecânica", "Farmácia", "Imobiliária"];
const cities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre", "Brasília", "Salvador"];

function LeadsPage() {
  const [niche, setNiche] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const addLeads = useLeadsStore((s) => s.addLeads);
  const search = useServerFn(searchPlaces);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche || !city) {
      toast.error("Informe o nicho e a cidade");
      return;
    }
    setLoading(true);
    setSelected(new Set());
    try {
      const res = await search({ data: { query: niche, city } });
      if (!res.ok) {
        toast.error(res.error || "Falha ao buscar no Google Places");
        setResults([]);
      } else {
        setResults(res.leads);
        if (res.leads.length === 0) toast.info("Nenhum resultado encontrado");
        else toast.success(`${res.leads.length} leads reais em ${city}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro na busca");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map((r) => r.id)));
  };

  const importSelected = () => {
    const chosen = results.filter((r) => selected.has(r.id));
    if (chosen.length === 0) {
      toast.error("Selecione ao menos um lead");
      return;
    }
    addLeads(chosen);
    toast.success(`${chosen.length} leads adicionados ao Pipeline`);
    setSelected(new Set());
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1">Prospecção</div>
        <h1 className="text-3xl font-bold">Buscar Leads</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Encontre clientes potenciais via integração com Google Maps Places
        </p>
      </div>

      {/* Search panel */}
      <form onSubmit={handleSearch} className="rounded-xl border border-border bg-card p-5 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Nicho / Categoria</label>
          <input
            list="niches"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Ex: Restaurante"
            className="w-full h-10 px-3 rounded-md bg-input/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <datalist id="niches">{niches.map((n) => <option key={n} value={n} />)}</datalist>
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Cidade</label>
          <input
            list="cities"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex: São Paulo"
            className="w-full h-10 px-3 rounded-md bg-input/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <datalist id="cities">{cities.map((n) => <option key={n} value={n} />)}</datalist>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-10 px-5 rounded-md bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2 shadow-glow"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Buscar
        </button>
      </form>

      {/* API Notice */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-xs text-muted-foreground">
          <span className="text-primary font-semibold">Google Places ativo:</span> Resultados em tempo real via Google Maps Platform. Status e configuração em <span className="font-mono text-foreground">Configurações</span>.
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono text-muted-foreground">{results.length} resultados</span>
              <button onClick={selectAll} className="text-xs text-primary hover:underline">
                {selected.size === results.length ? "Desmarcar todos" : "Selecionar todos"}
              </button>
            </div>
            <button
              onClick={importSelected}
              disabled={selected.size === 0}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar ao Pipeline ({selected.size})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((lead) => {
              const isSelected = selected.has(lead.id);
              return (
                <button
                  key={lead.id}
                  onClick={() => toggle(lead.id)}
                  className={`text-left rounded-xl border bg-card p-4 transition-all ${
                    isSelected ? "border-primary ring-2 ring-primary/30 shadow-glow" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
                      <div className="text-[11px] font-mono text-primary uppercase tracking-wider mt-0.5">{lead.category}</div>
                    </div>
                    <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary border-primary" : "border-border"}`}>
                      {isSelected && <svg viewBox="0 0 16 16" className="h-3 w-3 text-primary-foreground"><path fill="currentColor" d="M13.78 4.22a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06L6.25 10.69l6.47-6.47a.75.75 0 011.06 0z" /></svg>}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-start gap-1.5"><MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" /><span className="truncate">{lead.address}, {lead.city}</span></div>
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 flex-shrink-0" /><span>{lead.phone}</span></div>
                    {lead.website && <div className="flex items-center gap-1.5"><Globe className="h-3 w-3 flex-shrink-0" /><span className="truncate">{lead.website}</span></div>}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      <span className="font-semibold">{lead.rating}</span>
                      <span className="text-muted-foreground">({lead.reviews})</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Maps</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {!loading && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">Comece sua prospecção</h3>
          <p className="text-sm text-muted-foreground">Digite o nicho e a cidade para encontrar leads qualificados</p>
        </div>
      )}
    </div>
  );
}
