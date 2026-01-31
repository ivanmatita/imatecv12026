/**
 * ASSISTENTE DE FRONTEND - IMATEC V.2.0
 * Responsável por gerenciar a interface do usuário e interações
 */

export class FrontendAssistant {
    /**
     * Exibe notificação de sucesso
     */
    static notificarSucesso(mensagem: string) {
        console.log(`✅ Frontend: ${mensagem}`);
        // Pode ser integrado com biblioteca de toast/notificação
        if (typeof window !== 'undefined') {
            // Criar notificação visual
            this.criarNotificacao(mensagem, 'success');
        }
    }

    /**
     * Exibe notificação de erro
     */
    static notificarErro(mensagem: string) {
        console.error(`❌ Frontend: ${mensagem}`);
        if (typeof window !== 'undefined') {
            this.criarNotificacao(mensagem, 'error');
        }
    }

    /**
     * Exibe notificação de aviso
     */
    static notificarAviso(mensagem: string) {
        console.warn(`⚠️ Frontend: ${mensagem}`);
        if (typeof window !== 'undefined') {
            this.criarNotificacao(mensagem, 'warning');
        }
    }

    /**
     * Exibe notificação de informação
     */
    static notificarInfo(mensagem: string) {
        console.info(`ℹ️ Frontend: ${mensagem}`);
        if (typeof window !== 'undefined') {
            this.criarNotificacao(mensagem, 'info');
        }
    }

    /**
     * Cria notificação visual no navegador
     */
    private static criarNotificacao(mensagem: string, tipo: 'success' | 'error' | 'warning' | 'info') {
        const cores = {
            success: { bg: '#10b981', icon: '✅' },
            error: { bg: '#ef4444', icon: '❌' },
            warning: { bg: '#f59e0b', icon: '⚠️' },
            info: { bg: '#3b82f6', icon: 'ℹ️' }
        };

        const cor = cores[tipo];

        // Criar elemento de notificação
        const notificacao = document.createElement('div');
        notificacao.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${cor.bg};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
    `;

        notificacao.innerHTML = `
      <span style="font-size: 20px;">${cor.icon}</span>
      <span>${mensagem}</span>
    `;

        // Adicionar animação
        const style = document.createElement('style');
        style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
        document.head.appendChild(style);

        document.body.appendChild(notificacao);

        // Remover após 4 segundos
        setTimeout(() => {
            notificacao.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notificacao);
            }, 300);
        }, 4000);
    }

    /**
     * Exibe loading/carregamento
     */
    static mostrarLoading(mensagem: string = 'Carregando...') {
        console.log(`🔄 Frontend: ${mensagem}`);

        if (typeof window !== 'undefined') {
            // Remover loading anterior se existir
            const loadingExistente = document.getElementById('imatec-loading');
            if (loadingExistente) {
                loadingExistente.remove();
            }

            const loading = document.createElement('div');
            loading.id = 'imatec-loading';
            loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
      `;

            loading.innerHTML = `
        <div style="
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <div style="
          color: white;
          font-size: 16px;
          font-weight: 600;
          font-family: system-ui, -apple-system, sans-serif;
        ">${mensagem}</div>
      `;

            const style = document.createElement('style');
            style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
            document.head.appendChild(style);

            document.body.appendChild(loading);
        }
    }

    /**
     * Esconde loading/carregamento
     */
    static esconderLoading() {
        if (typeof window !== 'undefined') {
            const loading = document.getElementById('imatec-loading');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.remove();
                }, 300);
            }
        }
    }

    /**
     * Confirma ação com o usuário
     */
    static async confirmar(mensagem: string, titulo: string = 'Confirmação'): Promise<boolean> {
        return new Promise((resolve) => {
            if (typeof window === 'undefined') {
                resolve(false);
                return;
            }

            const modal = document.createElement('div');
            modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
      `;

            modal.innerHTML = `
        <div style="
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: scaleIn 0.2s ease-out;
        ">
          <h3 style="
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            font-family: system-ui, -apple-system, sans-serif;
          ">${titulo}</h3>
          <p style="
            margin: 0 0 24px 0;
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
            font-family: system-ui, -apple-system, sans-serif;
          ">${mensagem}</p>
          <div style="
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          ">
            <button id="btn-cancelar" style="
              padding: 10px 20px;
              border: 1px solid #d1d5db;
              background: white;
              color: #374151;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              font-family: system-ui, -apple-system, sans-serif;
              transition: all 0.2s;
            ">Cancelar</button>
            <button id="btn-confirmar" style="
              padding: 10px 20px;
              border: none;
              background: #3b82f6;
              color: white;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              font-family: system-ui, -apple-system, sans-serif;
              transition: all 0.2s;
            ">Confirmar</button>
          </div>
        </div>
      `;

            const style = document.createElement('style');
            style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        #btn-cancelar:hover {
          background: #f3f4f6;
        }
        #btn-confirmar:hover {
          background: #2563eb;
        }
      `;
            document.head.appendChild(style);

            document.body.appendChild(modal);

            const btnConfirmar = modal.querySelector('#btn-confirmar') as HTMLButtonElement;
            const btnCancelar = modal.querySelector('#btn-cancelar') as HTMLButtonElement;

            btnConfirmar.addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            btnCancelar.addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
        });
    }

    /**
     * Formata dados para exibição
     */
    static formatarMoeda(valor: number, moeda: string = 'AOA'): string {
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: moeda,
            minimumFractionDigits: 2
        }).format(valor);
    }

    /**
     * Formata data para exibição
     */
    static formatarData(data: string | Date): string {
        const d = typeof data === 'string' ? new Date(data) : data;
        return new Intl.DateTimeFormat('pt-AO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(d);
    }

    /**
     * Formata data e hora para exibição
     */
    static formatarDataHora(data: string | Date): string {
        const d = typeof data === 'string' ? new Date(data) : data;
        return new Intl.DateTimeFormat('pt-AO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(d);
    }

    /**
     * Copia texto para área de transferência
     */
    static async copiarParaClipboard(texto: string): Promise<boolean> {
        try {
            if (typeof window !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(texto);
                this.notificarSucesso('Copiado para área de transferência!');
                return true;
            }
            return false;
        } catch (error) {
            this.notificarErro('Erro ao copiar para área de transferência');
            return false;
        }
    }

    /**
     * Valida formulário
     */
    static validarFormulario(formId: string): boolean {
        if (typeof window === 'undefined') return false;

        const form = document.getElementById(formId) as HTMLFormElement;
        if (!form) {
            this.notificarErro('Formulário não encontrado');
            return false;
        }

        const isValid = form.checkValidity();
        if (!isValid) {
            form.reportValidity();
            this.notificarAviso('Por favor, preencha todos os campos obrigatórios');
        }

        return isValid;
    }

    /**
     * Scroll suave para elemento
     */
    static scrollParaElemento(elementoId: string) {
        if (typeof window === 'undefined') return;

        const elemento = document.getElementById(elementoId);
        if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Detecta tema do sistema (claro/escuro)
     */
    static detectarTema(): 'light' | 'dark' {
        if (typeof window === 'undefined') return 'light';

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    /**
     * Registra evento de analytics (simulado)
     */
    static registrarEvento(categoria: string, acao: string, label?: string) {
        console.log(`📊 Analytics: ${categoria} - ${acao}${label ? ` - ${label}` : ''}`);
        // Integrar com Google Analytics ou similar
    }

    /**
     * Debounce para otimizar eventos
     */
    static debounce<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    /**
     * Throttle para limitar chamadas
     */
    static throttle<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ): (...args: Parameters<T>) => void {
        let inThrottle: boolean;
        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    /**
     * Exporta dados para CSV
     */
    static exportarCSV(dados: any[], nomeArquivo: string) {
        if (typeof window === 'undefined' || dados.length === 0) return;

        const headers = Object.keys(dados[0]);
        const csv = [
            headers.join(','),
            ...dados.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${nomeArquivo}.csv`;
        link.click();

        this.notificarSucesso(`Arquivo ${nomeArquivo}.csv exportado com sucesso!`);
    }

    /**
     * Imprime elemento específico
     */
    static imprimirElemento(elementoId: string) {
        if (typeof window === 'undefined') return;

        const elemento = document.getElementById(elementoId);
        if (!elemento) {
            this.notificarErro('Elemento não encontrado para impressão');
            return;
        }

        const conteudo = elemento.innerHTML;
        const janelaImpressao = window.open('', '', 'height=600,width=800');

        if (janelaImpressao) {
            janelaImpressao.document.write('<html><head><title>Impressão</title>');
            janelaImpressao.document.write('<style>body { font-family: Arial, sans-serif; }</style>');
            janelaImpressao.document.write('</head><body>');
            janelaImpressao.document.write(conteudo);
            janelaImpressao.document.write('</body></html>');
            janelaImpressao.document.close();
            janelaImpressao.print();
        }
    }
}

export default FrontendAssistant;
