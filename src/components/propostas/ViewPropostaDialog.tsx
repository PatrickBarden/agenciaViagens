import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

interface Proposta {
  id: string;
  valor: number;
  status: string | null;
  created_at: string;
  descricao: string | null;
  clientes: {
    nome: string;
  } | null;
}

interface ViewPropostaDialogProps {
  proposta: Proposta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  enviada: "bg-blue-500/20 text-blue-500",
  aceita: "bg-success/20 text-success",
  analise: "bg-yellow-500/20 text-yellow-500",
  negociacao: "bg-purple-500/20 text-purple-500",
  recusada: "bg-destructive/20 text-destructive",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function ViewPropostaDialog({ proposta, open, onOpenChange }: ViewPropostaDialogProps) {
  if (!proposta) return null;

  const status = proposta.status || "enviada";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Proposta</DialogTitle>
          <DialogDescription>
            Visualizando proposta para {proposta.clientes?.nome || "Cliente não encontrado"}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Cliente</p>
              <p className="font-semibold">{proposta.clientes?.nome}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Valor</p>
              <p className="font-semibold text-primary">{formatCurrency(proposta.valor)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Data de Envio</p>
              <p className="font-semibold">{format(parseISO(proposta.created_at), "dd/MM/yyyy")}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className={statusColors[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Descrição</p>
            <div className="p-4 bg-muted/50 rounded-md text-sm text-foreground whitespace-pre-wrap">
              {proposta.descricao || "Nenhuma descrição fornecida."}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}