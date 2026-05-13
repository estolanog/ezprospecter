import { createFileRoute } from "@tanstack/react-router";
import {
  Users, TrendingUp, FileSignature, Target, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { useLeadsStore, useContractsStore } from "@/lib/store";
import { statusConfig } from "@/lib/leads-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — EZ Prospecter" },
      { name: "description", content: "Visão geral de leads, conversões e contratos." },
    ],
  }),
  component: Dashboard,
});

const monthlyData = [
  { mes: "Jan", leads: 42, fechados: 8 },
  { mes: "Fev", leads: 58, fechados: 12 },
  { mes: "Mar", leads: 71, fechados: 18 },
  { mes: "Abr", leads: 89, fechados: 22 },
  { mes: "Mai", leads: 124, fechados: 31 },
  { mes: "Jun", leads: 156, fechados: 44 },
];

const sourceData = [
  { fonte: "Maps", valor: 142 },
  { fonte: "Indicação", valor: 38 },
  { fonte: "Site", valor: 64 },
  { fonte: "Social", valor: 29 },
];

function Dashboard() {
  const pipeline = useLeadsStore((s) => s.pipeline);
  const contracts = useContractsStore((s) => s.contracts);

  const totalLeads = pipeline.length;
  const fechados = pipeline.filter((l) => l.status === "fechado").length;
  const taxaConversao = totalLeads > 0 ? ((fechados / totalLeads) * 100).toFixed(1) : "0";
  const receita = contracts.filter((c) => c.status === "assinado").reduce((s, c) => s + c.value, 0);

  const statusBreakdown = Object.entries(statusConfig).map(([key, cfg]) => ({
    status: cfg.label,
    valor: pipeline.filter((l) => l.status === key).length,
  }));

  const COLORS = ["oklch(0.70 0.16 230)", "oklch(0.80 0.16 80)", "oklch(0.78 0.18 155)", "oklch(0.65 0.20 305)", "oklch(0.85 0.20 155)", "oklch(0.65 0.22 22)"];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1">Overview</div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance de prospecção e fechamento</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Atualizado agora
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total de Leads" value={totalLeads.toString()} delta="+18.2%" up tint="info" />
        <KpiCard icon={Target} label="Taxa de Conversão" value={`${taxaConversao}%`} delta="+4.1%" up tint="primary" />
        <KpiCard icon={FileSignature} label="Contratos Ativos" value={contracts.filter(c => c.status === "assinado").length.toString()} delta="+2" up tint="warning" />
        <KpiCard icon={TrendingUp} label="Receita (MRR)" value={`R$ ${receita.toLocaleString("pt-BR")}`} delta="-3.4%" up={false} tint="primary" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Evolução de Leads</h3>
              <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Legend dot="bg-info" label="Captados" />
              <Legend dot="bg-primary" label="Fechados" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.70 0.16 230)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.70 0.16 230)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.18 155)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.78 0.18 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 270)" />
                <XAxis dataKey="mes" stroke="oklch(0.65 0.02 270)" fontSize={12} />
                <YAxis stroke="oklch(0.65 0.02 270)" fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.02 270)", border: "1px solid oklch(0.28 0.02 270)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="leads" stroke="oklch(0.70 0.16 230)" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="fechados" stroke="oklch(0.78 0.18 155)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-1">Distribuição por Status</h3>
          <p className="text-xs text-muted-foreground mb-4">Pipeline atual</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusBreakdown} dataKey="valor" nameKey="status" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.18 0.02 270)", border: "1px solid oklch(0.28 0.02 270)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-3">
            {statusBreakdown.map((s, i) => (
              <div key={s.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{s.status}</span>
                </div>
                <span className="font-mono font-semibold">{s.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-4">Origem dos Leads</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 270)" />
                <XAxis dataKey="fonte" stroke="oklch(0.65 0.02 270)" fontSize={12} />
                <YAxis stroke="oklch(0.65 0.02 270)" fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.02 270)", border: "1px solid oklch(0.28 0.02 270)", borderRadius: 8 }} cursor={{ fill: "oklch(0.22 0.02 270 / 0.4)" }} />
                <Bar dataKey="valor" fill="oklch(0.78 0.18 155)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {pipeline.slice(0, 6).map((lead) => {
              const cfg = statusConfig[lead.status];
              return (
                <div key={lead.id} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{lead.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{lead.category} · {lead.city}</div>
                  </div>
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, delta, up, tint }: any) {
  const tintMap: Record<string, string> = {
    primary: "from-primary/20 to-primary/5 text-primary border-primary/20",
    info: "from-info/20 to-info/5 text-info border-info/20",
    warning: "from-warning/20 to-warning/5 text-warning border-warning/20",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br border ${tintMap[tint]} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={`text-xs font-mono flex items-center gap-0.5 ${up ? "text-success" : "text-destructive"}`}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </div>
  );
}
