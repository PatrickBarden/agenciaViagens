import { Plus, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewUsuarioDialog } from "@/components/usuarios/NewUsuarioDialog";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const usersData = [
  { id: 1, name: "João Silva", email: "joao@barden.com", role: "Administrador", access: "total", status: "ativo" },
  { id: 2, name: "Maria Santos", email: "maria@barden.com", role: "Gerente de Vendas", access: "vendas", status: "ativo" },
  { id: 3, name: "Carlos Oliveira", email: "carlos@barden.com", role: "Desenvolvedor", access: "projetos", status: "ativo" },
  { id: 4, name: "Ana Costa", email: "ana@barden.com", role: "Financeiro", access: "financeiro", status: "ativo" },
  { id: 5, name: "Pedro Alves", email: "pedro@barden.com", role: "Suporte", access: "basico", status: "inativo" },
];

const accessColors: Record<string, string> = {
  total: "bg-primary/20 text-primary",
  vendas: "bg-success/20 text-success",
  projetos: "bg-purple-500/20 text-purple-500",
  financeiro: "bg-yellow-500/20 text-yellow-500",
  basico: "bg-muted text-muted-foreground",
};

const Usuarios = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Usuários e Permissões</h1>
          <p className="text-muted-foreground">Gerencie usuários e controle de acesso</p>
        </div>
        <NewUsuarioDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Total de Usuários</p>
          <p className="text-3xl font-bold text-foreground">{usersData.length}</p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Ativos</p>
          <p className="text-3xl font-bold text-success">
            {usersData.filter(u => u.status === 'ativo').length}
          </p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Administradores</p>
          <p className="text-3xl font-bold text-primary">
            {usersData.filter(u => u.access === 'total').length}
          </p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Novos (30 dias)</p>
          <p className="text-3xl font-bold text-yellow-500">2</p>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge className={accessColors[user.access]}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user.access.charAt(0).toUpperCase() + user.access.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={user.status === 'ativo' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>
                    {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    Gerenciar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Permissions Card */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Níveis de Permissão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card-hover border border-border">
            <h4 className="font-semibold text-primary mb-2">Acesso Total</h4>
            <p className="text-sm text-muted-foreground">Controle completo do sistema</p>
          </div>
          <div className="p-4 rounded-lg bg-card-hover border border-border">
            <h4 className="font-semibold text-success mb-2">Vendas</h4>
            <p className="text-sm text-muted-foreground">Leads, propostas e clientes</p>
          </div>
          <div className="p-4 rounded-lg bg-card-hover border border-border">
            <h4 className="font-semibold text-purple-500 mb-2">Projetos</h4>
            <p className="text-sm text-muted-foreground">Gerenciamento de projetos</p>
          </div>
          <div className="p-4 rounded-lg bg-card-hover border border-border">
            <h4 className="font-semibold text-yellow-500 mb-2">Financeiro</h4>
            <p className="text-sm text-muted-foreground">Controle financeiro</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Usuarios;
