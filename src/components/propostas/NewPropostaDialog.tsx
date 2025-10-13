import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export function NewPropostaDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const form = useForm<PropostaFormValues>({
    resolver: zodResolver(propostaSchema),
    defaultValues: {
      cliente_id: "",
      valor: "",
      status: "enviada",
      descricao: "",
    },
  });

  // Carregar clientes quando o dialog abrir
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      await loadClientes();
    }
  };

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

  const onSubmit = async (values: PropostaFormValues) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para criar uma proposta");
        return;
      }

      // Converter valor para número
      const valorNumerico = Number(values.valor.replace(/[^\d,.-]/g, '').replace(',', '.'));

      const { error } = await supabase
        .from("propostas")
        .insert({
          cliente_id: values.cliente_id,
          valor: valorNumerico,
          status: values.status,
          descricao: values.descricao,
          criado_por: user.id,
        });

      if (error) throw error;

      toast.success("Proposta criada com sucesso!");
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Erro ao criar proposta:", error);
      toast.error(error.message || "Erro ao criar proposta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-primary">
          <Plus className="w-4 h-4" />
          Nova Proposta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Nova Proposta Comercial</DialogTitle>
          <DialogDescription>
            Preencha os dados da proposta. Todos os campos são obrigatórios.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Input
                      placeholder="Ex: 35000.00 ou 35000,00"
                      {...field}
                    />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Criar Proposta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}