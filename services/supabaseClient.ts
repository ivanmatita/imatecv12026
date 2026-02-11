
import { createClient } from '@supabase/supabase-js';

// Conexão segura com o banco de dados via Supabase.
// Credenciais de produção atualizadas para a base de dados: imatecv12026.

// Carregar variáveis de ambiente
// @ts-ignore
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || "https://alqttoqjftqckojusayf.supabase.co";
// @ts-ignore
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscXR0b3FqZnRxY2tvanVzYXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzE1MjYsImV4cCI6MjA4NTIwNzUyNn0.wY9f9-fVJBdLWfvaDmdRMu7E0cRJWcwXzEakNjlpWGo";

// Validar variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas!');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Log de inicialização
console.log('🔌 Supabase Client inicializado');
console.log('📊 Banco de dados: imatecv12026');
console.log('🌍 URL:', SUPABASE_URL);

// ================= COMPRAS =================
export async function listarCompras() {
  const { data, error } = await supabase
    .from('compras')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function criarCompra(compra: any) {
  const { data, error } = await supabase
    .from('compras')
    .insert([compra])
    .select();

  if (error) throw error;
  return data;
}

// ================= SECRETARIA DOCUMENTOS =================
// Tabela: secretaria_documentos
// CRUD completo conforme requisitos do projeto

/**
 * LISTAR (SELECT) - Busca todos os documentos da secretaria
 * Ordenado por created_at desc
 */
export async function listarSecretariaDocumentos() {
  const { data, error } = await supabase
    .from('secretaria_documentos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * CRIAR (INSERT) - Cria um novo documento na secretaria
 * Preenche automaticamente created_at com now()
 */
export async function criarSecretariaDocumento(documento: any) {
  const { data, error } = await supabase
    .from('secretaria_documentos')
    .insert([{
      ...documento,
      created_at: new Date().toISOString()
    }])
    .select();

  if (error) throw error;
  return data;
}

/**
 * ATUALIZAR (UPDATE) - Atualiza um documento existente
 * Atualiza automaticamente updated_at com now()
 */
export async function atualizarSecretariaDocumento(id: string, documento: any) {
  const { data, error } = await supabase
    .from('secretaria_documentos')
    .update({
      ...documento,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}

/**
 * APAGAR (DELETE) - Remove um documento da secretaria
 */
export async function apagarSecretariaDocumento(id: string) {
  const { data, error } = await supabase
    .from('secretaria_documentos')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}

// ================= FUNÇÕES LEGADAS (MANTER COMPATIBILIDADE) =================
export async function listarSecretaria() {
  return listarSecretariaDocumentos();
}

export async function criarDocumentoSecretaria(doc: any) {
  return criarSecretariaDocumento(doc);
}

// ================= PAGAMENTO DE IMPOSTO =================
export async function listarImpostos() {
  const { data, error } = await supabase
    .from('pagamento_imposto')
    .select('*');

  if (error) throw error;
  return data;
}

export async function pagarImposto(imposto: any) {
  const { data, error } = await supabase
    .from('pagamento_imposto')
    .insert([imposto])
    .select();

  if (error) throw error;
  return data;
}

// ================= LOCAL DE TRABALHO =================
// ================= LOCAL DE TRABALHO =================
export async function listarLocaisTrabalho() {
  const { data, error } = await supabase
    .from('local_trabalho')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function criarLocalTrabalho(local: any) {
  const { data, error } = await supabase
    .from('local_trabalho')
    .insert([local])
    .select();

  if (error) throw error;
  return data;
}

export async function atualizarLocalTrabalho(id: string, local: any) {
  const { data, error } = await supabase
    .from('local_trabalho')
    .update(local)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}

// NÃO IMPLEMENTAR DELETE - Registros não podem ser apagados
// Se necessário, usar controle de status (ativo/inativo)

// ================= CLIENTES =================
export async function listarClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nome, nif')
    .order('nome', { ascending: true });

  if (error) throw error;
  return data;
}

// ================= ARQUIVOS =================
export async function uploadArquivo(file: File) {
  const filePath = `arquivos/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from('arquivos')
    .upload(filePath, file);

  if (error) throw error;
  return data;
}

export async function listarArquivos() {
  const { data, error } = await supabase.storage
    .from('arquivos')
    .list();

  if (error) throw error;
  return data;
}
