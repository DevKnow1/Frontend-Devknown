import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, BookOpenCheck, Loader2 } from 'lucide-react';
import { authApi } from '@/api/auth.api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ApiError } from '@/types/api';

const loginSchema = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);

  const [serverError, setServerError] = useState<string | null>(null);

  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || '/chat';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await authApi.login(values);
      setSession(response.accessToken, response.user);
      navigate(fromPath, { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          if (field === 'email' || field === 'password') {
            setError(field, { type: 'server', message });
          }
        });
      }
      setServerError(
        apiError.message || 'Credenciales inválidas o error al iniciar sesión.'
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpenCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold">
            Iniciar sesión en DevKnow
          </CardTitle>
          <CardDescription>
            Accede al tutor inteligente sobre documentación técnica
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {serverError}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-email">Correo electrónico</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="desarrollador@empresa.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Contraseña</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ingresar
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Crear cuenta
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}