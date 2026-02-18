/**
 * HOOKS REACT - IMATEC V.2.0
 * Hooks personalizados para usar os assistentes no React
 */

import { useState, useEffect, useCallback } from 'react';
import { BackendAssistant } from './backendAssistant';
import { FrontendAssistant } from './frontendAssistant';
import { SecurityAssistant } from './securityAssistant';
import { IntegrationAssistant } from './integrationAssistant';

/**
 * Hook para gerenciar clientes
 */
export function useClientes() {
    const [clientes, setClientes] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const dados = await BackendAssistant.clientes.listar();
            setClientes(dados);
            FrontendAssistant.notificarSucesso(`${dados.length} clientes carregados`);
        } catch (error: any) {
            setErro(error.message);
            FrontendAssistant.notificarErro(`Erro ao carregar clientes: ${error.message}`);
        } finally {
            setCarregando(false);
        }
    }, []);

    const criar = useCallback(async (cliente: any) => {
        setCarregando(true);
        try {
            const resultado = await IntegrationAssistant.processarOperacao('criar', 'cliente', cliente);
            await carregar();
            FrontendAssistant.notificarSucesso('Cliente criado com sucesso!');
            return resultado;
        } catch (error: any) {
            FrontendAssistant.notificarErro(`Erro ao criar cliente: ${error.message}`);
            throw error;
        } finally {
            setCarregando(false);
        }
    }, [carregar]);

    const atualizar = useCallback(async (id: string, cliente: any) => {
        setCarregando(true);
        try {
            const resultado = await IntegrationAssistant.processarOperacao('atualizar', 'cliente', cliente, id);
            await carregar();
            FrontendAssistant.notificarSucesso('Cliente atualizado com sucesso!');
            return resultado;
        } catch (error: any) {
            FrontendAssistant.notificarErro(`Erro ao atualizar cliente: ${error.message}`);
            throw error;
        } finally {
            setCarregando(false);
        }
    }, [carregar]);

    const excluir = useCallback(async (id: string) => {
        const confirmado = await FrontendAssistant.confirmar(
            'Tem certeza que deseja excluir este cliente?',
            'Confirmar Exclusão'
        );

        if (!confirmado) return;

        setCarregando(true);
        try {
            await IntegrationAssistant.processarOperacao('excluir', 'cliente', {}, id);
            await carregar();
            FrontendAssistant.notificarSucesso('Cliente excluído com sucesso!');
        } catch (error: any) {
            FrontendAssistant.notificarErro(`Erro ao excluir cliente: ${error.message}`);
            throw error;
        } finally {
            setCarregando(false);
        }
    }, [carregar]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    return {
        clientes,
        carregando,
        erro,
        carregar,
        criar,
        atualizar,
        excluir
    };
}

/**
 * Hook para gerenciar fornecedores
 */
export function useFornecedores() {
    const [fornecedores, setFornecedores] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const dados = await BackendAssistant.fornecedores.listar();
            setFornecedores(dados);
            FrontendAssistant.notificarSucesso(`${dados.length} fornecedores carregados`);
        } catch (error: any) {
            setErro(error.message);
            FrontendAssistant.notificarErro(`Erro ao carregar fornecedores: ${error.message}`);
        } finally {
            setCarregando(false);
        }
    }, []);

    const criar = useCallback(async (fornecedor: any) => {
        setCarregando(true);
        try {
            const resultado = await IntegrationAssistant.processarOperacao('criar', 'fornecedor', fornecedor);
            await carregar();
            FrontendAssistant.notificarSucesso('Fornecedor criado com sucesso!');
            return resultado;
        } catch (error: any) {
            FrontendAssistant.notificarErro(`Erro ao criar fornecedor: ${error.message}`);
            throw error;
        } finally {
            setCarregando(false);
        }
    }, [carregar]);

    const atualizar = useCallback(async (id: string, fornecedor: any) => {
        setCarregando(true);
        try {
            const resultado = await IntegrationAssistant.processarOperacao('atualizar', 'fornecedor', fornecedor, id);
            await carregar();
            FrontendAssistant.notificarSucesso('Fornecedor atualizado com sucesso!');
            return resultado;
        } catch (error: any) {
            FrontendAssistant.notificarErro(`Erro ao atualizar fornecedor: ${error.message}`);
            throw error;
        } finally {
            setCarregando(false);
        }
    }, [carregar]);

    const excluir = useCallback(async (id: string) => {
        const confirmado = await FrontendAssistant.confirmar(
            'Tem certeza que deseja excluir este fornecedor?',
            'Confirmar Exclusão'
        );

        if (!confirmado) return;

        setCarregando(true);
        try {
            await IntegrationAssistant.processarOperacao('excluir', 'fornecedor', {}, id);
            await carregar();
            FrontendAssistant.notificarSucesso('Fornecedor excluído com sucesso!');
        } catch (error: any) {
            FrontendAssistant.notificarErro(`Erro ao excluir fornecedor: ${error.message}`);
            throw error;
        } finally {
            setCarregando(false);
        }
    }, [carregar]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    return {
        fornecedores,
        carregando,
        erro,
        carregar,
        criar,
        atualizar,
        excluir
    };
}

/**
 * Hook para gerenciar vendas/faturas
 */
export function useVendas() {
    const [vendas, setVendas] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const result = await BackendAssistant.vendas.listar();
            const dados = result.success ? (result.data || []) : [];
            setVendas(dados);
            FrontendAssistant.notificarSucesso(`${dados.length} faturas carregadas`);
        } catch (error: any) {
            setErro(error.message);
            FrontendAssistant.notificarErro(`Erro ao carregar faturas: ${error.message}`);
        } finally {
            setCarregando(false);
        }
    }, []);

    const criar = useCallback(async (fatura: any) => {
        setCarregando(true);
        try {
            const resultado = await IntegrationAssistant.processarOperacao('criar', 'fatura', fatura);
            await carregar();
            FrontendAssistant.notificarSucesso('Fatura criada com sucesso!');
            return resultado;
        } catch (error: any) {
            FrontendAssistant.notificarErro(`Erro ao criar fatura: ${error.message}`);
            throw error;
        } finally {
            setCarregando(false);
        }
    }, [carregar]);

    const atualizar = useCallback(async (id: string, fatura: any) => {
        setCarregando(true);
        try {
            const resultado = await IntegrationAssistant.processarOperacao('atualizar', 'fatura', fatura, id);
            await carregar();
            FrontendAssistant.notificarSucesso('Fatura atualizada com sucesso!');
            return resultado;
        } catch (error: any) {
            FrontendAssistant.notificarErro(`Erro ao atualizar fatura: ${error.message}`);
            throw error;
        } finally {
            setCarregando(false);
        }
    }, [carregar]);

    const certificar = useCallback(async (id: string, hash: string) => {
        setCarregando(true);
        try {
            // await BackendAssistant.vendas.certificar(id, hash);
            console.warn('BackendAssistant.vendas.certificar não implementado');
            await carregar();
            FrontendAssistant.notificarSucesso('Fatura certificada (simulado) com sucesso!');
        } catch (error: any) {
            FrontendAssistant.notificarErro(`Erro ao certificar fatura: ${error.message}`);
            throw error;
        } finally {
            setCarregando(false);
        }
    }, [carregar]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    return {
        vendas,
        carregando,
        erro,
        carregar,
        criar,
        atualizar,
        certificar
    };
}

/**
 * Hook para validação de formulários
 */
export function useValidacao() {
    const validarCliente = useCallback((cliente: any) => {
        return SecurityAssistant.validarCliente(cliente);
    }, []);

    const validarFornecedor = useCallback((fornecedor: any) => {
        return SecurityAssistant.validarFornecedor(fornecedor);
    }, []);

    const validarFatura = useCallback((fatura: any) => {
        return SecurityAssistant.validarFatura(fatura);
    }, []);

    const validarNIF = useCallback((nif: string) => {
        return SecurityAssistant.validarNIF(nif);
    }, []);

    const validarEmail = useCallback((email: string) => {
        return SecurityAssistant.validarEmail(email);
    }, []);

    const validarTelefone = useCallback((telefone: string) => {
        return SecurityAssistant.validarTelefone(telefone);
    }, []);

    return {
        validarCliente,
        validarFornecedor,
        validarFatura,
        validarNIF,
        validarEmail,
        validarTelefone
    };
}

/**
 * Hook para notificações
 */
export function useNotificacoes() {
    const sucesso = useCallback((mensagem: string) => {
        FrontendAssistant.notificarSucesso(mensagem);
    }, []);

    const erro = useCallback((mensagem: string) => {
        FrontendAssistant.notificarErro(mensagem);
    }, []);

    const aviso = useCallback((mensagem: string) => {
        FrontendAssistant.notificarAviso(mensagem);
    }, []);

    const info = useCallback((mensagem: string) => {
        FrontendAssistant.notificarInfo(mensagem);
    }, []);

    return {
        sucesso,
        erro,
        aviso,
        info
    };
}
/**
 * Hook to handle clicks outside of a component
 */
export function useClickOutside(ref: React.RefObject<HTMLElement | null>, callback: () => void) {
    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [ref, callback]);
}
