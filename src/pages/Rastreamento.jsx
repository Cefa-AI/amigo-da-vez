import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Navigation, Clock, Phone, Share2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Rastreamento() {
    const [searchParams] = useSearchParams();
    const shareCode = searchParams.get('code');
    const [ride, setRide] = useState(null);
    const [driver, setDriver] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPosition, setCurrentPosition] = useState(null);

    useEffect(() => {
        if (shareCode) {
            loadTrackingData();
            const interval = setInterval(loadTrackingData, 10000);
            return () => clearInterval(interval);
        }
    }, [shareCode]);

    const loadTrackingData = async () => {
        try {
            const rides = await base44.entities.RideRequest.filter({ share_code: shareCode });
            if (rides.length > 0) {
                const rideData = rides[0];
                setRide(rideData);
                setCurrentPosition([
                    rideData.current_latitude || rideData.origin_latitude || -23.5505,
                    rideData.current_longitude || rideData.origin_longitude || -46.6333
                ]);

                if (rideData.driver_id) {
                    const drivers = await base44.entities.Driver.filter({ id: rideData.driver_id });
                    if (drivers.length > 0) {
                        setDriver(drivers[0]);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading tracking data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Código de rastreamento inválido</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6"
                >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-black">Rastreamento em Tempo Real</h1>
                                <p className="text-blue-100">Código: {shareCode}</p>
                            </div>
                            <Badge className="bg-white/20 text-white border-0">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                                Ao Vivo
                            </Badge>
                        </div>
                    </div>

                    <div className="h-[500px] relative">
                        {currentPosition && (
                            <MapContainer
                                center={currentPosition}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap'
                                />
                                <Marker position={currentPosition}>
                                    <Popup>
                                        <div className="text-center p-2">
                                            <p className="font-bold">{ride.vehicle_model}</p>
                                            <p className="text-sm text-gray-500">{ride.vehicle_plate}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        )}
                    </div>

                    <div className="p-6 space-y-4">
                        {driver && (
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-sm text-gray-500 mb-2">Motorista</p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={driver.profile_photo || `https://ui-avatars.com/api/?name=${driver.full_name}&background=f59e0b&color=fff`}
                                        alt={driver.full_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900">{driver.full_name}</p>
                                        <p className="text-sm text-gray-500">{driver.vehicle_model} - {driver.vehicle_plate}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                    <p className="text-sm font-semibold text-green-700">Origem</p>
                                </div>
                                <p className="text-gray-900">{ride.origin_address}</p>
                            </div>

                            <div className="bg-blue-50 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Navigation className="w-5 h-5 text-blue-600" />
                                    <p className="text-sm font-semibold text-blue-700">Destino</p>
                                </div>
                                <p className="text-gray-900">{ride.destination_address}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
