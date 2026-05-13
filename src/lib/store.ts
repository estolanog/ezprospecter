import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Lead, type LeadStatus, seedPipelineLeads } from "./leads-data";

interface LeadsState {
  pipeline: Lead[];
  addLeads: (leads: Lead[]) => void;
  updateStatus: (id: string, status: LeadStatus) => void;
  removeLead: (id: string) => void;
}

export const useLeadsStore = create<LeadsState>()(
  persist(
    (set) => ({
      pipeline: seedPipelineLeads,
      addLeads: (leads) =>
        set((s) => {
          const existing = new Set(s.pipeline.map((l) => l.id));
          const fresh = leads.filter((l) => !existing.has(l.id));
          return { pipeline: [...fresh, ...s.pipeline] };
        }),
      updateStatus: (id, status) =>
        set((s) => ({
          pipeline: s.pipeline.map((l) => (l.id === id ? { ...l, status } : l)),
        })),
      removeLead: (id) => set((s) => ({ pipeline: s.pipeline.filter((l) => l.id !== id) })),
    }),
    { name: "ez-prospecter-leads" }
  )
);

export interface Contract {
  id: string;
  leadName: string;
  service: string;
  value: number;
  status: "rascunho" | "enviado" | "assinado" | "cancelado";
  createdAt: string;
  signedAt?: string;
  signature?: string;
}

interface ContractsState {
  contracts: Contract[];
  addContract: (c: Contract) => void;
  signContract: (id: string, signature: string) => void;
  removeContract: (id: string) => void;
}

const seedContracts: Contract[] = [
  { id: "c1", leadName: "Restaurante Estrela 142", service: "Consultoria de Marketing Digital", value: 2400, status: "assinado", createdAt: "2025-04-12", signedAt: "2025-04-15", signature: "João Silva" },
  { id: "c2", leadName: "Clínica Odonto Premium 88", service: "Gestão de Tráfego Pago", value: 3800, status: "enviado", createdAt: "2025-05-02" },
  { id: "c3", leadName: "Academia Top 312", service: "Pacote Branding Completo", value: 5600, status: "rascunho", createdAt: "2025-05-08" },
];

export const useContractsStore = create<ContractsState>()(
  persist(
    (set) => ({
      contracts: seedContracts,
      addContract: (c) => set((s) => ({ contracts: [c, ...s.contracts] })),
      signContract: (id, signature) =>
        set((s) => ({
          contracts: s.contracts.map((c) =>
            c.id === id ? { ...c, status: "assinado", signedAt: new Date().toISOString(), signature } : c
          ),
        })),
      removeContract: (id) => set((s) => ({ contracts: s.contracts.filter((c) => c.id !== id) })),
    }),
    { name: "ez-prospecter-contracts" }
  )
);
