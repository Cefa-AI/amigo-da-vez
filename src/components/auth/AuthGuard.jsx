import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export const AuthGuard = ({ children, role }) => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Em um app real, validaria o token no backend.
                // Aqui validamos se existe sessão no localStorage.
                const user = await base44.auth.me();

                if (user) {
                    setIsAuthenticated(true);
                    setUserRole(user.role); // 'passenger' or 'driver'
                }
            } catch (e) {
                // Not authenticated
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redireciona para login salvando de onde veio
        return <Navigate to="/Login" state={{ from: location }} replace />;
    }

    // Se a rota exige um cargo específico (ex: só motorista) e o usuaário não tem
    if (role && userRole !== role && userRole) {
        // Se tentar acessar área de motorista sendo passageiro, vai pra home
        return <Navigate to="/" replace />;
    }

    return children;
};
