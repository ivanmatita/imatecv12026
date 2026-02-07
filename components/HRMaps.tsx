import React from 'react';
import { Table, ArrowLeft } from 'lucide-react';

interface HRMapsProps {
    onClose?: () => void;
}

const HRMaps: React.FC<HRMapsProps> = ({ onClose }) => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 via-green-600 to-green-800 text-white p-6 rounded-lg shadow-lg mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <Table size={32} />
                                Mapas de RH
                            </h1>
                            <p className="text-green-100 text-sm mt-1">Mapas e relatórios de Recursos Humanos</p>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Voltar
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                    <p className="text-slate-600 text-center">
                        Página em desenvolvimento. Aqui serão exibidos os mapas e relatórios de RH.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HRMaps;
