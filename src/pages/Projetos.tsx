import { useEffect, useState } from "react";
import { Plus, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewProjetoDialog } from "@/components/projetos/NewProjetoDialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  planejamento: "bg-blue-500/20 text-blue-500",
  andamento: "bg-yellow-500/20 text-yellow-500",
  revisao: "bg-purple-500/20 text-purple-500",
  concluido: "bg-success/20 text-success",
  cancelado: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  planejamento: "Planejamento",
  andamento: "Em Andamento",
  revisao: "Em Revisão",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

interface Projeto {
  id: string;
  nome: string;
  status: string;
  progresso: number;
  responsavel: string | null;
  created_at: string;
  cliente_id: string;
  clientes?: {
    nome: string;
  };
  profiles?: {
    name: string;
  };
}

const Projetos = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjetos();

    // Realtime subscription
    const channel = supabase
      .channel('projetos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projetos'
        },
        () => {
          loadProjetos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProjetos = async () => {
    try {
      const { data, error } = await supabase
        .from("projetos")
        .select(`
          *,
          clientes(nome),
          profiles(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjetos(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar projetos:", error);
      toast.error("Erro ao carregar projetos");
    } finally {
      setIsLoading(false);
    }
  };

  const totalProjetos = projetos.length;
  const emAndamento = projetos.filter(p => p.status === 'andamento').length;
  const emRevisao = projetos.filter(p => p.status === 'revisao').length;
  const concluidos = projetos.filter(p => p.status === 'concluido').length;
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Projetos e Serviços</h1>
          <p className="text-muted-foreground">Gerencie seus projetos em andamento</p>
        </div>
        <NewProjetoDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Total de Projetos</p>
          <p className="text-3xl font-bold text-foreground">{isLoading ? "..." : totalProjetos}</p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Em Andamento</p>
          <p className="text-3xl font-bold text-yellow-500">
            {isLoading ? "..." : emAndamento}
          </p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Em Revisão</p>
          <p className="text-3xl font-bold text-purple-500">
            {isLoading ? "..." : emRevisao}
          </p>
        </Card>
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Concluídos</p>
          <p className="text-3xl font-bold text-success">
            {isLoading ? "..." : concluidos}
          </p>
        </Card>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando projetos...</p>
        </div>
      ) : projetos.length === 0 ? (
        <Card className="p-12 text-center shadow-card">
          <p className="text-muted-foreground mb-4">Nenhum projeto cadastrado ainda</p>
          <p className="text-sm text-muted-foreground">Clique em "Novo Projeto" para começar</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projetos.map((projeto) => (
            <Card key={projeto.id} className="p-6 hover-lift shadow-card cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{projeto.nome}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {projeto.clientes?.nome || "Cliente não encontrado"}
                  </p>
                  <Badge className={statusColors[projeto.status] || statusColors.planejamento}>
                    {statusLabels[projeto.status] || projeto.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progresso</span>
                    <span className="text-sm font-semibold text-foreground">{projeto.progresso}%</span>
                  </div>
                  <Progress value={projeto.progresso} className="h-2" />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{projeto.profiles?.name || "Sem responsável"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Criado: {new Date(projeto.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="outline" className="w-full">Ver Detalhes</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projetos;
