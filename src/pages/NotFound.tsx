import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
      <p className="mb-4 text-2xl font-medium text-foreground">Oops! Página não encontrada</p>
      <p className="mb-8 text-muted-foreground">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link to="/" className="text-primary underline hover:text-primary-hover">
        Voltar para o Dashboard
      </Link>
    </div>
  );
};

export default NotFound;