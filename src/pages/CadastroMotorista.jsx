import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { User, FileText, Camera, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUpload from '@/components/ui/FileUpload';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BRAZIL_STATES = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
];

export default function CadastroMotorista() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        cpf: '',
        phone: '',
        email: '',
        birth_date: '',
        city: '',
        state: '',
        neighborhood: '',
        rg_number: '',
        rg_photo: '',
        cnh_number: '',
        cnh_category: '',
        cnh_expiry: '',
        cnh_photo: '',
        profile_photo: '',
        bio: '',
        vehicle_model: '',
        vehicle_plate: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const validateCNH = () => {
        const expiryDate = new Date(formData.cnh_expiry);
        const today = new Date();
        const issueDate = new Date(expiryDate);
        issueDate.setFullYear(issueDate.getFullYear() - 10);

        if (expiryDate < today) {
            setError('CNH vencida. Renove sua CNH antes de se cadastrar.');
            return false;
        }

        if (issueDate > today) {
            setError('Data de validade da CNH inválida.');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateCNH()) return;

        if (formData.cpf.length !== 11) {
            setError('CPF deve ter exatamente 11 dígitos');
            return;
        }
        if (formData.phone.length !== 11) {
            setError('Telefone deve ter exatamente 11 dígitos (DDD + número)');
            return;
        }
        if (!formData.state) {
            setError('Selecione o Estado (UF)');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Iniciando cadastro com dados:', { ...formData, rg_photo: '...', cnh_photo: '...', profile_photo: '...' });

            await base44.entities.Driver.create({
                ...formData,
                is_available: false,
                is_verified: false,
                rating: 5,
                total_rides: 0
            });

            console.log('Cadastro realizado com sucesso!');
            setSuccess(true);
            setTimeout(() => navigate('/PainelMotorista'), 2000);
        } catch (err) {
            console.error('Erro detalhado ao cadastrar:', err);
            setError(`Erro ao cadastrar: ${err.message || 'Tente novamente.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Cadastro Realizado!</h2>
                    <p className="text-gray-600">Redirecionando para o painel...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Cadastro de Motorista</h1>
                    <p className="text-gray-600 mb-8">Preencha seus dados para começar</p>

                    <div className="flex items-center justify-between mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {s}
                                </div>
                                {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-amber-500' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <Alert className="mb-6 bg-red-50 border-red-200">
                            <AlertDescription className="text-red-700">{error}</AlertDescription>
                        </Alert>
                    )}

                    {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <User className="w-6 h-6 text-amber-500" />
                                Dados Pessoais
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label>Nome Completo *</Label>
                                    <Input
                                        value={formData.full_name}
                                        onChange={(e) => handleChange('full_name', e.target.value)}
                                        placeholder="Seu nome completo"
                                        className="rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label>CPF *</Label>
                                    <Input
                                        value={formData.cpf}
                                        onChange={(e) => handleChange('cpf', e.target.value.replace(/\D/g, ''))}
                                        placeholder="00000000000"
                                        maxLength={11}
                                        className="rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label>Telefone *</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                                        placeholder="11999999999"
                                        maxLength={11}
                                        className="rounded-xl"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="seu@email.com"
                                        className="rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label>Data de Nascimento *</Label>
                                    <Input
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => handleChange('birth_date', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label>Cidade *</Label>
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        placeholder="São Paulo"
                                        className="rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label>Estado *</Label>
                                    <Select value={formData.state} onValueChange={(v) => handleChange('state', v)}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="UF" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {BRAZIL_STATES.map((state) => (
                                                <SelectItem key={state.value} value={state.value}>
                                                    {state.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-2">
                                    <Label>Bairro *</Label>
                                    <Input
                                        value={formData.neighborhood}
                                        onChange={(e) => handleChange('neighborhood', e.target.value)}
                                        placeholder="Centro"
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <FileText className="w-6 h-6 text-amber-500" />
                                Documentos
                            </h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>RG *</Label>
                                        <Input
                                            value={formData.rg_number}
                                            onChange={(e) => handleChange('rg_number', e.target.value)}
                                            placeholder="000000000"
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label>Foto do RG *</Label>
                                        <FileUpload
                                            value={formData.rg_photo}
                                            onChange={(url) => handleChange('rg_photo', url)}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>CNH *</Label>
                                        <Input
                                            value={formData.cnh_number}
                                            onChange={(e) => handleChange('cnh_number', e.target.value)}
                                            placeholder="00000000000"
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label>Categoria CNH *</Label>
                                        <Select value={formData.cnh_category} onValueChange={(v) => handleChange('cnh_category', v)}>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">A</SelectItem>
                                                <SelectItem value="B">B</SelectItem>
                                                <SelectItem value="AB">AB</SelectItem>
                                                <SelectItem value="C">C</SelectItem>
                                                <SelectItem value="D">D</SelectItem>
                                                <SelectItem value="E">E</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Validade CNH *</Label>
                                        <Input
                                            type="date"
                                            value={formData.cnh_expiry}
                                            onChange={(e) => handleChange('cnh_expiry', e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label>Foto da CNH *</Label>
                                        <FileUpload
                                            value={formData.cnh_photo}
                                            onChange={(url) => handleChange('cnh_photo', url)}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Camera className="w-6 h-6 text-amber-500" />
                                Perfil
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <Label>Foto de Perfil *</Label>
                                    <FileUpload
                                        value={formData.profile_photo}
                                        onChange={(url) => handleChange('profile_photo', url)}
                                        accept="image/*"
                                    />
                                </div>

                                <div>
                                    <Label>Biografia *</Label>
                                    <Textarea
                                        value={formData.bio}
                                        onChange={(e) => handleChange('bio', e.target.value)}
                                        placeholder="Conte um pouco sobre você..."
                                        className="rounded-xl min-h-[100px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Modelo do Veículo</Label>
                                        <Input
                                            value={formData.vehicle_model}
                                            onChange={(e) => handleChange('vehicle_model', e.target.value)}
                                            placeholder="Honda Civic"
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label>Placa</Label>
                                        <Input
                                            value={formData.vehicle_plate}
                                            onChange={(e) => handleChange('vehicle_plate', e.target.value.toUpperCase())}
                                            placeholder="ABC-1234"
                                            maxLength={8}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="flex gap-4 mt-8">
                        {step > 1 && (
                            <Button
                                onClick={() => setStep(step - 1)}
                                variant="outline"
                                className="flex-1 rounded-xl"
                            >
                                Voltar
                            </Button>
                        )}

                        {step < 3 ? (
                            <Button
                                onClick={() => setStep(step + 1)}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl"
                            >
                                Próximo
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Cadastro'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
