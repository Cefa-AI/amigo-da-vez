import React, { useState } from 'react';
import { Filter, MapPin, Star, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export default function AdvancedFilters({ filters, onApply, onReset }) {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Filter className="w-6 h-6 text-amber-500" />
                    Filtros Avançados
                </h3>
            </div>

            <div className="space-y-4">
                <div>
                    <Label className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4" />
                        Cidade
                    </Label>
                    <Input
                        value={localFilters.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="Digite a cidade"
                        className="rounded-xl"
                    />
                </div>

                <div>
                    <Label className="mb-2 block">Distância Máxima: {localFilters.maxDistance} km</Label>
                    <Slider
                        value={[localFilters.maxDistance]}
                        onValueChange={([value]) => handleChange('maxDistance', value)}
                        min={5}
                        max={100}
                        step={5}
                        className="mb-2"
                    />
                </div>

                <div>
                    <Label className="mb-2 block">Categoria CNH</Label>
                    <Select
                        value={localFilters.cnhCategory}
                        onValueChange={(value) => handleChange('cnhCategory', value)}
                    >
                        <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todas</SelectItem>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="AB">AB</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4" />
                        Avaliação Mínima: {localFilters.minRating.toFixed(1)}
                    </Label>
                    <Slider
                        value={[localFilters.minRating]}
                        onValueChange={([value]) => handleChange('minRating', value)}
                        min={0}
                        max={5}
                        step={0.5}
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <Label htmlFor="available">Apenas Disponíveis</Label>
                    <Switch
                        id="available"
                        checked={localFilters.onlyAvailable}
                        onCheckedChange={(checked) => handleChange('onlyAvailable', checked)}
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    onClick={onReset}
                    variant="outline"
                    className="flex-1 rounded-xl"
                >
                    Limpar
                </Button>
                <Button
                    onClick={() => onApply(localFilters)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl"
                >
                    Aplicar
                </Button>
            </div>
        </div>
    );
}
