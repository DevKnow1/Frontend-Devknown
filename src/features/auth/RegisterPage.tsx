import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'El nombre completo debe tener al menos 2 caracteres')
      .max(120, 'El nombre no puede superar los 120 caracteres'),
    email: z.string().trim().email('Ingresa un correo electrónico válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(100, 'La contraseña es demasiado larga'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await authApi.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });
      // El registro devuelve solo el usuario (sin token): se inicia sesión a continuación.
      const session = await authApi.login({
        email: values.email,
        password: values.password,
      });
      setSession(session.accessToken, session.user);
      navigate('/chat', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          if (
            field === 'fullName' ||
            field === 'email' ||
            field === 'password'
          ) {
            setError(field, { type: 'server', message });
          }
        });
      }
      setServerError(
        apiError.message || 'No se pudo completar el registro.'
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
          <CardTitle className="text-xl font-bold">Crear cuenta</CardTitle>
          <CardDescription>
            Regístrate para consultar la documentación técnica en DevKnow
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
              <Label htmlFor="reg-fullname">Nombre completo</Label>
              <Input
                id="reg-fullname"
                type="text"
                autoComplete="name"
                placeholder="Ana Pérez"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Correo electrónico</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="ana.perez@empresa.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Contraseña</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
              <Input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Registrarse
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}