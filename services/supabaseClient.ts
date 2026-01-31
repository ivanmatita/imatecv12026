
import { createClient } from '@supabase/supabase-js';

/**
 * Conexão segura com o banco de dados via Supabase.
 * Credenciais de produção atualizadas para a base de dados: imatecv12026.
 * 
 * As credenciais são carregadas das variáveis de ambiente para segurança.
 */

// Carregar variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://alqttoqjftqckojusayf.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscXR0b3FqZnRxY2tvanVzYXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzE1MjYsImV4cCI6MjA4NTIwNzUyNn0.wY9f9-fVJBdLWfvaDmdRMu7E0cRJWcwXzEakNjlpWGo";

// Validar variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas!');
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local');
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
