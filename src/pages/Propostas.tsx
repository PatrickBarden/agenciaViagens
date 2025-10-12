import { useState } from "react";
import { Search, Eye, Edit, Copy, Trash2 } from "lucide-react";
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

const proposalsData = [
  { id: 1, client: "Tech Solutions Ltda", value: "R$ 35.000", status: "enviada", date: "15/01/2025" },
  { id: 2, client: "Empresa ABC", value: "R$ 52.000", status: "aprovada", date: "12/01/2025" },
  { id: 3, client: "StartupXYZ", value: "R$ 28.000", status: "analise", date: "10/01/2025" },
  { id: 4, client: "Comercio Digital", value: "R$ 45.000", status: "enviada", date: "08/01/2025" },
  { id: 5, client: "Indústria Beta", value: "R$ 67.000", status: "negociacao", date: "05/01/2025" },
  { id: 6, client: "Serviços Alpha", value: "R$ 38.000", status: "recusada", date: "03/01/2025" },
];

const statusColors: Record<string, string> = {
  enviada: "bg-blue-500/20 text-blue-500",
  aprovada: "bg-success/20 text-success",
  analise: "bg-yellow-500/20 text-yellow-500",
  negociacao: "bg-purple-500/20 text-purple-500",
  recusada: "bg-destructive/20 text-destructive",
};

const Propostas = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProposals = proposalsData.filter(proposal =>
    proposal.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-3xl font-bold text-foreground">{proposalsData.length}</p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Aprovadas</p>
          <p className="text-3xl font-bold text-success">
            {proposalsData.filter(p => p.status === 'aprovada').length}
          </p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Em Análise</p>
          <p className="text-3xl font-bold text-yellow-500">
            {proposalsData.filter(p => p.status === 'analise').length}
          </p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Taxa de Conversão</p>
          <p className="text-3xl font-bold text-primary">62%</p>
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
            {filteredProposals.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell className="font-medium">#{proposal.id}</TableCell>
                <TableCell>{proposal.client}</TableCell>
                <TableCell className="font-semibold text-primary">{proposal.value}</TableCell>
                <TableCell>
                  <Badge className={statusColors[proposal.status]}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{proposal.date}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Propostas;
