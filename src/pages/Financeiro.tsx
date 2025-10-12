import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewMovimentacaoDialog } from "@/components/financeiro/NewMovimentacaoDialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/common/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const financialData = [
  { month: "Jan", entrada: 65000, saida: 32000 },
  { month: "Fev", entrada: 78000, saida: 38000 },
  { month: "Mar", entrada: 72000, saida: 35000 },
  { month: "Abr", entrada: 85000, saida: 42000 },
  { month: "Mai", entrada: 92000, saida: 45000 },
  { month: "Jun", entrada: 105000, saida: 48000 },
];

const transactionsData = [
  { id: 1, description: "Pagamento - Projeto Web", value: "R$ 15.000", type: "entrada", date: "15/01/2025", status: "confirmado" },
  { id: 2, description: "Infraestrutura - Servidores", value: "R$ 3.500", type: "saida", date: "14/01/2025", status: "confirmado" },
  { id: 3, description: "Pagamento - Consultoria", value: "R$ 8.000", type: "entrada", date: "13/01/2025", status: "pendente" },
  { id: 4, description: "Salários - Equipe", value: "R$ 25.000", type: "saida", date: "10/01/2025", status: "confirmado" },
  { id: 5, description: "Pagamento - Sistema CRM", value: "R$ 22.000", type: "entrada", date: "08/01/2025", status: "confirmado" },
];

const Financeiro = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Financeiro</h1>
          <p className="text-muted-foreground">Controle financeiro e fluxo de caixa</p>
        </div>
        <NewMovimentacaoDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Entradas do Mês"
          value="R$ 105.000"
          icon={TrendingUp}
          trend={{ value: "14%", positive: true }}
        />
        <StatsCard
          title="Saídas do Mês"
          value="R$ 48.000"
          icon={TrendingDown}
          trend={{ value: "7%", positive: false }}
        />
        <StatsCard
          title="Lucro Líquido"
          value="R$ 57.000"
          icon={DollarSign}
          trend={{ value: "22%", positive: true }}
        />
        <StatsCard
          title="A Receber"
          value="R$ 8.000"
          icon={Calendar}
        />
      </div>

      {/* Chart */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Fluxo de Caixa</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={financialData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2F38" />
            <XAxis dataKey="month" stroke="#A1A1AA" />
            <YAxis stroke="#A1A1AA" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2328', border: '1px solid #2A2F38', borderRadius: '8px' }}
              labelStyle={{ color: '#F5F5F5' }}
            />
            <Bar dataKey="entrada" fill="#10B981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="saida" fill="#EF4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Transactions */}
      <Card className="shadow-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Movimentações Recentes</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionsData.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell className={transaction.type === 'entrada' ? 'text-success' : 'text-destructive'}>
                  {transaction.value}
                </TableCell>
                <TableCell>
                  <Badge className={transaction.type === 'entrada' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}>
                    {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>
                  <Badge className={transaction.status === 'confirmado' ? 'bg-success/20 text-success' : 'bg-yellow-500/20 text-yellow-500'}>
                    {transaction.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Financeiro;
