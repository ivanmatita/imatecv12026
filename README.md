# IMATEC V.2.0 - Sistema ERP Multi-Empresa

Sistema ERP completo desenvolvido com React, TypeScript, Vite e Supabase.

## 🚀 Funcionalidades

- ✅ Gestão de Clientes
- ✅ Gestão de Fornecedores
- ✅ Gestão de Vendas/Faturas
- ✅ Multi-empresa (isolamento de dados)
- ✅ Certificação de documentos
- ✅ Impressão de documentos
- ✅ Exportação para Excel/PDF
- ✅ Sistema de notificações
- ✅ Validações de segurança

## 🛠️ Tecnologias

- **Frontend:** React 19 + TypeScript
- **Build:** Vite 6
- **Banco de Dados:** Supabase (PostgreSQL)
- **UI:** Lucide React Icons
- **Gráficos:** Recharts
- **Exportação:** XLSX, jsPDF, html2canvas

## 📦 Assistentes do Sistema

- **BackendAssistant:** Gerenciamento de dados e CRUD
- **FrontendAssistant:** Interface e notificações
- **SecurityAssistant:** Validações e segurança
- **IntegrationAssistant:** Sincronização e integração

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/soft-imatec-1.git
cd soft-imatec-1
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

### 4. Execute o projeto
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## 🗄️ Configuração do Banco de Dados

O projeto usa Supabase como banco de dados. As tabelas necessárias são:

- `empresas` - Empresas do sistema
- `clientes` - Clientes
- `fornecedores` - Fornecedores
- `faturas` - Vendas/Faturas

Execute as migrações SQL disponíveis em `CONFIGURACAO_COMPLETA.md` para criar as tabelas.

## 📚 Documentação

- `CONFIGURACAO_COMPLETA.md` - Guia completo de configuração
- `CONEXAO_SUPABASE_COMPLETA.md` - Detalhes da conexão com Supabase
- `GUIA_DE_USO_ASSISTENTES.md` - Como usar os assistentes
- `services/README.md` - Documentação técnica dos assistentes

## 🚀 Deploy

### Vercel

1. Faça push do código para o GitHub
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY` (opcional)
4. Deploy automático!

### Build para Produção

```bash
npm run build
```

Os arquivos de produção estarão em `dist/`

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção

## 🔒 Segurança

- Row Level Security (RLS) habilitado no Supabase
- Validações de dados no frontend e backend
- Sanitização de inputs
- Isolamento de dados por empresa

## 📊 Estrutura do Projeto

```
soft-imatec-1/
├── components/          # Componentes React
├── services/           # Assistentes e serviços
│   ├── backendAssistant.ts
│   ├── frontendAssistant.ts
│   ├── securityAssistant.ts
│   ├── integrationAssistant.ts
│   └── supabaseClient.ts
├── utils/              # Utilitários
├── types.ts            # Tipos TypeScript
├── App.tsx             # Componente principal
└── index.tsx           # Entry point
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📄 Licença

Proprietária - IMATEC Soft V.2.0

## 📞 Suporte

Para suporte, entre em contato através de info@imatec.ao

---

**Desenvolvido por:** IMATEC Soft  
**Versão:** 2.0.0  
**Data:** 2026
