import React from 'react';
import { CreditCard, Trash2, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const CARD_BRANDS = {
    visa: { name: 'Visa', color: 'bg-blue-600', icon: '💳' },
    mastercard: { name: 'Mastercard', color: 'bg-red-600', icon: '💳' },
    elo: { name: 'Elo', color: 'bg-yellow-600', icon: '💳' },
    amex: { name: 'American Express', color: 'bg-blue-800', icon: '💳' },
    hipercard: { name: 'Hipercard', color: 'bg-orange-600', icon: '💳' }
};

export default function PaymentMethodCard({ method, onDelete, onSetDefault }) {
    const brand = CARD_BRANDS[method.card_brand] || CARD_BRANDS.visa;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl p-5 shadow-lg border-2 transition-all ${method.is_default ? 'border-green-400 ring-4 ring-green-100' : 'border-gray-200'
                }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${brand.color} rounded-xl flex items-center justify-center text-2xl`}>
                        {brand.icon}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{brand.name}</p>
                        <p className="text-gray-500 text-sm">•••• {method.card_last4}</p>
                    </div>
                </div>

                {method.is_default && (
                    <Badge className="bg-green-100 text-green-700">
                        <Check className="w-3 h-3 mr-1" />
                        Padrão
                    </Badge>
                )}
            </div>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Titular</p>
                    <p className="font-medium text-gray-900">{method.cardholder_name}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Validade</p>
                    <p className="font-medium text-gray-900">
                        {method.expiry_month}/{method.expiry_year}
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                {!method.is_default && (
                    <Button
                        onClick={() => onSetDefault(method)}
                        variant="outline"
                        className="flex-1 rounded-xl border-2 border-green-200 text-green-700 hover:bg-green-50"
                    >
                        <Star className="w-4 h-4 mr-2" />
                        Tornar Padrão
                    </Button>
                )}
                <Button
                    onClick={() => onDelete(method)}
                    variant="outline"
                    className={`${method.is_default ? 'flex-1' : ''} rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50`}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                </Button>
            </div>
        </motion.div>
    );
}
