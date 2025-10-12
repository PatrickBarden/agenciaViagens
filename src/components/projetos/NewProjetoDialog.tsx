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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const projetoSchema = z.object({
  nome: z.string()
    .min(3, { message: "Nome deve ter no mínimo 3 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  cliente_id: z.string().uuid({ message: "Selecione um cliente válido" }),
  status: z.enum(["planejamento", "andamento", "revisao", "concluido", "cancelado"], {
    required_error: "Selecione um status",
  }),
  progresso: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
      message: "Progresso deve ser entre 0 e 100"
    }),
});

type ProjetoFormValues = z.infer<typeof projetoSchema>;

interface Cliente {
  id: string;
  nome: string;
}

export function NewProjetoDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const form = useForm<ProjetoFormValues>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      nome: "",
      cliente_id: "",
      status: "planejamento",
      progresso: "0",
    },
  });

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

  const onSubmit = async (values: ProjetoFormValues) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para criar um projeto");
        return;
      }

      const { error } = await supabase
        .from("projetos")
        .insert({
          nome: values.nome,
          cliente_id: values.cliente_id,
          status: values.status,
          progresso: Number(values.progresso),
          responsavel: user.id,
        });

      if (error) throw error;

      toast.success("Projeto criado com sucesso!");
      form.reset();
      setOpen(false);
      window.location.reload();
    } catch (error: any) {
      console.error("Erro ao criar projeto:", error);
      toast.error(error.message || "Erro ao criar projeto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-primary">
          <Plus className="w-4 h-4" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>
            Crie um novo projeto e vincule a um cliente. Todos os campos são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Sistema CRM Completo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planejamento">Planejamento</SelectItem>
                        <SelectItem value="andamento">Em Andamento</SelectItem>
                        <SelectItem value="revisao">Em Revisão</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progresso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progresso (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {isLoading ? "Salvando..." : "Criar Projeto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
