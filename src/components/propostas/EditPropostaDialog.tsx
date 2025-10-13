import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Proposta {
  id: string;
  cliente_id: string;
  valor: number;
  status: string | null;
  descricao: string | null;
}

const propostaSchema = z.object({
  cliente_id: z.string().uuid({ message: "Selecione um cliente válido" }),
  valor: z.string()
    .min(1, { message: "Valor é obrigatório" })
    .refine((val) => !isNaN(Number(val.replace(/[^\d,.-]/g, '').replace(',', '.'))), {
      message: "Valor deve ser um número válido"
    })
    .refine((val) => Number(val.replace(/[^\d,.-]/g, '').replace(',', '.')) > 0, {
      message: "Valor deve ser maior que zero"
    }),
  status: z.enum(["enviada", "analise", "negociacao", "aceita", "recusada"], {
    required_error: "Selecione um status",
  }),
  descricao: z.string()
    .min(10, { message: "Descrição deve ter no mínimo 10 caracteres" })
    .max(1000, { message: "Descrição deve ter no máximo 1000 caracteres" }),
});

type PropostaFormValues = z.infer<typeof propostaSchema>;

interface Cliente {
  id: string;
  nome: string;
}

interface EditPropostaDialogProps {
  proposta: Proposta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPropostaDialog({ proposta, open, onOpenChange }: EditPropostaDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const form = useForm<PropostaFormValues>({
    resolver: zodResolver(propostaSchema),
  });

  useEffect(() => {
    const loadClientes = async () => {
      try {
        const { data, error } = await supabase
          .from("clientes")
          .select("id, nome")
          .order("nome");
        if (error) throw error;
        setClientes(data || []);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        toast.error("Erro ao carregar lista de clientes");
      }
    };
    if (open) {
      loadClientes();
    }
  }, [open]);

  useEffect(() => {
    if (proposta) {
      form.reset({
        cliente_id: proposta.cliente_id,
        valor: proposta.valor.toString(),
        status: proposta.status || "enviada",
        descricao: proposta.descricao || "",
      });
    }
  }, [proposta, form, open]);

  const onSubmit = async (values: PropostaFormValues) => {
    setIsLoading(true);
    try {
      const valorNumerico = Number(values.valor.replace(/[^\d,.-]/g, '').replace(',', '.'));

      const { error } = await supabase
        .from("propostas")
        .update({
          cliente_id: values.cliente_id,
          valor: valorNumerico,
          status: values.status,
          descricao: values.descricao,
        })
        .eq("id", proposta.id);

      if (error) throw error;

      toast.success("Proposta atualizada com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar proposta:", error);
      toast.error(error.message || "Erro ao atualizar proposta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Proposta</DialogTitle>
          <DialogDescription>
            Atualize os dados da proposta.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Proposta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 35000.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="enviada">Enviada</SelectItem>
                      <SelectItem value="analise">Em Análise</SelectItem>
                      <SelectItem value="negociacao">Em Negociação</SelectItem>
                      <SelectItem value="aceita">Aceita</SelectItem>
                      <SelectItem value="recusada">Recusada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os detalhes da proposta..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}