import { useEffect, useState } from "react";
import { Search, Eye, Edit, Copy, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewPropostaDialog } from "@/components/propostas/NewPropostaDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface Proposta {
  id: string;
  valor: number;
  status: string | null;
  created_at: string;
  clientes: {
    nome: string;
  } | null;
}

const statusColors: Record<string, string> = {
  enviada: "bg-blue-500/20 text-blue-500",
  aceita: "bg-success/20 text-success",
  analise: "bg-yellow-500/20 text-yellow-500",
  negociacao: "bg-purple-500/20 text-purple-500",
  recusada: "bg-destructive/20 text-destructive",
};

const Propostas = () => {
  const [proposals, setProposals] = useState<Proposta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadProposals = async () => {
    if (proposals.length === 0) setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("propostas")
        .select(`*, clientes(nome)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar propostas:", error);
      toast.error("Erro ao carregar propostas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();

    const channel = supabase
      .channel('propostas-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'propostas' },
        () => loadProposals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const filteredProposals = proposals.filter(proposal =>
    proposal.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const propostasAprovadas = proposals.filter(p => p.status === 'aceita').length;
  const propostasEmAnalise = proposals.filter(p => p.status === 'analise').length;
  const taxaConversao = proposals.length > 0 ? ((propostasAprovadas / proposals.length) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Propostas e Oportunidades</h1>
          <p className="text-muted-foreground">Gerencie suas propostas comerciais</p>
        </div>
        <NewPropostaDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Total de Propostas</p>
          <p className="text-3xl font-bold text-foreground">{isLoading ? "..." : proposals.length}</p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Aprovadas</p>
          <p className="text-3xl font-bold text-success">
            {isLoading ? "..." : propostasAprovadas}
          </p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Em Análise</p>
          <p className="text-3xl font-bold text-yellow-500">
            {isLoading ? "..." : propostasEmAnalise}
          </p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Taxa de Conversão</p>
          <p className="text-3xl font-bold text-primary">{isLoading ? "..." : `${taxaConversao}%`}</p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Envio</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredProposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma proposta encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredProposals.map((proposal) => {
                const status = proposal.status || "enviada";
                return (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-medium">#{proposal.id.substring(0, 5)}</TableCell>
                    <TableCell>{proposal.clientes?.nome || "Cliente não encontrado"}</TableCell>
                    <TableCell className="font-semibold text-primary">{formatCurrency(proposal.valor)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[status]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(parseISO(proposal.created_at), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Ações
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="w-4 h-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Copy className="w-4 h-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Propostas;