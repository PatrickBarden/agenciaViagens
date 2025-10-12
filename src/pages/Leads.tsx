import { useEffect, useState } from "react";
import { Search, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewLeadDialog } from "@/components/leads/NewLeadDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Lead {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  status: string | null;
  origem: string | null;
  valor_potencial: number | null;
}

const statusColors: Record<string, string> = {
  novo: "bg-blue-500/20 text-blue-500",
  contato: "bg-yellow-500/20 text-yellow-500",
  proposta: "bg-purple-500/20 text-purple-500",
  negociacao: "bg-green-500/20 text-green-500",
  fechado: "bg-success/20 text-success",
};

const statusLabels: Record<string, string> = {
  novo: "Novo",
  contato: "Contato Feito",
  proposta: "Proposta Enviada",
  negociacao: "Em Negociação",
  fechado: "Fechado",
};

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadLeads = async () => {
    try {
      let query = supabase.from("clientes").select("*");

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();

    const channel = supabase
      .channel('clientes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes' },
        () => loadLeads()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter]);

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Leads e Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus leads e oportunidades</p>
        </div>
        <NewLeadDialog />
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="contato">Contato Feito</SelectItem>
            <SelectItem value="proposta">Proposta Enviada</SelectItem>
            <SelectItem value="negociacao">Em Negociação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card className="p-12 text-center shadow-card">
          <p className="text-muted-foreground mb-4">Nenhum lead encontrado</p>
          <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou adicione um novo lead</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => {
            const status = lead.status || 'novo';
            return (
              <Card key={lead.id} className="p-6 hover-lift shadow-card cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{lead.nome}</h3>
                    <Badge className={statusColors[status]}>
                      {statusLabels[status] || status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(lead.valor_potencial)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{lead.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{lead.telefone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Origem: {lead.origem || "N/A"}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" className="w-full">Ver Detalhes</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leads;