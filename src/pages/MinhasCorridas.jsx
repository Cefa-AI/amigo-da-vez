import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Car, DollarSign, X, Share2, CreditCard, AlertTriangle, Clock, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import LiveTracking from '@/components/tracking/LiveTracking';
import PaymentFlow from '@/components/payment/PaymentFlow';
import { motion } from 'framer-motion';
import moment from 'moment';
import { createPageUrl } from '@/utils';

export default function MinhasCorridas() {
    const [rides, setRides] = useState([]);
    const [filteredRides, setFilteredRides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('active');
    const [selectedRide, setSelectedRide] = useState(null);
    const [showPayment, setShowPayment] = useState(false);

    const statusConfig = {
        pending: { label: 'Aguardando', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
        accepted: { label: 'Aceito', color: 'bg-blue-100 text-blue-700', icon: Car },
        in_progress: { label: 'Em Andamento', color: 'bg-green-100 text-green-700', icon: MapPin },
        completed: { label: 'Concluído', color: 'bg-gray-100 text-gray-700', icon: AlertTriangle },
        cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: X }
    };

    useEffect(() => {
        loadRides();
    }, []);

    useEffect(() => {
        filterRides();
    }, [rides, filter]);

    const loadRides = async () => {
        setIsLoading(true);
        try {
            const user = await base44.auth.me();
            const allRides = await base44.entities.RideRequest.filter({ created_by: user.email });
            setRides(allRides.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        } catch (error) {
            console.error('Error loading rides:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterRides = () => {
        if (filter === 'active') {
            setFilteredRides(rides.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status)));
        } else {
            setFilteredRides(rides.filter(r => ['completed', 'cancelled'].includes(r.status)));
        }
    };

    const handleCancelRide = async (ride) => {
        if (confirm('Deseja realmente cancelar esta corrida?')) {
            try {
                await base44.entities.RideRequest.update(ride.id, { status: 'cancelled' });
                loadRides();
            } catch (error) {
                console.error('Error cancelling ride:', error);
            }
        }
    };

    const handlePayment = (ride) => {
        setSelectedRide(ride);
        setShowPayment(true);
    };

    const RideCard = ({ ride }) => {
        const status = statusConfig[ride.status] || statusConfig.pending;
        const StatusIcon = status.icon;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Car className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{ride.vehicle_model || 'Veículo'}</p>
                            <p className="text-sm text-gray-500">{ride.vehicle_plate}</p>
                        </div>
                    </div>
                    <Badge className={`${status.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                    </Badge>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Origem</p>
                            <p className="text-sm font-medium text-gray-900">{ride.origin_address}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Destino</p>
                            <p className="text-sm font-medium text-gray-900">{ride.destination_address}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-green-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-bold">R$ {ride.offered_price?.toFixed(2)}</span>
                        </div>
                        {ride.is_emergency && (
                            <Badge className="bg-red-100 text-red-700">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Emergência
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-gray-400">
                        {moment(ride.created_date).fromNow()}
                    </p>
                </div>

                {ride.status === 'in_progress' && (
                    <Button
                        onClick={() => setSelectedRide(ride)}
                        className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Ver Rastreamento
                    </Button>
                )}

                {ride.status === 'accepted' && (
                    <Button
                        onClick={() => handlePayment(ride)}
                        className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl"
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar Agora
                    </Button>
                )}

                {ride.status === 'pending' && (
                    <Button
                        onClick={() => handleCancelRide(ride)}
                        variant="outline"
                        className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar Solicitação
                    </Button>
                )}
            </motion.div>
        );
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
                <h1 className="text-3xl font-black text-gray-900 mb-6">Minhas Corridas</h1>

                <Tabs value={filter} onValueChange={setFilter} className="w-full">
                    <TabsList className="w-full bg-white p-1 grid grid-cols-2 mb-6">
                        <TabsTrigger value="active" className="rounded-xl">Ativas</TabsTrigger>
                        <TabsTrigger value="history" className="rounded-xl">Histórico</TabsTrigger>
                    </TabsList>

                    <TabsContent value={filter} className="space-y-4">
                        {filteredRides.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl">
                                <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    {filter === 'active' ? 'Nenhuma corrida ativa' : 'Nenhuma corrida no histórico'}
                                </p>
                            </div>
                        ) : (
                            filteredRides.map((ride) => <RideCard key={ride.id} ride={ride} />)
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <Sheet open={selectedRide && !showPayment} onOpenChange={() => setSelectedRide(null)}>
                <SheetContent onClose={() => setSelectedRide(null)}>
                    {selectedRide && <LiveTracking ride={selectedRide} />}
                </SheetContent>
            </Sheet>

            <Sheet open={showPayment} onOpenChange={setShowPayment}>
                <SheetContent onClose={() => setShowPayment(false)}>
                    {selectedRide && (
                        <PaymentFlow
                            ride={selectedRide}
                            onSuccess={() => {
                                setShowPayment(false);
                                setSelectedRide(null);
                                loadRides();
                            }}
                            onCancel={() => setShowPayment(false)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
