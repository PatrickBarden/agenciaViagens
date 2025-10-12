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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Lead {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  status: string | null;
  origem: string | null;
  valor_potencial: number | null;
}

const leadSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres." }),
  email: z.string().email({ message: "Email inválido." }).optional().or(z.literal('')),
  telefone: z.string().optional(),
  origem: z.string().optional(),
  status: z.enum(["novo", "analise", "negociacao", "aceita", "recusada"]).optional(),
  valor_potencial: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface EditLeadDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLeadDialog({ lead, open, onOpenChange }: EditLeadDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
  });

  useEffect(() => {
    if (lead) {
      form.reset({
        nome: lead.nome || "",
        email: lead.email || "",
        telefone: lead.telefone || "",
        origem: lead.origem || "",
        status: lead.status || "novo",
        valor_potencial: lead.valor_potencial?.toString() || "",
      });
    }
  }, [lead, form, open]);

  const onSubmit = async (values: LeadFormValues) => {
    setIsLoading(true);
    try {
      const valorNumerico = values.valor_potencial
        ? Number(values.valor_potencial.replace(/[^\d,.-]/g, '').replace(',', '.'))
        : null;

      const { error } = await supabase
        .from("clientes")
        .update({
          nome: values.nome,
          email: values.email || null,
          telefone: values.telefone || null,
          origem: values.origem || null,
          status: values.status || 'novo',
          valor_potencial: valorNumerico,
        })
        .eq("id", lead.id);

      if (error) throw error;

      toast.success("Lead atualizado com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar lead:", error);
      toast.error(error.message || "Erro ao atualizar lead.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
          <DialogDescription>Atualize as informações do lead.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a origem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="site">Site</SelectItem>
                        <SelectItem value="indicacao">Indicação</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="analise">Em Análise</SelectItem>
                        <SelectItem value="negociacao">Em Negociação</SelectItem>
                        <SelectItem value="aceita">Aceito</SelectItem>
                        <SelectItem value="recusada">Recusado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="valor_potencial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Potencial</FormLabel>
                  <FormControl>
                    <Input placeholder="R$ 0,00" {...field} />
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