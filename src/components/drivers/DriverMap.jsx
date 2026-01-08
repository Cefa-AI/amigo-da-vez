import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function DriverMap({ drivers, userLocation, onSelectDriver, searchRadius }) {
    return (
        <div className="h-full w-full rounded-2xl overflow-hidden shadow-xl">
            <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                />

                <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={searchRadius * 1000}
                    pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.1 }}
                />

                <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>
                        <div className="text-center p-2">
                            <p className="font-bold">Você está aqui</p>
                        </div>
                    </Popup>
                </Marker>

                {drivers.map((driver) => {
                    const lat = driver.latitude || userLocation.lat + (Math.random() - 0.5) * 0.1;
                    const lng = driver.longitude || userLocation.lng + (Math.random() - 0.5) * 0.1;

                    return (
                        <Marker key={driver.id} position={[lat, lng]}>
                            <Popup>
                                <div className="p-2">
                                    <p className="font-bold text-gray-900">{driver.full_name}</p>
                                    <p className="text-sm text-gray-500">{driver.city}</p>
                                    <p className="text-sm text-gray-600 my-2">⭐ {driver.rating?.toFixed(1) || '5.0'}</p>
                                    <Button
                                        onClick={() => onSelectDriver(driver)}
                                        size="sm"
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                                    >
                                        Selecionar
                                    </Button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
