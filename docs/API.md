# Catálogo de API

Todas as respostas usam o envelope `{ success, data, meta? }`. Em produção, todas as rotas devem resolver a empresa pela sessão autenticada.

| Método | Rota | Uso |
|---|---|---|
| GET | `/api/dashboard` | KPIs, fluxo, rankings e alertas críticos |
| GET | `/api/cashflow?days=30` | Projeção entre 7 e 90 dias |
| GET | `/api/receivables?status=&q=` | Lista e filtra recebíveis |
| PATCH | `/api/receivables/:id/status` | Atualiza status; body `{ status }` |
| POST | `/api/receivables/:id/collection` | Simula cobrança com proteção contra repetição em 60s |
| GET | `/api/payables?status=&q=` | Lista e filtra pagáveis |
| PATCH | `/api/payables/:id/status` | Aprova, paga ou altera status |
| GET | `/api/customers` | Clientes e consolidados |
| GET | `/api/suppliers` | Fornecedores e consolidados |
| GET | `/api/bank-transactions?status=` | Extrato e sugestões de match |
| POST | `/api/bank-transactions/:id/reconcile` | Body `{ action: "confirm" | "ignore" }` |
| GET | `/api/alerts?status=` | Alertas financeiros |
| POST | `/api/alerts/:id/resolve` | Resolve um alerta |
| GET | `/api/logs` | Auditoria, automações e cobranças |
| POST | `/api/automations/:name/run` | `collection`, `alerts`, `cashflow` ou `reconciliation` |
| POST | `/api/auth/login` | Login demo e cookie de sessão |
| POST | `/api/auth/logout` | Remove sessão demo |

## Eventos para n8n

Envelope sugerido:

```json
{
  "id": "evt_01...",
  "type": "receivable.overdue",
  "occurred_at": "2026-07-21T12:00:00.000Z",
  "company_id": "cmp_financeops_demo",
  "version": 1,
  "data": { "receivable_id": "rec_0001", "amount": 8490.00 }
}
```

Eventos previstos: `receivable.due_soon`, `receivable.overdue`, `payment.approved`, `alert.created` e `report.generated`. Assinar o corpo com HMAC, incluir uma chave de idempotência e usar retentativa exponencial.
