import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Wallet, TrendingUp, TrendingDown, Plus, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import moment from 'moment';
import { createPageUrl } from '@/utils';

export default function Carteira() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showTopUp, setShowTopUp] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadWalletData();
    }, []);

    useEffect(() => {
        filterTransactions();
    }, [transactions, filter]);

    const loadWalletData = async () => {
        setIsLoading(true);
        try {
            const user = await base44.auth.me();

            let wallets = await base44.entities.Wallet.filter({ created_by: user.email });
            if (wallets.length === 0) {
                const newWallet = await base44.entities.Wallet.create({
                    balance: 0,
                    total_spent: 0,
                    total_received: 0
                });
                wallets = [newWallet];
            }
            setWallet(wallets[0]);

            const allTransactions = await base44.entities.Transaction.filter({ created_by: user.email });
            setTransactions(allTransactions.sort((a, b) =>
                new Date(b.created_date) - new Date(a.created_date)
            ));
        } catch (error) {
            console.error('Error loading wallet:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterTransactions = () => {
        if (filter === 'all') {
            setFilteredTransactions(transactions);
        } else if (filter === 'income') {
            setFilteredTransactions(transactions.filter(t => t.type === 'deposit' || t.type === 'credit'));
        } else {
            setFilteredTransactions(transactions.filter(t => t.type === 'debit' || t.type === 'withdrawal'));
        }
    };

    const handleTopUp = async () => {
        const amount = parseFloat(topUpAmount);
        if (!amount || amount < 10) {
            alert('Valor mínimo de R$ 10,00');
            return;
        }

        setIsProcessing(true);
        try {
            const user = await base44.auth.me();

            await new Promise(resolve => setTimeout(resolve, 2000));

            await base44.entities.Wallet.update(wallet.id, {
                balance: wallet.balance + amount
            });

            await base44.entities.Transaction.create({
                user_id: user.id,
                type: 'deposit',
                amount: amount,
                description: 'Recarga de créditos',
                reference_type: 'topup',
                balance_before: wallet.balance,
                balance_after: wallet.balance + amount,
                status: 'completed'
            });

            await base44.entities.Notification.create({
                recipient_user_id: user.id,
                title: '💰 Créditos Adicionados!',
                message: `R$ ${amount.toFixed(2)} foram adicionados à sua carteira. Novo saldo: R$ ${(wallet.balance + amount).toFixed(2)}`,
                type: 'wallet',
                priority: 'normal',
                reference_type: 'topup',
                action_url: '/Carteira'
            });

            setShowTopUp(false);
            setTopUpAmount('');
            loadWalletData();
        } catch (error) {
            console.error('Error topping up:', error);
            alert('Erro ao adicionar créditos');
        } finally {
            setIsProcessing(false);
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-8 text-white mb-6 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <Wallet className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-amber-100 text-sm">Saldo Disponível</p>
                                <h2 className="text-4xl font-black">R$ {wallet?.balance?.toFixed(2) || '0.00'}</h2>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowTopUp(!showTopUp)}
                            className="bg-white text-amber-600 hover:bg-amber-50 rounded-xl font-semibold"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Adicionar
                        </Button>
                    </div>

                    {showTopUp && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm"
                        >
                            <p className="text-sm mb-3 text-amber-100">Quanto deseja adicionar?</p>
                            <div className="flex gap-3">
                                <Input
                                    type="number"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 rounded-xl"
                                />
                                <Button
                                    onClick={handleTopUp}
                                    disabled={isProcessing}
                                    className="bg-white text-amber-600 hover:bg-amber-50 rounded-xl font-semibold"
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                <Tabs value={filter} onValueChange={setFilter} className="w-full">
                    <TabsList className="w-full bg-white p-1 grid grid-cols-3 mb-6">
                        <TabsTrigger value="all" className="rounded-xl">Todas</TabsTrigger>
                        <TabsTrigger value="income" className="rounded-xl">Entradas</TabsTrigger>
                        <TabsTrigger value="expenses" className="rounded-xl">Saídas</TabsTrigger>
                    </TabsList>

                    <TabsContent value={filter} className="space-y-3">
                        {filteredTransactions.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl">
                                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhuma transação encontrada</p>
                            </div>
                        ) : (
                            filteredTransactions.map((transaction) => (
                                <motion.div
                                    key={transaction.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.type === 'deposit' || transaction.type === 'credit'
                                                    ? 'bg-green-100'
                                                    : 'bg-red-100'
                                                }`}>
                                                {transaction.type === 'deposit' || transaction.type === 'credit' ? (
                                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="w-6 h-6 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{transaction.description}</p>
                                                <p className="text-sm text-gray-500">{moment(transaction.created_date).format('DD/MM/YYYY HH:mm')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-bold ${transaction.type === 'deposit' || transaction.type === 'credit'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                }`}>
                                                {transaction.type === 'deposit' || transaction.type === 'credit' ? '+' : '-'}
                                                R$ {transaction.amount?.toFixed(2)}
                                            </p>
                                            <Badge className={transaction.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                {transaction.status === 'completed' ? 'Concluída' : 'Pendente'}
                                            </Badge>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
