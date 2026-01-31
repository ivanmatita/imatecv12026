/**
 * ASSISTENTES DO SISTEMA - IMATEC V.2.0
 * Exportação centralizada de todos os assistentes
 */

export { BackendAssistant } from './backendAssistant';
export { SecurityAssistant } from './securityAssistant';
export { IntegrationAssistant } from './integrationAssistant';
export { FrontendAssistant } from './frontendAssistant';
export { supabase } from './supabaseClient';

/**
 * Inicializa todos os assistentes do sistema
 */
export async function inicializarSistema() {
    console.log('🚀 Sistema: Iniciando IMATEC V.2.0...');

    try {
        const { IntegrationAssistant } = await import('./integrationAssistant');
        const { FrontendAssistant } = await import('./frontendAssistant');

        // Mostrar loading
        FrontendAssistant.mostrarLoading('Inicializando sistema...');

        // Inicializar integração
        await IntegrationAssistant.inicializar();

        // Esconder loading
        FrontendAssistant.esconderLoading();

        // Notificar sucesso
        FrontendAssistant.notificarSucesso('Sistema IMATEC V.2.0 inicializado com sucesso!');

        console.log('✅ Sistema: IMATEC V.2.0 inicializado com sucesso!');
        console.log('📦 Assistentes ativos:');
        console.log('  ✅ BackendAssistant - Gerenciamento de dados');
        console.log('  ✅ FrontendAssistant - Interface do usuário');
        console.log('  ✅ SecurityAssistant - Segurança e validações');
        console.log('  ✅ IntegrationAssistant - Sincronização e integração');

        return true;
    } catch (error: any) {
        console.error('❌ Sistema: Erro ao inicializar:', error.message);

        const { FrontendAssistant } = await import('./frontendAssistant');
        FrontendAssistant.esconderLoading();
        FrontendAssistant.notificarErro(`Erro ao inicializar sistema: ${error.message}`);

        return false;
    }
}

/**
 * Verifica status de todos os assistentes
 */
export async function verificarStatusSistema() {
    console.log('🔍 Sistema: Verificando status dos assistentes...');

    const status = {
        backend: false,
        frontend: true, // Frontend sempre disponível
        security: true, // Security sempre disponível
        integration: false,
        supabase: false
    };

    try {
        const { BackendAssistant } = await import('./backendAssistant');
        status.supabase = await BackendAssistant.testarConexao();
        status.backend = true;
        status.integration = true;
    } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
    }

    console.log('📊 Status dos Assistentes:', status);
    return status;
}
