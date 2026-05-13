import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Star, MoreVertical, FileSignature, Trash2 } from "lucide-react";
import { useLeadsStore } from "@/lib/store";
import { statusConfig, type LeadStatus } from "@/lib/leads-data";
import { useState } from "react";
import { useContractsStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline CRM — EZ Prospecter" },
      { name: "description", content: "Acompanhe o status dos seus leads no pipeline de vendas." },
    ],
  }),
  component: PipelinePage,
});

const columns: LeadStatus[] = ["novo", "contatado", "qualificado", "negociando", "fechado", "perdido"];

function PipelinePage() {
  const pipeline = useLeadsStore((s) => s.pipeline);
  const updateStatus = useLeadsStore((s) => s.updateStatus);
  const removeLead = useLeadsStore((s) => s.removeLead);
  const addContract = useContractsStore((s) => s.addContract);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const onDrop = (status: LeadStatus) => {
    if (!draggingId) return;
    updateStatus(draggingId, status);
    setDraggingId(null);
    toast.success(`Lead movido para ${statusConfig[status].label}`);
  };

  const generateContract = (leadName: string) => {
    addContract({
      id: `c-${Date.now()}`,
      leadName,
      service: "Serviço a definir",
      value: 0,
      status: "rascunho",
      createdAt: new Date().toISOString(),
    });
    toast.success("Contrato criado em rascunho");
  };

  return (
    <div className="p-4 md:p-8 space-y-6 h-[calc(100vh-3.5rem)] flex flex-col">
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1">CRM</div>
        <h1 className="text-3xl font-bold">Pipeline de Vendas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Arraste leads entre colunas para atualizar seu status · {pipeline.length} leads ativos
        </p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="grid grid-flow-col auto-cols-[280px] gap-3 h-full">
          {columns.map((status) => {
            const cfg = statusConfig[status];
            const items = pipeline.filter((l) => l.status === status);
            return (
              <div
                key={status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(status)}
                className="flex flex-col rounded-xl border border-border bg-card/40 min-h-0"
              >
                <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-sm rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                    <span className="text-sm font-semibold">{cfg.label}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{items.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {items.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                      Vazio
                    </div>
                  )}
                  {items.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => setDraggingId(lead.id)}
                      onDragEnd={() => setDraggingId(null)}
                      className={`rounded-lg border border-border bg-card p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all ${
                        draggingId === lead.id ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm leading-tight flex-1">{lead.name}</h4>
                        <div className="relative group">
                          <button className="p-0.5 rounded hover:bg-muted">
                            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <div className="absolute right-0 top-5 z-10 w-44 rounded-md border border-border bg-popover shadow-elevated opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <button onClick={() => generateContract(lead.name)} className="w-full px-3 py-2 text-left text-xs hover:bg-muted flex items-center gap-2">
                              <FileSignature className="h-3 w-3" /> Gerar contrato
                            </button>
                            <button onClick={() => removeLead(lead.id)} className="w-full px-3 py-2 text-left text-xs hover:bg-muted flex items-center gap-2 text-destructive">
                              <Trash2 className="h-3 w-3" /> Remover
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono uppercase text-primary tracking-wider mb-2">{lead.category}</div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-start gap-1.5"><MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" /><span className="truncate">{lead.city}</span></div>
                        <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 flex-shrink-0" /><span>{lead.phone}</span></div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          <span className="font-semibold">{lead.rating}</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">#{lead.id.slice(-4)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
