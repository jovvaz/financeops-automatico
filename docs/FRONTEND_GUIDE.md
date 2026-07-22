# Guia de evolução do frontend

## Estado atual

O frontend cobre todos os módulos operacionais, é responsivo e está ligado ao mesmo dataset e aos mesmos serviços das APIs. A estrutura prioriza estados, contratos e ações claros.

Arquivo central: `components/financeops-app.tsx`. Estilos: `app/globals.css`. A navegação usa uma seção ativa no cliente para manter a demonstração rápida; ela pode ser convertida em rotas sem alterar as APIs.

## Próximas melhorias recomendadas

1. Separar cada view em `components/modules/<dominio>` e criar rotas próprias.
2. Substituir os gráficos em CSS por Recharts, mantendo os contratos `CashflowPoint`.
3. Criar painéis de detalhe para fatura, cliente, fornecedor, alerta e conciliação.
4. Adicionar paginação, ordenação, seleção em lote e estados vazios às tabelas.
5. Padronizar feedbacks de carregamento, confirmação e erro recuperável.
6. Refinar a navegação móvel, que atualmente usa uma faixa horizontal.
7. Consolidar tokens de espaçamento, tipografia e componentes reutilizáveis.
8. Ocultar ou desabilitar ações conforme o papel do usuário.
9. Ampliar a acessibilidade de foco, labels e navegação de tabelas.
10. Preservar os nomes das ações e endpoints para manter auditoria e documentação consistentes.

## Direção comercial sugerida

- Posicionamento: “piloto automático financeiro com rastreabilidade”.
- Manter verde profundo como cor de confiança e reservar âmbar/vermelho para exceções.
- Destacar na demonstração: cobrança de vencido, aprovação de despesa alta e conciliação sugerida.
- Usar sempre os dados realistas do seed, sem conteúdo genérico.

## Contratos estáveis

- Envelope `{ success, data, meta }`.
- Status financeiros em caixa alta.
- Eventos n8n e nomes das quatro automações.
- Escopo multiempresa e auditoria em todo comando financeiro.
