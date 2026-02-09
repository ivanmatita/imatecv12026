/**
 * 🔍 SCRIPT DE DIAGNÓSTICO - Supabase Database
 * 
 * Como usar:
 * 1. Abra o console do navegador (F12)
 * 2. Copie e cole este script completo
 * 3. Pressione Enter
 * 4. Veja o relatório detalhado no console
 */

console.log('🔍 Iniciando diagnóstico do Supabase...\n');

(async function diagnosticarSupabase() {
    // Importar supabase do módulo já carregado
    const { supabase } = await import('./services/supabaseClient');

    console.log('📊 Verificando conexão...');
    console.log(`URL: ${import.meta.env.VITE_SUPABASE_URL}`);
    console.log('');

    // Função auxiliar para verificar tabela
    async function verificarTabela(nomeTabela, colunasEsperadas) {
        console.log(`\n📋 Verificando tabela: ${nomeTabela}`);
        console.log('─'.repeat(60));

        try {
            // Tentar fazer SELECT para ver se a tabela existe
            const { data, error } = await supabase
                .from(nomeTabela)
                .select('*')
                .limit(1);

            if (error) {
                if (error.message.includes('does not exist') || error.code === '42P01') {
                    console.error(`❌ Tabela "${nomeTabela}" NÃO EXISTE`);
                    return { existe: false, erro: error.message };
                } else if (error.message.includes('column') && error.message.includes('does not exist')) {
                    console.warn(`⚠️  Tabela existe, mas faltam colunas`);
                    console.warn(`   Erro: ${error.message}`);
                    return { existe: true, colunasFaltando: true, erro: error.message };
                } else {
                    console.error(`❌ Erro ao acessar "${nomeTabela}":`, error.message);
                    return { existe: false, erro: error.message };
                }
            }

            console.log(`✅ Tabela "${nomeTabela}" existe e está acessível`);

            if (data && data.length > 0) {
                console.log(`   📦 Registros encontrados: ${data.length}`);
                console.log(`   🔑 Colunas disponíveis:`, Object.keys(data[0]).join(', '));
            } else {
                console.log(`   📭 Tabela vazia (sem registros)`);
            }

            // Verificar colunas esperadas
            if (colunasEsperadas && data && data.length > 0) {
                const colunasPresentes = Object.keys(data[0]);
                const colunasFaltando = colunasEsperadas.filter(col => !colunasPresentes.includes(col));

                if (colunasFaltando.length > 0) {
                    console.warn(`   ⚠️  Colunas faltando: ${colunasFaltando.join(', ')}`);
                    return { existe: true, colunasFaltando };
                }
            }

            return { existe: true, ok: true };

        } catch (err) {
            console.error(`❌ Erro inesperado:`, err.message);
            return { existe: false, erro: err.message };
        }
    }

    // Verificar todas as tabelas críticas
    const resultados = {};

    resultados.locais_trabalho = await verificarTabela('locais_trabalho', [
        'id', 'cliente_id', 'data_abertura', 'data_encerramento', 'titulo',
        'codigo', 'efectivos_dia', 'total_efectivos', 'localizacao',
        'descricao', 'contacto', 'observacoes', 'empresa_id'
    ]);

    resultados.armazens = await verificarTabela('armazens', [
        'id', 'nome', 'localizacao', 'empresa_id'
    ]);

    resultados.movimentos_stock = await verificarTabela('movimentos_stock', [
        'id', 'produto_id', 'armazem_id', 'tipo', 'quantidade',
        'data', 'documento_origem', 'observacoes', 'empresa_id'
    ]);

    resultados.produtos = await verificarTabela('produtos', [
        'id', 'codigo', 'nome', 'preco', 'empresa_id'
    ]);

    resultados.clientes = await verificarTabela('clientes', [
        'id', 'nome', 'nif', 'email', 'telefone', 'empresa_id'
    ]);

    resultados.funcionarios = await verificarTabela('funcionarios', [
        'id', 'nome', 'nif', 'funcao', 'empresa_id'
    ]);

    resultados.caixas = await verificarTabela('caixas', [
        'id', 'nome', 'saldo_inicial', 'saldo_atual', 'empresa_id'
    ]);

    // Resumo Final
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('📊 RESUMO DO DIAGNÓSTICO');
    console.log('═'.repeat(60));

    const totalTabelas = Object.keys(resultados).length;
    const tabelasOk = Object.values(resultados).filter(r => r.ok).length;
    const tabelasComProblemas = Object.values(resultados).filter(r => !r.ok).length;

    console.log(`\n✅ Tabelas OK: ${tabelasOk}/${totalTabelas}`);
    console.log(`⚠️  Tabelas com problemas: ${tabelasComProblemas}/${totalTabelas}`);

    if (tabelasComProblemas > 0) {
        console.log('\n⚠️  AÇÃO NECESSÁRIA:');
        console.log('   1. Abra o arquivo: GUIA_CORRECAO_SUPABASE.md');
        console.log('   2. Siga as instruções para executar a migração SQL');
        console.log('   3. Execute este diagnóstico novamente após a migração');
    } else {
        console.log('\n✅ TUDO OK! Banco de dados configurado corretamente.');
    }

    console.log('\n' + '═'.repeat(60));

    return resultados;
})();

console.log('\n⏳ Aguardando conclusão do diagnóstico...\n');
