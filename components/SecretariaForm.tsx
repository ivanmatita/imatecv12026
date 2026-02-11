

import React, { useState, useEffect, useRef } from 'react';
import { SecretariaDocument, DocumentSeries } from '../types';
import { generateUUID, formatDate } from '../utils';
import { Save, ArrowLeft, Printer, Bold, Italic, AlignLeft, AlignCenter, AlignRight, List, Type, Eye, ChevronDown, ChevronUp, Underline, X, Loader2 } from 'lucide-react';

interface SecretariaFormProps {
    document?: SecretariaDocument;
    onSave: (doc: SecretariaDocument) => void;
    onCancel: () => void;
    series: DocumentSeries[];
}

const SecretariaForm: React.FC<SecretariaFormProps> = ({ document: existingDoc, onSave, onCancel, series }) => {
    const [formData, setFormData] = useState<Partial<SecretariaDocument>>({
        type: 'Carta',
        date: new Date().toISOString().split('T')[0],
        destinatarioIntro: 'Exo(a) Sr(a)',
        confidencial: false,
        imprimirPagina: true,
        destinatarioLocalidade: 'Luanda',
        destinatarioPais: 'Angola',
        departamento: 'Geral',
        corpo: '<div>Escreva aqui o conteúdo da carta...</div>',
        destinatarioNome: '',
        assunto: '',
        number: ''
    });

    const [dateExtended, setDateExtended] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (existingDoc) {
            setFormData(existingDoc);
            if (editorRef.current) editorRef.current.innerHTML = existingDoc.corpo;
        } else if (series.length > 0) {
            setFormData(prev => ({ ...prev, seriesId: series[0].id, seriesCode: series[0].code }));
        }
        updateDateExtended(formData.date || new Date().toISOString().split('T')[0]);
    }, [existingDoc, series]);

    const updateDateExtended = (dateVal: string) => {
        if (!dateVal) return;
        const formatted = new Date(dateVal).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
        setDateExtended(`Luanda, ${formatted}`);
    };

    const handleSubmit = async () => {
        if (!formData.destinatarioNome || !formData.assunto) {
            return alert("Preencha o Destinatário e o Assunto");
        }

        setIsSaving(true);
        const docId = formData.id || generateUUID();
        const s = series.find(ser => ser.id === formData.seriesId) || series[0];
        const docNumber = formData.number || `${formData.type?.substring(0, 2).toUpperCase()}/${s?.currentSequence || 1}/${s?.year || new Date().getFullYear()}`;

        const docToSave: SecretariaDocument = {
            ...formData as SecretariaDocument,
            id: docId,
            number: docNumber,
            corpo: editorRef.current?.innerHTML || '',
            dateExtended
        };

        try {
            // Preparar payload para Supabase com TODOS os campos da tabela
            const supabasePayload = {
                id: docId,
                empresa_id: formData.companyId || null, // UUID da empresa
                tipo: docToSave.type || 'Carta',
                serie_id: formData.seriesId || null,
                serie_codigo: formData.seriesCode || s?.code || '',
                numero: docNumber,
                data_doc: docToSave.date || new Date().toISOString().split('T')[0],
                destinatario_nome: docToSave.destinatarioNome,
                destinatario_intro: docToSave.destinatarioIntro || 'Exo(a) Sr(a)',
                assunto: docToSave.assunto,
                corpo: docToSave.corpo,
                confidencial: docToSave.confidencial || false,
                imprimir_pagina: docToSave.imprimirPagina !== undefined ? docToSave.imprimirPagina : true,
                criado_por: docToSave.createdBy || 'Admin',
                bloqueado: docToSave.isLocked || false,
                departamento: docToSave.departamento || 'Geral'
            };

            // Verificar se é UPDATE ou INSERT
            if (existingDoc) {
                // UPDATE - Atualizar documento existente
                const { atualizarSecretariaDocumento } = await import('../services/supabaseClient');
                await atualizarSecretariaDocumento(docId, supabasePayload);
                console.log('✅ Documento atualizado com sucesso no Supabase');
            } else {
                // INSERT - Criar novo documento
                const { criarSecretariaDocumento } = await import('../services/supabaseClient');
                await criarSecretariaDocumento(supabasePayload);
                console.log('✅ Documento criado com sucesso no Supabase');
            }

            // Sucesso: chamar callback e mostrar mensagem
            alert(existingDoc ? 'Documento atualizado com sucesso!' : 'Documento criado com sucesso!');
            onSave(docToSave);

        } catch (err: any) {
            console.error('❌ Erro ao salvar documento:', err);

            // Tratamento de erro detalhado
            let errorMessage = "Erro ao salvar na Cloud.";

            if (err.message) {
                if (err.message.includes('duplicate key')) {
                    errorMessage = "Erro: Já existe um documento com este ID.";
                } else if (err.message.includes('foreign key')) {
                    errorMessage = "Erro: Referência inválida (empresa_id ou serie_id).";
                } else if (err.message.includes('not null')) {
                    errorMessage = "Erro: Campos obrigatórios não preenchidos.";
                } else {
                    errorMessage = `Erro: ${err.message}`;
                }
            }

            alert(`${errorMessage}\n\nO documento foi salvo localmente para esta sessão.`);

            // Fallback: salvar localmente mesmo com erro
            onSave(docToSave);
        } finally {
            setIsSaving(false);
        }
    };

    const execCmd = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    return (
        <div className="bg-slate-100 min-h-screen p-4 animate-in fade-in pb-20">
            <div className="sticky top-0 z-20 bg-white border-b border-slate-200 p-4 shadow-sm flex justify-between items-center mb-6 rounded-lg">
                <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft /></button>
                <div className="flex gap-3">
                    <button onClick={handleSubmit} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md disabled:opacity-50">
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Salvar Documento
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="bg-white rounded shadow-sm border border-slate-300 p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Destinatário</label>
                            <input className="w-full text-lg font-bold border-b border-black outline-none py-1" value={formData.destinatarioNome || ''} onChange={e => setFormData({ ...formData, destinatarioNome: e.target.value })} placeholder="Nome da Entidade" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Assunto</label>
                            <input className="w-full border rounded p-2 text-sm" value={formData.assunto || ''} onChange={e => setFormData({ ...formData, assunto: e.target.value })} placeholder="Assunto oficial" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                            <input type="date" className="w-full border rounded p-2 text-sm" value={formData.date} onChange={e => { setFormData({ ...formData, date: e.target.value }); updateDateExtended(e.target.value); }} />
                        </div>
                    </div>

                    <div className="border border-slate-300 rounded overflow-hidden">
                        <div className="bg-slate-50 p-2 border-b flex gap-2">
                            <button className="p-1 hover:bg-slate-200 rounded" onClick={() => execCmd('bold')}><Bold size={16} /></button>
                            <button className="p-1 hover:bg-slate-200 rounded" onClick={() => execCmd('italic')}><Italic size={16} /></button>
                            <button className="p-1 hover:bg-slate-200 rounded" onClick={() => execCmd('underline')}><Underline size={16} /></button>
                        </div>
                        <div ref={editorRef} className="p-6 min-h-[400px] outline-none bg-white font-serif leading-relaxed" contentEditable suppressContentEditableWarning></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecretariaForm;
