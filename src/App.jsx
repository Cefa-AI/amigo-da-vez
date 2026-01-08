import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Home as HomeIcon, Car, Wallet, CreditCard, Bell, MapPin, User } from 'lucide-react'

// Pages
import Home from './pages/Home'
import BuscarMotorista from './pages/BuscarMotorista'
import CadastroMotorista from './pages/CadastroMotorista'
import Carteira from './pages/Carteira'
import MetodosPagamento from './pages/MetodosPagamento'
import MinhasCorridas from './pages/MinhasCorridas'
import Notificacoes from './pages/Notificacoes'
import PainelMotorista from './pages/PainelMotorista'
import Rastreamento from './pages/Rastreamento'

// Components
import { NotificationBell } from './components/notifications/NotificationBell'

// Auth Guard
import { AuthGuard } from './components/auth/AuthGuard'
import Login from './pages/Login'
import CadastroPassageiro from './pages/CadastroPassageiro'

function App() {
    const location = useLocation();
    const hideNav = ['/', '/Login', '/CadastroMotorista', '/CadastroPassageiro'];
    const shouldHideNav = hideNav.includes(location.pathname);

    const navItems = [
        { path: '/', icon: HomeIcon, label: 'Início' },
        { path: '/BuscarMotorista', icon: Car, label: 'Buscar' },
        { path: '/MinhasCorridas', icon: MapPin, label: 'Corridas' },
        { path: '/Carteira', icon: Wallet, label: 'Carteira' },
        { path: '/PainelMotorista', icon: User, label: 'Motorista' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            {!shouldHideNav && (
                <header className="bg-white shadow-sm sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-black text-xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                Amigo da Vez
                            </span>
                        </Link>
                        <NotificationBell />
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className={shouldHideNav ? '' : 'pb-20'}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/CadastroPassageiro" element={<CadastroPassageiro />} />
                    <Route path="/CadastroMotorista" element={<CadastroMotorista />} />

                    {/* Rotas Protegidas (Só Passageiro) */}
                    <Route path="/BuscarMotorista" element={
                        <AuthGuard>
                            <BuscarMotorista />
                        </AuthGuard>
                    } />

                    <Route path="/Carteira" element={<Carteira />} />
                    <Route path="/MetodosPagamento" element={<MetodosPagamento />} />
                    <Route path="/MinhasCorridas" element={<MinhasCorridas />} />
                    <Route path="/Notificacoes" element={<Notificacoes />} />
                    <Route path="/PainelMotorista" element={<PainelMotorista />} />
                    <Route path="/Rastreamento" element={<Rastreamento />} />
                </Routes>
            </main>

            {/* Bottom Navigation */}
            {!shouldHideNav && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-around">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex flex-col items-center gap-1 py-3 px-4 transition-colors ${isActive
                                            ? 'text-amber-500'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="text-xs font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>
            )}
        </div>
    )
}

export default App
