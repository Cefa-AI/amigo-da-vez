import React, { useState } from 'react';
import { User, Phone, Mail, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function CadastroPassageiro() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);
        try {
            // Check if user already exists (mock check)
            const users = await base44.entities.User.filter({ email: formData.email });
            if (users.length > 0) {
                throw new Error('Email já cadastrado.');
            }

            // Create user
            await base44.entities.User.create({
                full_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password, // In a real app, hash this!
                role: 'passenger'
            });

            // Auto login logic (simulate)
            localStorage.setItem('currentUser', JSON.stringify({
                name: formData.name,
                email: formData.email,
                role: 'passenger'
            }));

            setSuccess(true);
            setTimeout(() => navigate('/BuscarMotorista'), 2000);
        } catch (err) {
            console.error('Erro no cadastro:', err);
            setError(err.message || 'Erro ao cadastrar. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Conta Criada!</h2>
                    <p className="text-gray-600">Bem-vindo ao Amigo da Vez.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                        <User className="w-10 h-10 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Crie sua conta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ou{' '}
                    <Link to="/Login" className="font-medium text-amber-600 hover:text-amber-500">
                        faça login se já tem uma conta
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10">
                    <div className="space-y-6">
                        {error && (
                            <Alert className="bg-red-50 border-red-200">
                                <AlertDescription className="text-red-700">{error}</AlertDescription>
                            </Alert>
                        )}

                        <div>
                            <Label>Nome Completo</Label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="pl-10 rounded-xl"
                                    placeholder="João Silva"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Email</Label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="pl-10 rounded-xl"
                                    placeholder="joao@exemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Celular</Label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                                    className="pl-10 rounded-xl"
                                    placeholder="11999999999"
                                    maxLength={11}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Senha</Label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    className="pl-10 rounded-xl"
                                    placeholder="******"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Confirmar Senha</Label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    className="pl-10 rounded-xl"
                                    placeholder="******"
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full flex justify-center py-6 bg-gradient-to-r from-amber-500 to-orange-500 border border-transparent rounded-xl text-lg font-bold text-white shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-[1.02]"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Criar Conta'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
