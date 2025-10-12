import { DollarSign, Users, FileText, TrendingUp, Target, Briefcase } from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const salesData = [
  { month: "Jan", value: 45000 },
  { month: "Fev", value: 52000 },
  { month: "Mar", value: 48000 },
  { month: "Abr", value: 61000 },
  { month: "Mai", value: 55000 },
  { month: "Jun", value: 67000 },
];

const leadsData = [
  { month: "Jan", leads: 45 },
  { month: "Fev", leads: 52 },
  { month: "Mar", leads: 48 },
  { month: "Abr", leads: 61 },
  { month: "Mai", leads: 55 },
  { month: "Jun", leads: 67 },
];

const recentActivities = [
  { id: 1, title: "Nova proposta enviada", client: "Tech Solutions Ltda", time: "5 min atrás" },
  { id: 2, title: "Lead convertido em cliente", client: "Maria Santos", time: "1 hora atrás" },
  { id: 3, title: "Pagamento recebido", client: "Empresa ABC", time: "2 horas atrás" },
  { id: 4, title: "Novo lead cadastrado", client: "João Silva", time: "3 horas atrás" },
  { id: 5, title: "Reunião agendada", client: "StartupXYZ", time: "4 horas atrás" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Faturamento Mensal"
          value="R$ 67.000"
          icon={DollarSign}
          trend={{ value: "12%", positive: true }}
        />
        <StatsCard
          title="Leads Ativos"
          value="142"
          icon={Users}
          trend={{ value: "8%", positive: true }}
        />
        <StatsCard
          title="Propostas Enviadas"
          value="23"
          icon={FileText}
          trend={{ value: "5%", positive: false }}
        />
        <StatsCard
          title="Taxa de Conversão"
          value="68%"
          icon={TrendingUp}
          trend={{ value: "3%", positive: true }}
        />
        <StatsCard
          title="Meta do Mês"
          value="R$ 80.000"
          icon={Target}
        />
        <StatsCard
          title="Projetos Ativos"
          value="15"
          icon={Briefcase}
          trend={{ value: "2", positive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Faturamento Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F38" />
              <XAxis dataKey="month" stroke="#A1A1AA" />
              <YAxis stroke="#A1A1AA" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2328', border: '1px solid #2A2F38', borderRadius: '8px' }}
                labelStyle={{ color: '#F5F5F5' }}
              />
              <Bar dataKey="value" fill="#1A75FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Leads Chart */}
        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Leads por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leadsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F38" />
              <XAxis dataKey="month" stroke="#A1A1AA" />
              <YAxis stroke="#A1A1AA" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2328', border: '1px solid #2A2F38', borderRadius: '8px' }}
                labelStyle={{ color: '#F5F5F5' }}
              />
              <Line type="monotone" dataKey="leads" stroke="#1A75FF" strokeWidth={3} dot={{ fill: '#1A75FF', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-card-hover transition-colors">
              <div>
                <p className="font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.client}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
