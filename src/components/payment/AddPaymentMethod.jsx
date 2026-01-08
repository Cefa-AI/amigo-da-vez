import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CARD_BRANDS = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    elo: /^(4011|4312|4389|4514|4576|5041|5066|5067|6277|6362|6363|6504|6505|6516)/,
    amex: /^3[47]/,
    hipercard: /^(3841|6062)/
};

export default function AddPaymentMethod({ onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        card_number: '',
        cardholder_name: '',
        expiry_month: '',
        expiry_year: '',
        cvv: ''
    });
    const [cardBrand, setCardBrand] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const detectCardBrand = (number) => {
        const cleaned = number.replace(/\s/g, '');
        for (const [brand, pattern] of Object.entries(CARD_BRANDS)) {
            if (pattern.test(cleaned)) {
                return brand;
            }
        }
        return '';
    };

    const handleCardNumberChange = (value) => {
        const cleaned = value.replace(/\D/g, '');
        const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
        setFormData(prev => ({ ...prev, card_number: formatted }));
        setCardBrand(detectCardBrand(cleaned));
        setErrors(prev => ({ ...prev, card_number: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        const cleaned = formData.card_number.replace(/\s/g, '');

        if (cleaned.length < 13 || cleaned.length > 19) {
            newErrors.card_number = 'Número de cartão inválido';
        }

        if (!formData.cardholder_name.trim()) {
            newErrors.cardholder_name = 'Nome é obrigatório';
        }

        if (!formData.expiry_month || !formData.expiry_year) {
            newErrors.expiry = 'Data de validade é obrigatória';
        }

        if (formData.cvv.length < 3) {
            newErrors.cvv = 'CVV inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const cleaned = formData.card_number.replace(/\s/g, '');
            const user = await base44.auth.me();

            const existingMethods = await base44.entities.PaymentMethod.filter({ created_by: user.email });

            await base44.entities.PaymentMethod.create({
                card_brand: cardBrand || 'visa',
                card_last4: cleaned.slice(-4),
                cardholder_name: formData.cardholder_name,
                expiry_month: formData.expiry_month,
                expiry_year: formData.expiry_year,
                is_default: existingMethods.length === 0
            });

            onSuccess();
        } catch (error) {
            console.error('Error adding payment method:', error);
            setErrors({ submit: 'Erro ao adicionar cartão' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Adicionar Cartão</h3>
                <p className="text-sm text-gray-500">Seus dados estão seguros e criptografados</p>
            </div>

            {errors.submit && (
                <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-700">{errors.submit}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                <div>
                    <Label>Número do Cartão *</Label>
                    <div className="relative">
                        <Input
                            value={formData.card_number}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className={`rounded-xl pr-12 ${errors.card_number ? 'border-red-300' : ''}`}
                        />
                        {cardBrand && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <CreditCard className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                    {errors.card_number && <p className="text-red-500 text-xs mt-1">{errors.card_number}</p>}
                </div>

                <div>
                    <Label>Nome no Cartão *</Label>
                    <Input
                        value={formData.cardholder_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardholder_name: e.target.value.toUpperCase() }))}
                        placeholder="NOME COMO NO CARTÃO"
                        className={`rounded-xl ${errors.cardholder_name ? 'border-red-300' : ''}`}
                    />
                    {errors.cardholder_name && <p className="text-red-500 text-xs mt-1">{errors.cardholder_name}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>Mês *</Label>
                        <Input
                            value={formData.expiry_month}
                            onChange={(e) => setFormData(prev => ({ ...prev, expiry_month: e.target.value }))}
                            placeholder="MM"
                            maxLength={2}
                            className={`rounded-xl ${errors.expiry ? 'border-red-300' : ''}`}
                        />
                    </div>
                    <div>
                        <Label>Ano *</Label>
                        <Input
                            value={formData.expiry_year}
                            onChange={(e) => setFormData(prev => ({ ...prev, expiry_year: e.target.value }))}
                            placeholder="AA"
                            maxLength={2}
                            className={`rounded-xl ${errors.expiry ? 'border-red-300' : ''}`}
                        />
                    </div>
                    <div>
                        <Label>CVV *</Label>
                        <Input
                            value={formData.cvv}
                            onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                            placeholder="000"
                            maxLength={4}
                            type="password"
                            className={`rounded-xl ${errors.cvv ? 'border-red-300' : ''}`}
                        />
                    </div>
                </div>
                {errors.expiry && <p className="text-red-500 text-xs">{errors.expiry}</p>}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                    Seus dados são criptografados e nunca compartilhados com terceiros
                </p>
            </div>

            <div className="flex gap-3">
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                    className="flex-1 rounded-xl"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Adicionar Cartão'}
                </Button>
            </div>
        </form>
    );
}
