-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'funcionario');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create clientes table
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  origem TEXT,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contato feito', 'proposta enviada', 'fechado')),
  valor_potencial NUMERIC(10, 2),
  criado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create propostas table
CREATE TABLE public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'enviada' CHECK (status IN ('enviada', 'aceita', 'recusada')),
  descricao TEXT,
  criado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create financeiro table
CREATE TABLE public.financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  descricao TEXT NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  data DATE NOT NULL,
  criado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create projetos table
CREATE TABLE public.projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'em andamento', 'finalizado')),
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  responsavel UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email
  );
  
  -- Assign 'funcionario' role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'funcionario');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for clientes
CREATE POLICY "Admin full access to clientes"
  ON public.clientes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own clientes"
  ON public.clientes FOR SELECT
  TO authenticated
  USING (criado_por = auth.uid());

CREATE POLICY "Users can insert their own clientes"
  ON public.clientes FOR INSERT
  TO authenticated
  WITH CHECK (criado_por = auth.uid());

CREATE POLICY "Users can update their own clientes"
  ON public.clientes FOR UPDATE
  TO authenticated
  USING (criado_por = auth.uid());

CREATE POLICY "Users can delete their own clientes"
  ON public.clientes FOR DELETE
  TO authenticated
  USING (criado_por = auth.uid());

-- RLS Policies for propostas
CREATE POLICY "Admin full access to propostas"
  ON public.propostas FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own propostas"
  ON public.propostas FOR SELECT
  TO authenticated
  USING (criado_por = auth.uid());

CREATE POLICY "Users can insert their own propostas"
  ON public.propostas FOR INSERT
  TO authenticated
  WITH CHECK (criado_por = auth.uid());

CREATE POLICY "Users can update their own propostas"
  ON public.propostas FOR UPDATE
  TO authenticated
  USING (criado_por = auth.uid());

CREATE POLICY "Users can delete their own propostas"
  ON public.propostas FOR DELETE
  TO authenticated
  USING (criado_por = auth.uid());

-- RLS Policies for financeiro
CREATE POLICY "Admin full access to financeiro"
  ON public.financeiro FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own financeiro"
  ON public.financeiro FOR SELECT
  TO authenticated
  USING (criado_por = auth.uid());

CREATE POLICY "Users can insert their own financeiro"
  ON public.financeiro FOR INSERT
  TO authenticated
  WITH CHECK (criado_por = auth.uid());

CREATE POLICY "Users can update their own financeiro"
  ON public.financeiro FOR UPDATE
  TO authenticated
  USING (criado_por = auth.uid());

CREATE POLICY "Users can delete their own financeiro"
  ON public.financeiro FOR DELETE
  TO authenticated
  USING (criado_por = auth.uid());

-- RLS Policies for projetos
CREATE POLICY "Admin full access to projetos"
  ON public.projetos FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own projetos"
  ON public.projetos FOR SELECT
  TO authenticated
  USING (responsavel = auth.uid());

CREATE POLICY "Users can insert their own projetos"
  ON public.projetos FOR INSERT
  TO authenticated
  WITH CHECK (responsavel = auth.uid());

CREATE POLICY "Users can update their own projetos"
  ON public.projetos FOR UPDATE
  TO authenticated
  USING (responsavel = auth.uid());

CREATE POLICY "Users can delete their own projetos"
  ON public.projetos FOR DELETE
  TO authenticated
  USING (responsavel = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_clientes_criado_por ON public.clientes(criado_por);
CREATE INDEX idx_propostas_cliente_id ON public.propostas(cliente_id);
CREATE INDEX idx_propostas_criado_por ON public.propostas(criado_por);
CREATE INDEX idx_financeiro_criado_por ON public.financeiro(criado_por);
CREATE INDEX idx_projetos_cliente_id ON public.projetos(cliente_id);
CREATE INDEX idx_projetos_responsavel ON public.projetos(responsavel);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);