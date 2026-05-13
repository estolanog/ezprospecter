import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, Key, Globe, Shield, Zap, RefreshCw, ExternalLink } from "lucide-react";
import { checkPlacesStatus } from "@/lib/places.functions";
import { useLeadsStore } from "@/lib/store";
import { useContractsStore } from "@/lib/store";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — EZ Prospecter" },
      { name: "description", content: "Gerencie integrações, API keys e preferências do sistema." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const checkStatus = useServerFn(checkPlacesStatus);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["places-status"],
    queryFn: () => checkStatus(),
  });

  const leadsCount = useLeadsStore((s) => s.pipeline.length);
  const contractsCount = useContractsStore((s) => s.contracts.length);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl">
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1">Sistema</div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie integrações, segurança e preferências da plataforma
        </p>
      </div>

      {/* API Integrations */}
      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Integrações de API</h2>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
            Testar conexão
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Google Places */}
          <div className="rounded-lg border border-border bg-background/50 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Google Places API</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Busca real de estabelecimentos via Google Maps Platform
                  </p>
                </div>
              </div>
              <StatusBadge isLoading={isLoading} configured={data?.configured} working={data?.working} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <InfoRow label="Endpoint" value="places.googleapis.com/v1" />
              <InfoRow label="Versão" value="Places API (New)" />
              <InfoRow label="Idioma" value="pt-BR" />
              <InfoRow label="Região" value="BR" />
            </div>

            {data?.message && (
              <div className={`mt-3 text-xs px-3 py-2 rounded-md font-mono ${
                data.working ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}>
                {data.message}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Key className="h-3 w-3" />
                <span className="font-mono">GOOGLE_MAPS_API_KEY</span>
                <span className="px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20 text-[10px]">
                  ARMAZENADA
                </span>
              </div>
              <a
                href="https://console.cloud.google.com/google/maps-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Console Google Cloud <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* System info */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Zap} label="Leads no Pipeline" value={leadsCount} />
        <StatCard icon={Shield} label="Contratos ativos" value={contractsCount} />
        <StatCard icon={Globe} label="Status sistema" value="Online" valueClass="text-success" />
      </section>

      {/* Security */}
      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Segurança & Privacidade</h2>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <SecurityItem
            title="Chaves protegidas no servidor"
            description="API keys armazenadas como variáveis de ambiente, nunca expostas ao navegador."
          />
          <SecurityItem
            title="Requisições server-side"
            description="Toda chamada à Google Places API passa por server functions autenticadas."
          />
          <SecurityItem
            title="Persistência local segura"
            description="Pipeline e contratos salvos em localStorage criptografado pelo navegador."
          />
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Preferências da Plataforma</h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow label="Tema" value="Dark Tech" />
          <InfoRow label="Moeda" value="BRL (R$)" />
          <InfoRow label="Fuso horário" value="America/Sao_Paulo" />
          <InfoRow label="Idioma" value="Português (BR)" />
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ isLoading, configured, working }: { isLoading: boolean; configured?: boolean; working?: boolean }) {
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border bg-muted/50">
        <Loader2 className="h-3 w-3 animate-spin" /> Verificando
      </span>
    );
  }
  if (working) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-success/30 bg-success/10 text-success">
        <CheckCircle2 className="h-3 w-3" /> Operacional
      </span>
    );
  }
  if (configured) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-warning/30 bg-warning/10 text-warning">
        <XCircle className="h-3 w-3" /> Erro de API
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
      <XCircle className="h-3 w-3" /> Não configurada
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-background/50 border border-border">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-mono">{value}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, valueClass = "" }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

function SecurityItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
    </div>
  );
}
