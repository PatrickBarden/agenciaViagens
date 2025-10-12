import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Movimentacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida";
  data: string;
  clientes?: {
    nome: string;
  } | null;
}

interface ChartData {
  month: string;
  entrada: number;
  saida: number;
}

const Financeiro = () => {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMovimentacoes();

    const channel = supabase
      .channel('financeiro-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'financeiro' },
        () => {
          toast.info("Atualizando dados financeiros...");
          loadMovimentacoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMovimentacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("financeiro")
        .select("*, clientes(nome)")
        .order("data", { ascending: false });

      if (error) throw error;
      setMovimentacoes(data as any[] || []);
    } catch (error: any) {
      console.error("Erro ao carregar movimentações:", error);
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const currentDate = new Date();
  const startOfCurrentMonth = startOfMonth(currentDate);
  const endOfCurrentMonth = endOfMonth(currentDate);

  const movimentacoesDoMes = movimentacoes.filter(m => {
    const dataMovimentacao = parseISO(m.data);
    return dataMovimentacao >= startOfCurrentMonth && dataMovimentacao <= endOfCurrentMonth;
  });

  const entradasDoMes = movimentacoesDoMes
    .filter(m => m.tipo === 'entrada')
    .reduce((acc, m) => acc + m.valor, 0);

  const saidasDoMes = movimentacoesDoMes
    .filter(m => m.tipo === 'saida')
    .reduce((acc, m) => acc + m.valor, 0);

  const lucroLiquido = entradasDoMes - saidasDoMes;

  const saldoTotal = movimentacoes
    .reduce((acc, m) => acc + (m.tipo === 'entrada' ? m.valor : -m.valor), 0);

  const financialData: ChartData[] = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: format(d, "MMM", { locale: ptBR }),
        entrada: 0,
        saida: 0,
      };
    })
    .reverse();

  movimentacoes.forEach(m => {
    const monthName = format(parseISO(m.data), "MMM", { locale: ptBR });
    const chartEntry = financialData.find(d => d.month.toLowerCase() === monthName.toLowerCase());
    if (chartEntry) {
      if (m.tipo === 'entrada') {
        chartEntry.entrada += m.valor;
      } else {
        chartEntry.saida += m.valor;
      }
    }
  });

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
          value={formatCurrency(entradasDoMes)}
          icon={TrendingUp}
        />
        <StatsCard
          title="Saídas do Mês"
          value={formatCurrency(saidasDoMes)}
          icon={TrendingDown}
        />
        <StatsCard
          title="Lucro Líquido"
          value={formatCurrency(lucroLiquido)}
          icon={DollarSign}
        />
        <StatsCard
          title="Saldo Total"
          value={formatCurrency(saldoTotal)}
          icon={Wallet}
        />
      </div>

      {/* Chart */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Fluxo de Caixa (Últimos 6 meses)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={financialData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2F38" />
            <XAxis dataKey="month" stroke="#A1A1AA" />
            <YAxis stroke="#A1A1AA" tickFormatter={(value) => formatCurrency(value as number)} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2328', border: '1px solid #2A2F38', borderRadius: '8px' }}
              labelStyle={{ color: '#F5F5F5' }}
              formatter={(value) => formatCurrency(value as number)}
            />
            <Bar dataKey="entrada" name="Entradas" fill="#10B981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="saida" name="Saídas" fill="#EF4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Transactions */}
      <Card className="shadow-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Movimentações Recentes</h3>
        </div>
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">Carregando...</div>
        ) : movimentacoes.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">Nenhuma movimentação encontrada.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentacoes.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.descricao}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {transaction.clientes?.nome || "-"}
                  </TableCell>
                  <TableCell className={transaction.tipo === 'entrada' ? 'text-success' : 'text-destructive'}>
                    {formatCurrency(transaction.valor)}
                  </TableCell>
                  <TableCell>
                    <Badge className={transaction.tipo === 'entrada' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}>
                      {transaction.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(parseISO(transaction.data), "dd/MM/yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default Financeiro;