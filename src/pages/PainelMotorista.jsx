import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { User, Car, Star, TrendingUp, Clock, MapPin, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import DriverRating from '@/components/drivers/DriverRating';
import { motion } from 'framer-motion';
import moment from 'moment';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function PainelMotorista() {
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDriverData();
    }, []);

    const loadDriverData = async () => {
        setIsLoading(true);
        try {
            const user = await base44.auth.me();
            const drivers = await base44.entities.Driver.filter({ created_by: user.email });

            if (drivers.length === 0) {
                navigate('/CadastroMotorista');
                return;
            }

            setDriver(drivers[0]);
            loadRequests(drivers[0]);
        } catch (error) {
            console.error('Error loading driver:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRequests = async (driverData) => {
        try {
            const allRequests = await base44.entities.RideRequest.filter({});
            const driverRequests = allRequests.filter(r =>
                r.status === 'pending' &&
                (!r.driver_id || r.driver_id === driverData.id)
            );
            setRequests(driverRequests.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    const toggleAvailability = async () => {
        try {
            await base44.entities.Driver.update(driver.id, {
                is_available: !driver.is_available
            });
            loadDriverData();
        } catch (error) {
            console.error('Error toggling availability:', error);
        }
    };

    const acceptRequest = async (request) => {
        try {
            await base44.entities.RideRequest.update(request.id, {
                status: 'accepted',
                driver_id: driver.id
            });

            const requesterUsers = await base44.entities.User.filter({ email: request.created_by });
            if (requesterUsers.length > 0) {
                await base44.entities.Notification.create({
                    recipient_user_id: requesterUsers[0].id,
                    title: '✅ Motorista Aceito!',
                    message: `${driver.full_name} aceitou sua solicitação e está a caminho!`,
                    type: 'ride_status',
                    priority: 'high',
                    reference_id: request.id,
                    reference_type: 'ride',
                    action_url: createPageUrl('MinhasCorridas')
                });
            }

            loadRequests(driver);
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const startRide = async (request) => {
        try {
            await base44.entities.RideRequest.update(request.id, {
                status: 'in_progress'
            });
            loadRequests(driver);
        } catch (error) {
            console.error('Error starting ride:', error);
        }
    };

    const completeRide = async (request) => {
        try {
            await base44.entities.RideRequest.update(request.id, {
                status: 'completed'
            });

            await base44.entities.Driver.update(driver.id, {
                total_rides: (driver.total_rides || 0) + 1
            });

            loadDriverData();
        } catch (error) {
            console.error('Error completing ride:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
        );
    }

    if (!driver) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-8 text-white mb-6 shadow-2xl"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <img
                                src={driver.profile_photo || `https://ui-avatars.com/api/?name=${driver.full_name}&background=fff&color=f59e0b&size=80`}
                                alt={driver.full_name}
                                className="w-20 h-20 rounded-2xl object-cover border-4 border-white"
                            />
                            <div>
                                <h2 className="text-3xl font-black">{driver.full_name}</h2>
                                <p className="text-amber-100">{driver.city} - CNH {driver.cnh_category}</p>
                                <DriverRating rating={driver.rating} totalRides={driver.total_rides} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <Car className="w-6 h-6" />
                            <div>
                                <p className="text-sm text-amber-100">Status</p>
                                <p className="font-bold">{driver.is_available ? 'Disponível' : 'Indisponível'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Label htmlFor="availability" className="text-white">
                                {driver.is_available ? 'Desativar' : 'Ativar'}
                            </Label>
                            <Switch
                                id="availability"
                                checked={driver.is_available}
                                onCheckedChange={toggleAvailability}
                            />
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Car className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Total de Corridas</p>
                                <p className="text-3xl font-black text-gray-900">{driver.total_rides || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Avaliação</p>
                                <p className="text-3xl font-black text-gray-900">{driver.rating?.toFixed(1) || '5.0'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Solicitações</p>
                                <p className="text-3xl font-black text-gray-900">{requests.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4">Solicitações Pendentes</h3>
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl">
                                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhuma solicitação pendente</p>
                            </div>
                        ) : (
                            requests.map((request) => (
                                <motion.div
                                    key={request.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-bold text-xl text-gray-900">{request.requester_name}</h4>
                                            <p className="text-gray-500">{request.requester_phone}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-green-600">R$ {request.offered_price?.toFixed(2)}</p>
                                            {request.is_emergency && (
                                                <Badge className="bg-red-100 text-red-700 mt-2">🚨 Emergência</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-green-600 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Origem</p>
                                                <p className="font-medium text-gray-900">{request.origin_address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Destino</p>
                                                <p className="font-medium text-gray-900">{request.destination_address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => acceptRequest(request)}
                                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl"
                                        >
                                            <Check className="w-5 h-5 mr-2" />
                                            Aceitar
                                        </Button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
