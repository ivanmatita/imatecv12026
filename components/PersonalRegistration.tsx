import React from 'react';
import { User, ArrowLeft } from 'lucide-react';

interface PersonalRegistrationProps {
    onClose?: () => void;
}

const PersonalRegistration: React.FC<PersonalRegistrationProps> = ({ onClose }) => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <User size={32} />
                                Cadastro Pessoal
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">Formulário completo de cadastro de funcionário</p>
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
                        Página em desenvolvimento. Aqui será exibido o formulário completo de cadastro pessoal com todas as informações do funcionário.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PersonalRegistration;
