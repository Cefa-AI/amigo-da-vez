import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Share2, MapPin, Navigation, Clock, Phone, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LiveTracking({ ride }) {
    const [copied, setCopied] = useState(false);
    const [currentPosition, setCurrentPosition] = useState([
        ride.current_latitude || ride.origin_latitude || -23.5505,
        ride.current_longitude || ride.origin_longitude || -46.6333
    ]);

    const shareUrl = `${window.location.origin}/Rastreamento?code=${ride.share_code}`;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Rastreamento em Tempo Real',
                    text: 'Acompanhe minha corrida em tempo real',
                    url: shareUrl
                });
            } catch (error) {
                console.log('Error sharing:', error);
                copyToClipboard();
            }
        } else {
            copyToClipboard();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-bold text-lg">Rastreamento em Tempo Real</h3>
                        <p className="text-blue-100 text-sm">Compartilhe com familiares</p>
                    </div>
                    <Badge className="bg-white/20 text-white border-0">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                        Ao Vivo
                    </Badge>
                </div>

                {/* Share Button */}
                <Button
                    onClick={handleShare}
                    className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Link Copiado!
                        </>
                    ) : (
                        <>
                            <Share2 className="w-4 h-4 mr-2" />
                            Compartilhar Localização
                        </>
                    )}
                </Button>
            </div>

            {/* Map */}
            <div className="h-[300px] relative">
                <MapContainer
                    center={currentPosition}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
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
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Origem</p>
                        <p className="font-medium text-gray-900">{ride.origin_address}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Destino</p>
                        <p className="font-medium text-gray-900">{ride.destination_address}</p>
                    </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                        <p className="text-xs text-amber-700 font-semibold">Tempo Estimado</p>
                        <p className="text-sm text-amber-900">Calculando rota...</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
