import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Camera, X, Download, Monitor } from 'lucide-react';

const ScreenshotButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleCapture = async () => {
        setIsCapturing(true);
        // Feedback imediato
        console.log("Iniciando captura de tela...");

        try {
            // Wait a bit to ensure UI renders if needed
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capture the entire body
            const canvas = await html2canvas(document.body, {
                useCORS: true,
                logging: true, // Enable logging to debug
                allowTaint: true,
                backgroundColor: '#f8fafc',
                scale: 1 // Force scale 1 to avoid massive images on retina
            });

            const image = canvas.toDataURL('image/png');
            setScreenshot(image);
            setIsOpen(true);
            console.log("Captura realizada com sucesso!");
        } catch (error) {
            console.error("Erro ao capturar tela:", error);
            alert("Não foi possível capturar a tela. Erro: " + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsCapturing(false);
        }
    };

    const handleDownload = () => {
        if (!screenshot) return;
        const link = document.createElement('a');
        link.href = screenshot;
        link.download = `sistema-screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <button
                onClick={handleCapture}
                disabled={isCapturing}
                className="flex items-center gap-2 p-2 px-3 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 rounded-md transition-colors relative group border border-blue-200"
                title="Visualizar / Capturar Sistema"
            >
                {isCapturing ? (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                ) : (
                    <Camera className="w-5 h-5" />
                )}
                <span className="hidden lg:inline text-sm font-bold">Capturar Tela</span>
            </button>

            {/* Modal for Preview */}
            {isOpen && screenshot && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <Monitor className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-slate-700">Visualização do Sistema</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content (Image) */}
                        <div className="flex-1 overflow-auto p-4 bg-slate-100 flex items-center justify-center">
                            <img
                                src={screenshot}
                                alt="Screenshot"
                                className="max-w-full h-auto border border-slate-300 shadow-md rounded"
                            />
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Monitor className="w-4 h-4" />
                                Imprimir / PDF
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={handleDownload}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Baixar Imagem
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ScreenshotButton;
