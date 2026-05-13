import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileSignature, Plus, CheckCircle2, Clock, FileText, X, Send } from "lucide-react";
import { useContractsStore, type Contract } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/contratos")({
  head: () => ({
    meta: [
      { title: "Contratos — EZ Prospecter" },
      { name: "description", content: "Gere e colete assinaturas digitais de contratos." },
    ],
  }),
  component: ContractsPage,
});

const statusBadge: Record<Contract["status"], { label: string; cls: string; icon: any }> = {
  rascunho: { label: "Rascunho", cls: "bg-muted text-muted-foreground border-border", icon: FileText },
  enviado: { label: "Enviado", cls: "bg-warning/10 text-warning border-warning/30", icon: Send },
  assinado: { label: "Assinado", cls: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", cls: "bg-destructive/10 text-destructive border-destructive/30", icon: X },
};

function ContractsPage() {
  const contracts = useContractsStore((s) => s.contracts);
  const addContract = useContractsStore((s) => s.addContract);
  const signContract = useContractsStore((s) => s.signContract);
  const removeContract = useContractsStore((s) => s.removeContract);

  const [showForm, setShowForm] = useState(false);
  const [signing, setSigning] = useState<Contract | null>(null);

  const stats = {
    total: contracts.length,
    assinados: contracts.filter((c) => c.status === "assinado").length,
    pendentes: contracts.filter((c) => c.status === "enviado" || c.status === "rascunho").length,
    receita: contracts.filter((c) => c.status === "assinado").reduce((s, c) => s + c.value, 0),
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1">Documentos</div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gere e colete assinaturas digitais</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="h-10 px-4 rounded-md bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-sm font-semibold inline-flex items-center gap-2 shadow-glow hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Novo Contrato
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total" value={stats.total.toString()} />
        <Stat label="Assinados" value={stats.assinados.toString()} accent="success" />
        <Stat label="Pendentes" value={stats.pendentes.toString()} accent="warning" />
        <Stat label="Receita Confirmada" value={`R$ ${stats.receita.toLocaleString("pt-BR")}`} accent="primary" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm">Todos os contratos</h3>
          <span className="text-xs font-mono text-muted-foreground">{contracts.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Cliente</th>
                <th className="text-left px-5 py-3">Serviço</th>
                <th className="text-left px-5 py-3">Valor</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Data</th>
                <th className="text-right px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const cfg = statusBadge[c.status];
                const Icon = cfg.icon;
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium">{c.leadName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.service}</td>
                    <td className="px-5 py-3 font-mono">R$ {c.value.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.cls}`}>
                        <Icon className="h-3 w-3" /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      {c.status !== "assinado" && c.status !== "cancelado" && (
                        <button
                          onClick={() => setSigning(c)}
                          className="text-xs px-2.5 py-1 rounded border border-primary/40 text-primary hover:bg-primary/10"
                        >
                          Assinar
                        </button>
                      )}
                      <button
                        onClick={() => { removeContract(c.id); toast.success("Contrato removido"); }}
                        className="text-xs px-2.5 py-1 rounded border border-border text-muted-foreground hover:bg-muted"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
              {contracts.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">Nenhum contrato ainda</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <NewContractModal onClose={() => setShowForm(false)} onSave={(c) => { addContract(c); setShowForm(false); toast.success("Contrato criado"); }} />}
      {signing && <SignModal contract={signing} onClose={() => setSigning(null)} onSign={(sig) => { signContract(signing.id, sig); setSigning(null); toast.success("Contrato assinado!"); }} />}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const map: Record<string, string> = {
    success: "text-success",
    warning: "text-warning",
    primary: "text-primary",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ? map[accent] : ""}`}>{value}</div>
    </div>
  );
}

function NewContractModal({ onClose, onSave }: { onClose: () => void; onSave: (c: Contract) => void }) {
  const [leadName, setLead] = useState("");
  const [service, setService] = useState("");
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !service) return;
    onSave({
      id: `c-${Date.now()}`,
      leadName,
      service,
      value: Number(value) || 0,
      status: "rascunho",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Novo Contrato</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <Field label="Cliente / Lead">
            <input value={leadName} onChange={(e) => setLead(e.target.value)} required className="w-full h-10 px-3 rounded-md bg-input/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </Field>
          <Field label="Serviço contratado">
            <input value={service} onChange={(e) => setService(e.target.value)} required placeholder="Ex: Consultoria de Marketing" className="w-full h-10 px-3 rounded-md bg-input/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </Field>
          <Field label="Valor (R$)">
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" className="w-full h-10 px-3 rounded-md bg-input/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono" />
          </Field>
          <button type="submit" className="w-full h-10 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90">
            Criar Contrato
          </button>
        </form>
      </div>
    </div>
  );
}

function SignModal({ contract, onClose, onSign }: { contract: Contract; onClose: () => void; onSign: (sig: string) => void }) {
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between sticky top-0 bg-card">
          <div className="flex items-center gap-2">
            <FileSignature className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Assinatura de Contrato</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-lg border border-border bg-background/40 p-5 text-sm leading-relaxed text-muted-foreground max-h-64 overflow-y-auto">
            <h4 className="font-semibold text-foreground mb-3 text-center">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h4>
            <p className="mb-3"><strong className="text-foreground">CONTRATANTE:</strong> {contract.leadName}</p>
            <p className="mb-3"><strong className="text-foreground">OBJETO:</strong> {contract.service}</p>
            <p className="mb-3"><strong className="text-foreground">VALOR:</strong> R$ {contract.value.toLocaleString("pt-BR")}</p>
            <p className="mb-3">Pelo presente instrumento particular, as partes acima qualificadas têm entre si justo e contratado o que segue, mediante as cláusulas e condições aqui pactuadas.</p>
            <p className="mb-3"><strong className="text-foreground">Cláusula 1ª.</strong> O presente contrato tem por objeto a prestação dos serviços descritos acima, conforme escopo definido em proposta comercial.</p>
            <p className="mb-3"><strong className="text-foreground">Cláusula 2ª.</strong> O CONTRATANTE pagará à CONTRATADA o valor estipulado, na forma e prazos acordados.</p>
            <p><strong className="text-foreground">Cláusula 3ª.</strong> Este contrato passa a vigorar a partir da data de sua assinatura digital.</p>
          </div>

          <Field label="Nome completo do signatário">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Digite seu nome" className="w-full h-10 px-3 rounded-md bg-input/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </Field>

          {name && (
            <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Pré-visualização da assinatura</div>
              <div className="text-3xl text-primary" style={{ fontFamily: "cursive" }}>{name}</div>
            </div>
          )}

          <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-primary" />
            <span>Li e concordo com os termos do contrato. Reconheço a validade jurídica desta assinatura digital.</span>
          </label>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 h-10 rounded-md border border-border text-sm font-semibold hover:bg-muted">Cancelar</button>
            <button
              onClick={() => onSign(name)}
              disabled={!name || !agreed}
              className="flex-1 h-10 rounded-md bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold text-sm disabled:opacity-40 shadow-glow"
            >
              Assinar Contrato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
