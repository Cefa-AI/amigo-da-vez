import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, MapPin, Filter, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DriverCard from '@/components/drivers/DriverCard';
import DriverMap from '@/components/drivers/DriverMap';
import AdvancedFilters from '@/components/drivers/AdvancedFilters';
import RideRequestForm from '@/components/rides/RideRequestForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BuscarMotorista() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [filteredDrivers, setFilteredDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [emergencyCountdown, setEmergencyCountdown] = useState(15 * 60); // 15 minutos
    const [filters, setFilters] = useState({
        city: '',
        maxDistance: 50,
        cnhCategory: '',
        minRating: 0,
        onlyAvailable: true
    });

    const isEmergency = searchParams.get('emergency') === 'true';

    // Contagem regressiva para modo emergência
    useEffect(() => {
        if (isEmergency) {
            const timer = setInterval(() => {
                setEmergencyCountdown(prev => {
                    if (prev <= 0) return 0;
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isEmergency]);

    // Varredura mais rápida no modo emergência
    useEffect(() => {
        loadDrivers();
        getUserLocation();

        if (isEmergency) {
            // Atualiza a cada 10 segundos no modo emergência (vs normal que não atualiza)
            const interval = setInterval(loadDrivers, 10000);
            return () => clearInterval(interval);
        }
    }, [isEmergency]);

    useEffect(() => {
        applyFilters();
    }, [drivers, filters, searchQuery]);

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    setUserLocation({ lat: -23.5505, lng: -46.6333 });
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    const loadDrivers = async () => {
        setIsSearching(true);
        try {
            const allDrivers = await base44.entities.Driver.filter({});
            let driversWithDistance = allDrivers;

            if (userLocation) {
                driversWithDistance = allDrivers.map(driver => {
                    // Mock driver location if missing (simulating movement around SP)
                    const lat = driver.lat || -23.5505 + (Math.random() - 0.5) * 0.1;
                    const lng = driver.lng || -46.6333 + (Math.random() - 0.5) * 0.1;

                    return {
                        ...driver,
                        lat,
                        lng,
                        distance: calculateDistance(userLocation.lat, userLocation.lng, lat, lng)
                    };
                });

                // Sort by distance (nearest first)
                driversWithDistance.sort((a, b) => a.distance - b.distance);
            }

            // No modo emergência, prioriza motoristas disponíveis, próximos e bem avaliados
            if (isEmergency) {
                driversWithDistance = driversWithDistance
                    .filter(d => d.is_available)
                    .sort((a, b) => {
                        // Score calculation: Lower distance is better, Higher rating is better
                        // Normalize distance (assuming max 50km relevant): 1 - (dist/50)
                        // Normalize rating: rating/5
                        const distScoreA = Math.max(0, 1 - (a.distance || 0) / 50);
                        const distScoreB = Math.max(0, 1 - (b.distance || 0) / 50);

                        const scoreA = distScoreA * 0.6 + ((a.rating || 0) / 5) * 0.4;
                        const scoreB = distScoreB * 0.6 + ((b.rating || 0) / 5) * 0.4;

                        return scoreB - scoreA;
                    });
            }

            setDrivers(driversWithDistance);
        } catch (error) {
            console.error('Error loading drivers:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...drivers];

        if (filters.onlyAvailable) {
            filtered = filtered.filter(d => d.is_available);
        }

        // Filter by max distance logic
        if (filters.maxDistance && userLocation) {
            filtered = filtered.filter(d => (d.distance || 0) <= filters.maxDistance);
        }

        if (filters.city) {
            filtered = filtered.filter(d =>
                d.city?.toLowerCase().includes(filters.city.toLowerCase())
            );
        }

        if (filters.cnhCategory) {
            filtered = filtered.filter(d => d.cnh_category === filters.cnhCategory);
        }

        if (filters.minRating > 0) {
            filtered = filtered.filter(d => (d.rating || 0) >= filters.minRating);
        }

        if (searchQuery) {
            filtered = filtered.filter(d =>
                d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.city?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredDrivers(filtered);
    };

    const handleSelectDriver = (driver) => {
        setSelectedDriver(driver);
        setShowRequestForm(true);
    };

    const handleSubmitRequest = async (requestData) => {
        setIsSubmitting(true);
        try {
            const user = await base44.auth.me();
            const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            const ride = await base44.entities.RideRequest.create({
                ...requestData,
                status: 'pending',
                share_code: shareCode,
                is_emergency: isEmergency
            });

            const driver = selectedDriver;
            if (driver && driver.created_by) {
                const driverUsers = await base44.entities.User.filter({ email: driver.created_by });
                if (driverUsers.length > 0) {
                    await base44.entities.Notification.create({
                        recipient_user_id: driverUsers[0].id,
                        title: isEmergency ? '🚨 EMERGÊNCIA BLITZ!' : '🚗 Nova Solicitação de Corrida!',
                        message: isEmergency
                            ? `⚠️ URGENTE! ${requestData.requester_name} parou na blitz e precisa de um motorista AGORA! Destino: ${requestData.destination_address}. Valor: R$ ${requestData.offered_price.toFixed(2)} (Lei 13.546/2017)`
                            : `${requestData.requester_name} precisa de um motorista. Destino: ${requestData.destination_address}. Valor: R$ ${requestData.offered_price.toFixed(2)}`,
                        type: 'ride_request',
                        priority: isEmergency ? 'urgent' : 'high',
                        reference_id: ride.id,
                        reference_type: 'ride',
                        action_url: createPageUrl('PainelMotorista')
                    });
                }
            }

            navigate(createPageUrl('MinhasCorridas'));
        } catch (error) {
            console.error('Error creating request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen ${isEmergency ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Emergency Header */}
            <AnimatePresence>
                {isEmergency && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">🚨 Modo Emergência Blitz</h2>
                                        <p className="text-red-200 text-sm">
                                            Lei 13.546/2017 - Motorista em até 15 minutos
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
                                            <Clock className="w-5 h-5" />
                                            <span className="text-2xl font-mono font-bold">
                                                {formatCountdown(emergencyCountdown)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-red-200 mt-1">Tempo restante</p>
                                    </div>

                                    {isSearching && (
                                        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="text-sm">Buscando...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {isEmergency && (
                    <Alert className="mb-6 bg-red-500/10 border-red-500/30">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <AlertDescription className={isEmergency ? 'text-red-200' : 'text-red-700'}>
                            <strong>Valor mínimo de emergência: R$ 100,00</strong> - A tarifa é mais alta devido à urgência e disponibilidade imediata do motorista. A busca é atualizada automaticamente a cada 10 segundos.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar piloto próximo..."
                            className={`pl-10 rounded-xl border-2 ${isEmergency ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : ''}`}
                        />
                    </div>
                    <Button
                        onClick={() => setShowFilters(true)}
                        variant="outline"
                        className={`rounded-xl border-2 ${isEmergency ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : ''}`}
                    >
                        <Filter className="w-5 h-5 mr-2" />
                        Filtros
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        {filteredDrivers.length === 0 ? (
                            <div className={`text-center py-12 rounded-2xl ${isEmergency ? 'bg-gray-800' : 'bg-white'}`}>
                                {isSearching ? (
                                    <>
                                        <Loader2 className="w-16 h-16 text-red-500 mx-auto mb-4 animate-spin" />
                                        <p className={isEmergency ? 'text-gray-400' : 'text-gray-500'}>
                                            Buscando motoristas disponíveis...
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <MapPin className={`w-16 h-16 mx-auto mb-4 ${isEmergency ? 'text-gray-600' : 'text-gray-300'}`} />
                                        <p className={isEmergency ? 'text-gray-400' : 'text-gray-500'}>
                                            Nenhum motorista encontrado
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            filteredDrivers.map((driver) => (
                                <DriverCard
                                    key={driver.id}
                                    driver={driver}
                                    onSelect={() => handleSelectDriver(driver)}
                                    userLocation={userLocation}
                                    isEmergency={isEmergency}
                                />
                            ))
                        )}
                    </div>

                    <div className="lg:sticky lg:top-20 h-[600px]">
                        {userLocation && (
                            <DriverMap
                                drivers={filteredDrivers}
                                userLocation={userLocation}
                                onSelectDriver={handleSelectDriver}
                                searchRadius={isEmergency ? 100 : filters.maxDistance}
                            />
                        )}
                    </div>
                </div>
            </div>

            <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetContent onClose={() => setShowFilters(false)}>
                    <AdvancedFilters
                        filters={filters}
                        onApply={(newFilters) => {
                            setFilters(newFilters);
                            setShowFilters(false);
                        }}
                        onReset={() => {
                            setFilters({
                                city: '',
                                maxDistance: 50,
                                cnhCategory: '',
                                minRating: 0,
                                onlyAvailable: true
                            });
                        }}
                    />
                </SheetContent>
            </Sheet>

            <Sheet open={showRequestForm} onOpenChange={setShowRequestForm}>
                <SheetContent onClose={() => setShowRequestForm(false)}>
                    {selectedDriver && (
                        <RideRequestForm
                            driver={selectedDriver}
                            onSubmit={handleSubmitRequest}
                            onCancel={() => setShowRequestForm(false)}
                            isLoading={isSubmitting}
                            isEmergency={isEmergency}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
