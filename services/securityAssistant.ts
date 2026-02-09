/**
 * ASSISTENTE DE SEGURANÇA - IMATEC V.2.0
 * Responsável por validações, sanitização e proteção de dados
 */

export class SecurityAssistant {
    /**
     * Valida NIF (Número de Identificação Fiscal) angolano
     */
    static validarNIF(nif: string): boolean {
        if (!nif) return false;
        const cleaned = nif.replace(/\D/g, '');
        return cleaned.length === 9 || cleaned.length === 10;
    }

    /**
     * Valida email
     */
    static validarEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Valida telefone angolano
     */
    static validarTelefone(telefone: string): boolean {
        if (!telefone) return false;
        const cleaned = telefone.replace(/\D/g, '');
        return cleaned.length >= 9 && cleaned.length <= 13;
    }

    /**
     * Sanitiza string para prevenir XSS
     */
    static sanitizarTexto(texto: string): string {
        if (!texto) return '';
        return texto
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Valida valores monetários
     */
    static validarValor(valor: number): boolean {
        return !isNaN(valor) && valor >= 0 && isFinite(valor);
    }

    /**
     * Valida UUID
     */
    static validarUUID(uuid: string): boolean {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return regex.test(uuid);
    }

    /**
     * Valida dados de cliente antes de salvar
     */
    static validarCliente(cliente: any): { valido: boolean; erros: string[] } {
        const erros: string[] = [];

        if (!cliente.nome || cliente.nome.trim().length < 3) {
            erros.push('Nome do cliente deve ter pelo menos 3 caracteres');
        }

        if (!cliente.nif || !this.validarNIF(cliente.nif)) {
            erros.push('NIF inválido');
        }

        if (cliente.email && !this.validarEmail(cliente.email)) {
            erros.push('Email inválido');
        }

        if (cliente.telefone && !this.validarTelefone(cliente.telefone)) {
            erros.push('Telefone inválido');
        }

        return {
            valido: erros.length === 0,
            erros
        };
    }

    /**
     * Valida dados de fornecedor antes de salvar
     */
    static validarFornecedor(fornecedor: any): { valido: boolean; erros: string[] } {
        const erros: string[] = [];

        if (!fornecedor.nome || fornecedor.nome.trim().length < 3) {
            erros.push('Nome do fornecedor deve ter pelo menos 3 caracteres');
        }

        if (!fornecedor.contribuinte || !this.validarNIF(fornecedor.contribuinte)) {
            erros.push('Contribuinte inválido');
        }

        if (fornecedor.email && !this.validarEmail(fornecedor.email)) {
            erros.push('Email inválido');
        }

        if (fornecedor.telefone && !this.validarTelefone(fornecedor.telefone)) {
            erros.push('Telefone inválido');
        }

        return {
            valido: erros.length === 0,
            erros
        };
    }

    /**
     * Valida dados de fatura antes de salvar
     */
    static validarFatura(fatura: any): { valido: boolean; erros: string[] } {
        const erros: string[] = [];

        if (!fatura.cliente_id) {
            erros.push('Cliente é obrigatório');
        }

        if (!fatura.total || !this.validarValor(fatura.total)) {
            erros.push('Total da fatura inválido');
        }

        if (fatura.total <= 0) {
            erros.push('Total da fatura deve ser maior que zero');
        }

        if (!fatura.data) {
            erros.push('Data da fatura é obrigatória');
        }

        if (!fatura.items || fatura.items.length === 0) {
            erros.push('Fatura deve ter pelo menos um item');
        }

        return {
            valido: erros.length === 0,
            erros
        };
    }

    /**
     * Gera log de auditoria
     */
    static registrarAuditoria(acao: string, entidade: string, dados: any) {
        const log = {
            timestamp: new Date().toISOString(),
            acao,
            entidade,
            usuario: 'Sistema',
            dados: JSON.stringify(dados)
        };
        console.log('🔒 Auditoria:', log);
        return log;
    }

    /**
     * Verifica permissões de acesso
     */
    static verificarPermissao(usuario: any, acao: string): boolean {
        if (!usuario) {
            console.warn('⚠️ Segurança: Usuário não autenticado');
            return false;
        }

        if (usuario.role === 'ADMIN') {
            return true;
        }

        // Adicionar lógica de permissões específicas aqui
        console.log(`🔒 Segurança: Verificando permissão ${acao} para ${usuario.name}`);
        return true;
    }

    /**
     * Criptografa dados sensíveis (simulação)
     */
    static criptografar(dados: string): string {
        // Em produção, usar biblioteca de criptografia real
        return btoa(dados);
    }

    /**
     * Descriptografa dados sensíveis (simulação)
     */
    static descriptografar(dadosCriptografados: string): string {
        // Em produção, usar biblioteca de criptografia real
        try {
            return atob(dadosCriptografados);
        } catch {
            return '';
        }
    }
}

export default SecurityAssistant;
