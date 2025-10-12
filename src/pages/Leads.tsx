import { useState } from "react";
import { Plus, Search, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const leadsData = [
  { id: 1, name: "João Silva", email: "joao@email.com", phone: "(11) 98765-4321", status: "novo", origin: "Site", value: "R$ 15.000" },
  { id: 2, name: "Maria Santos", email: "maria@email.com", phone: "(11) 91234-5678", status: "contato", origin: "Indicação", value: "R$ 25.000" },
  { id: 3, name: "Carlos Oliveira", email: "carlos@email.com", phone: "(21) 99876-5432", status: "proposta", origin: "LinkedIn", value: "R$ 35.000" },
  { id: 4, name: "Ana Costa", email: "ana@email.com", phone: "(11) 98888-7777", status: "negociacao", origin: "Site", value: "R$ 45.000" },
  { id: 5, name: "Pedro Alves", email: "pedro@email.com", phone: "(31) 97777-6666", status: "novo", origin: "Facebook", value: "R$ 18.000" },
];

const statusColors: Record<string, string> = {
  novo: "bg-blue-500/20 text-blue-500",
  contato: "bg-yellow-500/20 text-yellow-500",
  proposta: "bg-purple-500/20 text-purple-500",
  negociacao: "bg-green-500/20 text-green-500",
  fechado: "bg-success/20 text-success",
};

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const filteredLeads = leadsData.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Leads e Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus leads e oportunidades</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-primary">
              <Plus className="w-4 h-4" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Lead</DialogTitle>
              <DialogDescription>Preencha as informações do novo lead</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Digite o nome" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(00) 00000-0000" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="origin">Origem</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Valor Potencial</Label>
                <Input id="value" placeholder="R$ 0,00" className="mt-1.5" />
              </div>
              <Button className="w-full">Cadastrar Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
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
        <Select>
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="p-6 hover-lift shadow-card cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{lead.name}</h3>
                <Badge className={statusColors[lead.status]}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="text-lg font-bold text-primary">{lead.value}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{lead.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{lead.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Origem: {lead.origin}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" className="w-full">Ver Detalhes</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Leads;
