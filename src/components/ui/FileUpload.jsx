import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FileUpload({ value, onChange, accept = 'image/*' }) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState(value || '');

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await base44.integrations.Core.UploadFile(file);
            setPreview(result.url);
            onChange(result.url);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Erro ao fazer upload do arquivo');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClear = () => {
        setPreview('');
        onChange('');
    };

    return (
        <div className="space-y-2">
            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <Button
                        type="button"
                        onClick={handleClear}
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 rounded-full w-8 h-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                        ) : (
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        )}
                        <p className="text-sm text-gray-500">
                            {isUploading ? 'Enviando...' : 'Clique para fazer upload'}
                        </p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </label>
            )}
        </div>
    );
}
