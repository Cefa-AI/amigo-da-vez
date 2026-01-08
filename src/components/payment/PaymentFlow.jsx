import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
    CreditCard, Wallet, DollarSign, Check,
    Loader2, AlertCircle, ChevronRight, QrCode, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentFlow({ ride, onSuccess, onCancel }) {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [selectedMethod, setSelectedMethod] = useState('wallet');
    const [selectedCard, setSelectedCard] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPaymentData();
    }, []);

    const loadPaymentData = async () => {
        setIsLoading(true);
        try {
            const user = await base44.auth.me();

            // Load wallet
            const wallets = await base44.entities.Wallet.filter({ created_by: user.email });
            if (wallets.length > 0) {
                setWalletBalance(wallets[0].balance || 0);
            }

            // Load payment methods
            const methods = await base44.entities.PaymentMethod.filter({ created_by: user.email });
            setPaymentMethods(methods);

            // Set default card if exists
            const defaultCard = methods.find(m => m.is_default);
            if (defaultCard) {
                setSelectedCard(defaultCard);
            }
        } catch (error) {
            console.error('Error loading payment data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const user = await base44.auth.me();

            if (selectedMethod === 'wallet') {
                // Pay with wallet
                if (walletBalance < ride.offered_price) {
                    alert('Saldo insuficiente na carteira');
                    setIsProcessing(false);
                    return;
                }

                const wallets = await base44.entities.Wallet.filter({ created_by: user.email });
                const wallet = wallets[0];

                await base44.entities.Wallet.update(wallet.id, {
                    balance: wallet.balance - ride.offered_price,
                    total_spent: (wallet.total_spent || 0) + ride.offered_price
                });

                // Create transaction
                await base44.entities.Transaction.create({
                    user_id: user.id,
                    type: 'debit',
                    amount: ride.offered_price,
                    description: `Pagamento de corrida - ${ride.vehicle_plate}`,
                    reference_type: 'ride',
                    reference_id: ride.id,
                    balance_before: wallet.balance,
                    balance_after: wallet.balance - ride.offered_price,
                    status: 'completed'
                });
            } else {
                // Pay with card
                if (!selectedCard) {
                    alert('Selecione um cartão');
                    setIsProcessing(false);
                    return;
                }

                // Simulate card payment processing
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Create transaction
                await base44.entities.Transaction.create({
                    user_id: user.id,
                    type: 'debit',
                    amount: ride.offered_price,
                    description: `Pagamento de corrida - ${ride.vehicle_plate}`,
                    reference_type: 'ride',
                    reference_id: ride.id,
                    payment_method_id: selectedCard.id,
                    status: 'completed'
                });
            }

            // Update ride status
            await base44.entities.RideRequest.update(ride.id, {
                status: 'completed',
                payment_status: 'paid'
            });

            // Notify driver
            if (ride.driver_id) {
                const drivers = await base44.entities.Driver.filter({ id: ride.driver_id });
                if (drivers.length > 0) {
                    const driver = drivers[0];
                    const driverUsers = await base44.entities.User.filter({ email: driver.created_by });
                    if (driverUsers.length > 0) {
                        await base44.entities.Notification.create({
                            recipient_user_id: driverUsers[0].id,
                            title: '💰 Pagamento Recebido!',
                            message: `Você recebeu R$ ${ride.offered_price.toFixed(2)} pela corrida ${ride.vehicle_plate}`,
                            type: 'payment',
                            priority: 'normal',
                            reference_id: ride.id,
                            reference_type: 'ride'
                        });
                    }
                }
            }

            onSuccess();
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Erro ao processar pagamento');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Ride Summary */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-green-100 text-sm">Total a Pagar</p>
                        <h2 className="text-4xl font-black">R$ {ride.offered_price?.toFixed(2)}</h2>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <DollarSign className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <p className="text-xs text-green-100 mb-1">Veículo</p>
                    <p className="font-bold">{ride.vehicle_model} - {ride.vehicle_plate}</p>
                </div>
            </div>

            {/* Payment Methods */}
            <Tabs value={selectedMethod} onValueChange={setSelectedMethod} className="w-full">
                <TabsList className="w-full bg-gray-100 p-1 grid grid-cols-2">
                    <TabsTrigger value="wallet" className="rounded-xl">
                        <Wallet className="w-4 h-4 mr-2" />
                        Carteira
                    </TabsTrigger>
                    <TabsTrigger value="card" className="rounded-xl">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Cartão
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="wallet" className="space-y-4 mt-4">
                    <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-amber-600" />
                                <span className="font-semibold text-amber-900">Saldo Disponível</span>
                            </div>
                            <span className="text-2xl font-bold text-amber-600">
                                R$ {walletBalance.toFixed(2)}
                            </span>
                        </div>

                        {walletBalance < ride.offered_price && (
                            <Alert className="bg-red-50 border-red-200 mt-3">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <AlertDescription className="text-red-700 text-sm">
                                    Saldo insuficiente. Adicione créditos ou use um cartão.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="card" className="space-y-4 mt-4">
                    {paymentMethods.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 mb-4">Nenhum cartão cadastrado</p>
                            <Button
                                variant="outline"
                                className="rounded-xl border-2"
                                onClick={() => window.location.href = '/MetodosPagamento'}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Cartão
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedCard(method)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedCard?.id === method.id
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5 text-gray-600" />
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {method.card_brand.toUpperCase()} •••• {method.card_last4}
                                                </p>
                                                <p className="text-xs text-gray-500">{method.cardholder_name}</p>
                                            </div>
                                        </div>
                                        {selectedCard?.id === method.id && (
                                            <Check className="w-5 h-5 text-green-600" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 rounded-xl border-2"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handlePayment}
                    disabled={
                        isProcessing ||
                        (selectedMethod === 'wallet' && walletBalance < ride.offered_price) ||
                        (selectedMethod === 'card' && !selectedCard)
                    }
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Pagar R$ {ride.offered_price?.toFixed(2)}
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
