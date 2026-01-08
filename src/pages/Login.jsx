import React, { useState } from 'react';
import { Mail, Lock, LogIn, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async () => {
        if (!formData.email || !formData.password) {
            setError('Preencha email e senha.');
            return;
        }

        setIsLoading(true);
        try {
            // Em um app real, isso seria uma chamada de API segura
            // Aqui vamos simular procurando no banco de dados
            const users = await base44.entities.User.filter({ email: formData.email });
            const user = users.find(u => u.password === formData.password); // Insecure! Mock only.

            // Check if it's a driver
            const drivers = await base44.entities.Driver.filter({ email: formData.email });
            const driver = drivers.length > 0 ? drivers[0] : null;

            if (user) {
                await base44.auth.login(user.email, user.password); // Mock login
                navigate('/BuscarMotorista');
            } else if (driver) {
                // Se for motorista e a senha bater (sem check de senha real aqui pq motorista nao tem senha no cadastro anterior, vamos assumir ok pra demo ou bloquear)
                // Vamos simplificar: se achar o email no driver, loga como driver
                await base44.auth.login(driver.email, 'password');
                navigate('/PainelMotorista');
            } else {
                throw new Error('Usuário ou senha incorretos.');
            }

        } catch (err) {
            setError(err.message || 'Falha no login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Esquerda - Imagem/Decor */}
            <div className="hidden lg:flex lg:w-1/2 bg-amber-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-600 opacity-90" />
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <h1 className="text-5xl font-black mb-6">Sua viagem começa aqui.</h1>
                    <p className="text-xl opacity-90">Conecte-se com os melhores motoristas da sua região com segurança e rapidez.</p>
                </div>
                {/* Decorative Circles */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black opacity-10 rounded-full blur-3xl" />
            </div>

            {/* Direita - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900">Bem-vindo de volta</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Não tem conta?{' '}
                            <Link to="/CadastroPassageiro" className="font-medium text-amber-600 hover:text-amber-500">
                                Cadastre-se gratuitamente
                            </Link>
                        </p>
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <Alert className="bg-red-50 border-red-200">
                                <AlertDescription className="text-red-700">{error}</AlertDescription>
                            </Alert>
                        )}

                        <div>
                            <Label>Email</Label>
                            <div className="mt-1 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10 h-12 rounded-xl"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Senha</Label>
                            <div className="mt-1 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pl-10 h-12 rounded-xl"
                                    placeholder="••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Lembrar
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-amber-600 hover:text-amber-500">
                                    Esqueceu a senha?
                                </a>
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    Entrar <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="mt-10">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Ou continue como</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Link
                                to="/CadastroMotorista"
                                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                Motorista
                            </Link>
                            <Link
                                to="/CadastroPassageiro"
                                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                Passageiro
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
