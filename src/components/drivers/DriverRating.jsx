import React from 'react';
import { Star, Award, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DriverRating({ rating = 5, totalRides = 0 }) {
    const getLevel = () => {
        if (totalRides >= 100) return { name: 'Diamante', icon: Trophy, color: 'text-blue-500' };
        if (totalRides >= 50) return { name: 'Ouro', icon: Award, color: 'text-yellow-500' };
        if (totalRides >= 20) return { name: 'Prata', icon: Award, color: 'text-gray-400' };
        return { name: 'Bronze', icon: Award, color: 'text-orange-600' };
    };

    const level = getLevel();
    const LevelIcon = level.icon;

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                    />
                ))}
                <span className="text-sm font-semibold ml-1">{rating.toFixed(1)}</span>
            </div>

            <Badge className={`${level.color} bg-white/20 border-0`}>
                <LevelIcon className="w-3 h-3 mr-1" />
                {level.name}
            </Badge>

            <span className="text-sm text-white/80">{totalRides} corridas</span>
        </div>
    );
}
