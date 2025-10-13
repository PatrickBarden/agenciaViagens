import { useRef, useState } from "react";
import { Save, Building, Palette, Globe, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Configuracoes = () => {
  const { logoUrl, primaryColor, setLogoUrl, setPrimaryColor } = useSettings();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('settings')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('settings')
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error("Não foi possível obter a URL pública do logo.");
      }

      setLogoUrl(data.publicUrl);
      toast.success("Logo atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro no upload do logo:", error);
      toast.error(error.message || "Ocorreu um erro ao enviar o logo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryColor(event.target.value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações do Sistema</h1>
        <p className="text-muted-foreground">Personalize e configure seu CRM</p>
      </div>

      <Tabs defaultValue="aparencia" className="space-y-6">
        <TabsList className="bg-card">
          <TabsTrigger value="empresa" className="gap-2">
            <Building className="w-4 h-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="gap-2">
            <Palette className="w-4 h-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="gap-2">
            <Globe className="w-4 h-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-6">
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-6">Dados da Empresa</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input id="company-name" defaultValue="Barden Desenvolvimento" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" placeholder="00.000.000/0000-00" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-mail Corporativo</Label>
                <Input id="email" type="email" defaultValue="contato@barden.com" className="mt-1.5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" placeholder="(00) 0000-0000" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="www.barden.com" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Textarea id="address" placeholder="Rua, número, bairro, cidade, estado" className="mt-1.5" />
              </div>
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Salvar Dados
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-6">
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-6">Personalização da Interface</h3>
            <div className="space-y-6">
              <div>
                <Label htmlFor="logo">Logo da Empresa</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-20 h-20 bg-card-hover rounded-lg flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo da Empresa" className="object-contain w-full h-full" />
                    ) : (
                      <span className="text-muted-foreground text-sm">Logo</span>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    className="hidden"
                    accept="image/png, image/jpeg, image/svg+xml"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="gap-2"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isUploading ? "Enviando..." : "Upload de Logo"}
                  </Button>
                </div>
              </div>
              <div>
                <Label>Cor Principal</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative w-10 h-10 rounded-lg border-2 border-border overflow-hidden">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={handleColorChange}
                      className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: primaryColor }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground uppercase">{primaryColor}</span>
                </div>
              </div>
              <div>
                <Label>Tema</Label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-card-hover border-2 border-primary cursor-pointer">
                    <div className="w-full h-20 rounded bg-[#1B1F24] mb-2"></div>
                    <p className="text-sm font-medium">Escuro (Atual)</p>
                  </div>
                  <div className="p-4 rounded-lg bg-card-hover border border-border cursor-pointer opacity-50">
                    <div className="w-full h-20 rounded bg-white mb-2"></div>
                    <p className="text-sm font-medium">Claro (Em breve)</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes" className="space-y-6">
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-6">Integrações Externas</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-card-hover border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">Supabase</h4>
                  <p className="text-sm text-muted-foreground">Banco de dados e autenticação</p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>
              <div className="p-4 rounded-lg bg-card-hover border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">n8n</h4>
                  <p className="text-sm text-muted-foreground">Automação de workflows</p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>
              <div className="p-4 rounded-lg bg-card-hover border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">Stripe</h4>
                  <p className="text-sm text-muted-foreground">Gateway de pagamento</p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>
              <div className="p-4 rounded-lg bg-card-hover border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">E-mail Marketing</h4>
                  <p className="text-sm text-muted-foreground">Envio de campanhas</p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>
            </div>
          </Card>
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4">API Keys</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie suas chaves de API para integração com serviços externos
            </p>
            <Button>Gerenciar API Keys</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;