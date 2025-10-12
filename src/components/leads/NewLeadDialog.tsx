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

const leadSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres." }),
  email: z.string().email({ message: "Email inválido." }).optional().or(z.literal('')),
  telefone: z.string().optional(),
  origem: z.string().optional(),
  valor_potencial: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export function NewLeadDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      origem: "",
      valor_potencial: "",
    },
  });

  const onSubmit = async (values: LeadFormValues) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para criar um lead.");
        return;
      }

      const valorNumerico = values.valor_potencial 
        ? Number(values.valor_potencial.replace(/[^\d,.-]/g, '').replace(',', '.')) 
        : null;

      const { error } = await supabase.from("clientes").insert({
        nome: values.nome,
        email: values.email || null,
        telefone: values.telefone || null,
        origem: values.origem || null,
        valor_potencial: valorNumerico,
        criado_por: user.id,
        status: 'novo',
      });

      if (error) throw error;

      toast.success("Lead cadastrado com sucesso!");
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Erro ao cadastrar lead:", error);
      toast.error(error.message || "Erro ao cadastrar lead.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-primary">
          <Plus className="w-4 h-4" />
          Novo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Lead</DialogTitle>
          <DialogDescription>Preencha as informações do novo lead.</DialogDescription>
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
            <FormField
              control={form.control}
              name="origem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origem</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Cadastrando..." : "Cadastrar Lead"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}