# Eventos para n8n

Assinar cada requisição com `X-FinanceOps-Signature` (HMAC SHA-256), enviar `X-Idempotency-Key` e repetir apenas respostas 429/5xx.

| Evento | Destinos típicos |
|---|---|
| `receivable.due_soon` | E-mail/WhatsApp amigável |
| `receivable.overdue` | Régua de atraso e CRM |
| `payment.approved` | ERP, banco e aprovador |
| `alert.created` | Slack, Teams ou e-mail |
| `report.generated` | Drive, e-mail ou portal |

Nenhum fluxo deve receber tokens bancários no payload. Envie apenas IDs e recupere dados por uma API autenticada e com escopo de empresa.
