import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, Sparkles, Shield, MapPin, AlertTriangle, Clock, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Home() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        drivers: 0,
        rides: 0,
        rating: 4.9
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const drivers = await base44.entities.Driver.filter({});
            const rides = await base44.entities.RideRequest.filter({});
            setStats({
                drivers: drivers.length,
                rides: rides.length,
                rating: 4.9
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const features = [
        {
            icon: Shield,
            title: 'Motoristas Verificados',
            description: 'CNH validada com mais de 2 anos de habilitação',
            color: 'bg-blue-500'
        },
        {
            icon: MapPin,
            title: 'Rastreamento em Tempo Real',
            description: 'Compartilhe a localização com familiares',
            color: 'bg-green-500'
        },
        {
            icon: AlertTriangle,
            title: 'Emergência Blitz',
            description: 'Motorista em até 15 minutos conforme a lei',
            color: 'bg-red-500',
            highlight: true
        },
        {
            icon: Clock,
            title: 'Disponível 24h',
            description: 'Motoristas disponíveis a qualquer hora',
            color: 'bg-purple-500'
        }
    ];

    const handleEmergencyClick = () => {
        navigate('/BuscarMotorista?emergency=true');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Image Overlay */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900" />

                <div className="relative max-w-7xl mx-auto px-4 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-6xl font-black mb-4 text-white">
                            Bebeu? Não dirija!
                        </h1>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 text-orange-400">
                            A gente leva seu carro.
                        </h2>

                        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                            Encontre motoristas verificados para dirigir seu carro até em casa.
                            Segurança para você e sua família.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col items-center gap-4 mb-12">
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Button
                                    onClick={() => navigate('/BuscarMotorista')}
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg rounded-full shadow-xl shadow-orange-500/30 min-w-[200px]"
                                >
                                    <Search className="w-5 h-5 mr-2" />
                                    Solicitar Motorista
                                </Button>

                                <Button
                                    onClick={() => navigate('/CadastroMotorista')}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-6 text-lg rounded-full shadow-xl shadow-green-500/30 min-w-[200px]"
                                >
                                    <Car className="w-5 h-5 mr-2" />
                                    Quero Dirigir
                                </Button>
                            </div>

                            <p className="text-gray-400 text-sm">
                                Já tem conta? <button onClick={() => navigate('/Login')} className="text-orange-400 hover:text-orange-300 font-bold underline">Fazer Login</button>
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-8 md:gap-16">
                            <div className="text-center">
                                <p className="text-3xl md:text-4xl font-black text-white">{stats.drivers}+</p>
                                <p className="text-gray-400 text-sm">Motoristas</p>
                            </div>
                            <div className="w-px h-12 bg-gray-700" />
                            <div className="text-center">
                                <p className="text-3xl md:text-4xl font-black text-white">{stats.rides}+</p>
                                <p className="text-gray-400 text-sm">Corridas</p>
                            </div>
                            <div className="w-px h-12 bg-gray-700" />
                            <div className="text-center">
                                <p className="text-3xl md:text-4xl font-black text-white flex items-center justify-center gap-1">
                                    <span className="text-yellow-400">★</span> {stats.rating}
                                </p>
                                <p className="text-gray-400 text-sm">Avaliação</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border transition-all hover:scale-105 ${feature.highlight
                                    ? 'border-red-500/50 hover:border-red-500'
                                    : 'border-gray-700 hover:border-gray-600'
                                    }`}
                            >
                                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm">{feature.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Emergency Blitz Banner */}
            <div className="max-w-7xl mx-auto px-4 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-7 h-7 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Parou na Blitz?</h3>
                            <p className="text-gray-400">
                                Chame um motorista em até 15 minutos (Lei 13.546/2017)
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleEmergencyClick}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-6 rounded-full font-bold shadow-xl shadow-red-500/30 whitespace-nowrap"
                    >
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Emergência Blitz
                    </Button>
                </motion.div>
            </div>

            {/* App Info Section */}
            <div className="bg-gray-800/50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-white mb-4">Como Funciona</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Em poucos passos você encontra um motorista verificado para levar seu carro com segurança
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Busque Motoristas</h3>
                            <p className="text-gray-400">Encontre motoristas verificados próximos a você</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Solicite a Corrida</h3>
                            <p className="text-gray-400">Informe origem, destino e valor oferecido</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Viaje Tranquilo</h3>
                            <p className="text-gray-400">Acompanhe em tempo real e compartilhe com familiares</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 py-8 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Car className="w-8 h-8 text-orange-500" />
                        <span className="text-2xl font-black text-white">Amigo da Vez</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        © 2026 Amigo da Vez. Todos os direitos reservados.
                    </p>
                    <p className="text-gray-600 text-xs mt-2">
                        Serviço de motorista particular em conformidade com a Lei 13.546/2017
                    </p>
                </div>
            </div>
        </div>
    );
}
