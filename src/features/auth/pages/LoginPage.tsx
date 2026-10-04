import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';
import type { LoginRequestDTO } from '../types/auth.types';
import { useLoginMutation, useVerify2FaMutation } from '../hooks/useLoginMutation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Mail, Lock, Eye, EyeOff, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MagicCard } from '@/components/magicui/magic-card';
import { useTheme } from '@/components/theme-provider';

export const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<'LOGIN' | '2FA'>('LOGIN');
    const [pendingEmail, setPendingEmail] = useState('');
    const [code2fa, setCode2fa] = useState('');

    const { mutate: login, isPending: isLoggingIn } = useLoginMutation();
    const { mutate: verify2Fa, isPending: isVerifying } = useVerify2FaMutation();

    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit: SubmitHandler<LoginFormData> = (data) => {
        login(data as LoginRequestDTO, {
            onSuccess: (response) => {
                if (response.twoFactorRequired) {
                    setPendingEmail(response.email);
                    setStep('2FA');
                    toast.info('Se ha enviado un código de 6 dígitos a su correo electrónico.');
                } else {
                    setAuth(response);
                    toast.success(`Bienvenido de nuevo, ${response.username}`);
                    navigate('/dashboard', { replace: true });
                }
            }
        });
    };

    const handleVerify2Fa = (e: React.FormEvent) => {
        e.preventDefault();
        if (code2fa.length !== 6) {
            toast.error('El código debe tener 6 dígitos');
            return;
        }

        verify2Fa({ email: pendingEmail, code: code2fa }, {
            onSuccess: (response) => {
                setAuth(response);
                toast.success(`Bienvenido de nuevo, ${response.username}`);
                navigate('/dashboard', { replace: true });
            }
        });
    };

    return (
        <Card className="w-full max-w-sm mx-auto border-none p-0 shadow-none bg-transparent">
            <MagicCard
                gradientColor={isDark ? "#262626" : "#D9D9D955"}
                className="p-0 border-slate-200/80 bg-white/95 backdrop-blur-sm dark:bg-zinc-950/95 dark:border-zinc-800/80"
            >
                <CardHeader className="space-y-2 text-center pb-6">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-1">
                        {step === 'LOGIN' ? <Lock className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
                    </div>
                <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    SEPISAC
                </CardTitle>
                {step === '2FA' && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Ingrese el código enviado a <br/><span className="font-medium text-slate-700 dark:text-slate-300">{pendingEmail}</span>
                    </p>
                )}
            </CardHeader>
            <CardContent>
                {step === 'LOGIN' ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                                <Input
                                                    placeholder="usuario@empresa.com"
                                                    type="email"
                                                    autoComplete="email"
                                                    className="pl-9 dark:bg-zinc-900/50"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                                <Input
                                                    placeholder="••••••••"
                                                    type={showPassword ? 'text' : 'password'}
                                                    autoComplete="current-password"
                                                    className="pl-9 pr-10 dark:bg-zinc-900/50"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none"
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full mt-2 font-medium" disabled={isLoggingIn}>
                                {isLoggingIn ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </Button>
                        </form>
                    </Form>
                ) : (
                    <form onSubmit={handleVerify2Fa} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-slate-700 dark:text-slate-300 font-semibold text-center block">Código 2FA</label>
                            <Input
                                placeholder="123456"
                                type="text"
                                maxLength={6}
                                value={code2fa}
                                onChange={(e) => setCode2fa(e.target.value.replace(/[^0-9]/g, ''))}
                                className="text-center text-2xl tracking-widest h-14 dark:bg-zinc-900/50"
                                autoFocus
                            />
                        </div>

                        <Button type="submit" className="w-full mt-2 font-medium" disabled={isVerifying || code2fa.length !== 6}>
                            {isVerifying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                'Verificar Código'
                            )}
                        </Button>
                        
                        <Button 
                            type="button" 
                            variant="ghost" 
                            className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" 
                            onClick={() => {
                                setStep('LOGIN');
                                setCode2fa('');
                            }}
                            disabled={isVerifying}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver al login
                        </Button>
                    </form>
                )}
            </CardContent>
            </MagicCard>
        </Card>
    );
};
