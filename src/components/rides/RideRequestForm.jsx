import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Navigation, Car, DollarSign, Clock, AlertTriangle, User, Phone, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentModal from '@/components/payment/PaymentModal';

export default function RideRequestForm({ driver, onSubmit, onCancel, isLoading, isEmergency = false }) {
    // Valor mínimo: R$ 100 para emergência, R$ 50 para normal
    const minPrice = isEmergency ? 100 : 50;
    const recommendedPrice = isEmergency ? 150 : 80;

    const [showPayment, setShowPayment] = useState(false);

    const [formData, setFormData] = useState({
        requester_name: '',
        requester_phone: '',
        origin_address: '',
        destination_address: '',
        vehicle_model: '',
        vehicle_plate: '',
        offered_price: recommendedPrice,
        notes: '',
        is_emergency: isEmergency
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await base44.auth.me();
            setFormData(prev => ({
                ...prev,
                requester_name: user.name || '',
                requester_phone: user.phone || ''
            }));
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.requester_name.trim()) {
            newErrors.requester_name = 'Nome é obrigatório';
        }

        if (!formData.requester_phone.trim()) {
            newErrors.requester_phone = 'Telefone é obrigatório';
        }

        if (!formData.origin_address.trim()) {
            newErrors.origin_address = 'Endereço de origem é obrigatório';
        }

        if (!formData.destination_address.trim()) {
            newErrors.destination_address = 'Endereço de destino é obrigatório';
        }

        if (!formData.vehicle_model.trim()) {
            newErrors.vehicle_model = 'Modelo do veículo é obrigatório';
        }

        if (!formData.vehicle_plate.trim()) {
            newErrors.vehicle_plate = 'Placa do veículo é obrigatória';
        }

        if (formData.offered_price < minPrice) {
            newErrors.offered_price = `Valor mínimo de R$ ${minPrice},00${isEmergency ? ' para emergência' : ''}`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setShowPayment(true);
    };

    const handlePaymentConfirm = () => {
        setShowPayment(false);
        onSubmit({
            ...formData,
            driver_id: driver.id,
            is_emergency: isEmergency,
            payment_status: 'paid_escrow',
            security_code: Math.floor(1000 + Math.random() * 9000).toString()
        });
    };

    return (
        <>
            <AnimatePresence>
                {showPayment && (
                    <PaymentModal
                        amount={formData.offered_price}
                        onConfirm={handlePaymentConfirm}
                        onCancel={() => setShowPayment(false)}
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Driver Info - User Requested Format */}
                <div className={`rounded-2xl p-5 text-white shadow-lg ${isEmergency
                    ? 'bg-gradient-to-r from-red-600 to-red-700'
                    : 'bg-white border text-gray-900'
                    }`}>
                    <div className="flex items-start gap-4">
                        <img
                            src={driver.profile_photo || `https://ui-avatars.com/api/?name=${driver.full_name}&background=${isEmergency ? 'fff' : 'f59e0b'}&color=${isEmergency ? 'dc2626' : 'fff'}&size=100`}
                            alt={driver.full_name}
                            className={`w-20 h-20 rounded-full object-cover border-4 ${isEmergency ? 'border-red-500' : 'border-amber-100'}`}
                        />
                        <div className="flex-1">
                            <h3 className={`font-bold text-2xl ${isEmergency ? 'text-white' : 'text-gray-900'}`}>
                                {driver.full_name} <span className={`text-lg font-normal ${isEmergency ? 'text-red-100' : 'text-gray-500'}`}>- {calculateAge(driver.birth_date)} anos</span>
                            </h3>

                            <div className={`mt-2 flex flex-col gap-1 text-sm ${isEmergency ? 'text-red-100' : 'text-gray-600'}`}>
                                <p className="flex items-center gap-2">
                                    <span className={`font-bold px-2 py-0.5 rounded ${isEmergency ? 'bg-red-800' : 'bg-gray-100'}`}>CNH {driver.cnh_category}</span>
                                    <span>validade até {formatDate(driver.cnh_expiry)}</span>
                                </p>
                                <p className="flex items-center gap-1 opacity-90">
                                    {driver.city} • <span className="text-yellow-500">★ {driver.rating}</span> ({driver.total_rides} corridas)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat / Message Section */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <Label className="text-blue-900 font-bold mb-2 block">💬 Mensagem para o Piloto</Label>
                    <div className="relative">
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Olá, preciso de um piloto para o meu carro..."
                            className="rounded-xl border-blue-200 min-h-[80px] pr-10 bg-white"
                        />
                        <div className="absolute right-3 bottom-3 text-blue-400">
                            <Navigation className="w-5 h-5 rotate-90" />
                        </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                        * O chat completo será aberto após o envio da proposta.
                    </p>
                </div>

                {isEmergency && (
                    <Alert className="bg-red-50 border-red-200">
                        <Zap className="w-4 h-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                            <strong>🚨 Modo Emergência Blitz (Lei 13.546/2017)</strong><br />
                            <span className="text-sm">
                                Valor mínimo: <strong>R$ {minPrice},00</strong> - Tarifa mais alta devido à urgência.
                                Sua solicitação terá prioridade máxima e o motorista será notificado imediatamente.
                            </span>
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Seus Dados
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome Completo *</Label>
                                <Input
                                    value={formData.requester_name}
                                    onChange={(e) => handleChange('requester_name', e.target.value)}
                                    placeholder="Seu nome"
                                    className={`rounded-xl border-2 ${errors.requester_name ? 'border-red-300' : 'border-gray-200'}`}
                                />
                                {errors.requester_name && (
                                    <p className="text-red-500 text-xs">{errors.requester_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Telefone *</Label>
                                <Input
                                    value={formData.requester_phone}
                                    onChange={(e) => handleChange('requester_phone', e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className={`rounded-xl border-2 ${errors.requester_phone ? 'border-red-300' : 'border-gray-200'}`}
                                />
                                {errors.requester_phone && (
                                    <p className="text-red-500 text-xs">{errors.requester_phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Route Info */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-green-500" />
                            Trajeto
                        </h4>

                        <div className="space-y-2">
                            <Label>Endereço de Origem *</Label>
                            <Input
                                value={formData.origin_address}
                                onChange={(e) => handleChange('origin_address', e.target.value)}
                                placeholder={isEmergency ? "Onde você está parado na blitz?" : "De onde você está saindo?"}
                                className={`rounded-xl border-2 ${errors.origin_address ? 'border-red-300' : 'border-gray-200'}`}
                            />
                            {errors.origin_address && (
                                <p className="text-red-500 text-xs">{errors.origin_address}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Endereço de Destino *</Label>
                            <Input
                                value={formData.destination_address}
                                onChange={(e) => handleChange('destination_address', e.target.value)}
                                placeholder="Para onde você vai?"
                                className={`rounded-xl border-2 ${errors.destination_address ? 'border-red-300' : 'border-gray-200'}`}
                            />
                            {errors.destination_address && (
                                <p className="text-red-500 text-xs">{errors.destination_address}</p>
                            )}
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <Car className="w-5 h-5 text-purple-500" />
                            Seu Veículo (Para o piloto dirigir)
                        </h4>

                        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-2 border border-blue-100">
                            O motorista parceiro irá até você para dirigir <strong>este veículo</strong>. Certifique-se que o documento e seguro estão em dia.
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Modelo *</Label>
                                <Input
                                    value={formData.vehicle_model}
                                    onChange={(e) => handleChange('vehicle_model', e.target.value)}
                                    placeholder="Ex: Honda Civic"
                                    className={`rounded-xl border-2 ${errors.vehicle_model ? 'border-red-300' : 'border-gray-200'}`}
                                />
                                {errors.vehicle_model && (
                                    <p className="text-red-500 text-xs">{errors.vehicle_model}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Placa *</Label>
                                <Input
                                    value={formData.vehicle_plate}
                                    onChange={(e) => handleChange('vehicle_plate', e.target.value.toUpperCase())}
                                    placeholder="ABC-1234"
                                    className={`rounded-xl border-2 ${errors.vehicle_plate ? 'border-red-300' : 'border-gray-200'}`}
                                    maxLength={8}
                                />
                                {errors.vehicle_plate && (
                                    <p className="text-red-500 text-xs">{errors.vehicle_plate}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            Valor Oferecido
                            {isEmergency && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                    +50% emergência
                                </span>
                            )}
                        </h4>

                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                    <Input
                                        type="number"
                                        value={formData.offered_price}
                                        onChange={(e) => handleChange('offered_price', parseFloat(e.target.value) || 0)}
                                        min={minPrice}
                                        step="10"
                                        className={`pl-10 rounded-xl border-2 text-2xl font-bold ${isEmergency ? 'text-red-600' : 'text-green-600'
                                            } ${errors.offered_price ? 'border-red-300' : 'border-gray-200'}`}
                                    />
                                </div>
                            </div>
                            {errors.offered_price && (
                                <p className="text-red-500 text-xs">{errors.offered_price}</p>
                            )}
                            <div className={`text-xs ${isEmergency ? 'text-red-600' : 'text-gray-500'}`}>
                                {isEmergency ? (
                                    <>
                                        <strong>Valor mínimo emergência: R$ {minPrice},00</strong>
                                        <br />
                                        Recomendado: R$ {recommendedPrice},00 para maior aceitação
                                    </>
                                ) : (
                                    `Valor mínimo: R$ ${minPrice},00`
                                )}
                            </div>
                        </div>
                    </div>



                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 rounded-xl border-2"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 text-white rounded-xl font-semibold ${isEmergency
                                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                                }`}
                        >
                            {isLoading ? 'Enviando...' : (isEmergency ? '🚨 Enviar Urgente' : 'Solicitar Piloto')}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </>
    );
}
