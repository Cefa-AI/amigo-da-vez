import React from 'react';
import { Phone, MapPin, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function DriverCard({ driver, onSelect, userLocation }) {
    const calculateDistance = () => {
        if (!userLocation || !driver.latitude || !driver.longitude) return null;

        const R = 6371;
        const dLat = (driver.latitude - userLocation.lat) * Math.PI / 180;
        const dLon = (driver.longitude - userLocation.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(driver.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    const distance = calculateDistance();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={onSelect}
        >
            <div className="flex items-start gap-4">
                <img
                    src={driver.profile_photo || `https://ui-avatars.com/api/?name=${driver.full_name}&background=f59e0b&color=fff&size=80`}
                    alt={driver.full_name}
                    className="w-16 h-16 rounded-xl object-cover"
                />

                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">{driver.full_name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin className="w-4 h-4" />
                                <span>{driver.city}</span>
                                {distance && <span>• {distance} km</span>}
                            </div>
                        </div>
                        {driver.is_verified && (
                            <Badge className="bg-blue-100 text-blue-700">
                                <Shield className="w-3 h-3 mr-1" />
                                Verificado
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(driver.rating || 0)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
                            {driver.rating?.toFixed(1) || '5.0'} ({driver.total_rides || 0} corridas)
                        </span>
                    </div>

                    {driver.bio && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{driver.bio}</p>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect();
                            }}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl"
                        >
                            Selecionar
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `tel:${driver.phone}`;
                            }}
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Phone className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
