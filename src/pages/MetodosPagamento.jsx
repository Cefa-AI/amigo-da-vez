import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import PaymentMethodCard from '@/components/payment/PaymentMethodCard';
import AddPaymentMethod from '@/components/payment/AddPaymentMethod';
import { motion } from 'framer-motion';

export default function MetodosPagamento() {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddMethod, setShowAddMethod] = useState(false);

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        setIsLoading(true);
        try {
            const user = await base44.auth.me();
            const methods = await base44.entities.PaymentMethod.filter({ created_by: user.email });
            setPaymentMethods(methods);
        } catch (error) {
            console.error('Error loading payment methods:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetDefault = async (method) => {
        try {
            for (const pm of paymentMethods) {
                await base44.entities.PaymentMethod.update(pm.id, { is_default: false });
            }
            await base44.entities.PaymentMethod.update(method.id, { is_default: true });
            loadPaymentMethods();
        } catch (error) {
            console.error('Error setting default:', error);
        }
    };

    const handleDelete = async (method) => {
        if (confirm('Deseja realmente remover este cartão?')) {
            try {
                await base44.entities.PaymentMethod.delete(method.id);
                loadPaymentMethods();
            } catch (error) {
                console.error('Error deleting payment method:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-black text-gray-900">Métodos de Pagamento</h1>
                    <Button
                        onClick={() => setShowAddMethod(true)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Adicionar Cartão
                    </Button>
                </div>

                <div className="space-y-4">
                    {paymentMethods.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-white rounded-3xl"
                        >
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum cartão cadastrado</h3>
                            <p className="text-gray-500 mb-6">Adicione um cartão para facilitar seus pagamentos</p>
                            <Button
                                onClick={() => setShowAddMethod(true)}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Adicionar Primeiro Cartão
                            </Button>
                        </motion.div>
                    ) : (
                        paymentMethods.map((method) => (
                            <PaymentMethodCard
                                key={method.id}
                                method={method}
                                onSetDefault={handleSetDefault}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </div>

            <Sheet open={showAddMethod} onOpenChange={setShowAddMethod}>
                <SheetContent onClose={() => setShowAddMethod(false)}>
                    <AddPaymentMethod
                        onSuccess={() => {
                            setShowAddMethod(false);
                            loadPaymentMethods();
                        }}
                        onCancel={() => setShowAddMethod(false)}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}
