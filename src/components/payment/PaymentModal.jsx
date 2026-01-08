import React, { useState, useEffect } from 'react';
import { Copy, Check, QrCode, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentModal({ amount, onConfirm, onCancel }) {
    const [step, setStep] = useState('method'); // method, pix, card, processing, success
    const [pixKey] = useState('00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Amigo da Vez6008Sao Paulo62070503***6304E2CA');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (step === 'processing') {
            const timer = setTimeout(() => {
                setStep('success');
            }, 3000);
            return () => clearTimeout(timer);
        }
        if (step === 'success') {
            const timer = setTimeout(() => {
                onConfirm();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [step, onConfirm]);

    const handleCopyPix = () => {
        navigator.clipboard.writeText(pixKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        // Simulate payment detection after copy in demo
        setTimeout(() => setStep('processing'), 4000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white text-center">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-90" />
                    <h2 className="text-xl font-bold">Garantia Anti-Calote</h2>
                    <p className="text-emerald-100 text-sm">
                        Seu pagamento fica seguro com a gente e só é liberado ao piloto no final da corrida.
                    </p>
                </div>

                <div className="p-6">
                    <div className="text-center mb-6">
                        <span className="text-gray-500">Valor Total</span>
                        <div className="text-4xl font-black text-gray-900">
                            R$ {amount.toFixed(2)}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'method' && (
                            <motion.div
                                key="method"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-3"
                            >
                                <Button
                                    onClick={() => setStep('pix')}
                                    className="w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border-2 border-emerald-500 rounded-xl flex items-center justify-between px-6 group"
                                >
                                    <span className="flex items-center gap-3 font-bold">
                                        <QrCode className="w-6 h-6 text-emerald-500" />
                                        Pagar com Pix
                                    </span>
                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                        Liberação Imediata
                                    </span>
                                </Button>

                                <Button
                                    onClick={() => setStep('card')}
                                    variant="outline"
                                    className="w-full h-16 rounded-xl flex items-center justify-between px-6"
                                >
                                    <span className="flex items-center gap-3 font-semibold text-gray-600">
                                        <CreditCard className="w-6 h-6" />
                                        Cartão de Crédito
                                    </span>
                                </Button>

                                <Button
                                    onClick={onCancel}
                                    variant="ghost"
                                    className="w-full text-red-500 hover:text-red-700 mt-4"
                                >
                                    Cancelar Solicitação
                                </Button>
                            </motion.div>
                        )}

                        {step === 'pix' && (
                            <motion.div
                                key="pix"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-center space-y-6"
                            >
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 inline-block">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pixKey}`}
                                        alt="QR Code Pix"
                                        className="w-48 h-48 mix-blend-multiply"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Ou copie e cole o código abaixo:</p>
                                    <div className="flex gap-2">
                                        <input
                                            value={pixKey}
                                            readOnly
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs text-gray-500 font-mono truncate"
                                        />
                                        <Button size="icon" onClick={handleCopyPix} className="bg-emerald-500 hover:bg-emerald-600">
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg flex items-center gap-2 text-left">
                                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                    Aguardando confirmação do banco...
                                </div>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8"
                            >
                                <Loader2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-spin" />
                                <h3 className="text-xl font-bold text-gray-900">Processando...</h3>
                                <p className="text-gray-500">Validando pagamento com o banco</p>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-black text-emerald-600 mb-2">Pagamento Confirmado!</h3>
                                <p className="text-gray-500">O valor está seguro com a gente.<br />Buscando motorista...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
