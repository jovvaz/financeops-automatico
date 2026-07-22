# Arquitetura e regras de negócio

## Decisões principais

1. **Multiempresa desde o domínio.** Todas as entidades operacionais contêm `company_id`, índices compostos e relações com exclusão em cascata quando apropriado.
2. **Comandos explícitos.** Aprovar pagamento, simular cobrança e confirmar conciliação são endpoints próprios; isso melhora autorização, auditoria e idempotência.
3. **Demo sem dependência externa.** A camada `store` permite validação imediata. O schema e o seed representam a persistência de produção em PostgreSQL.
4. **Serviços sem UI.** Cálculo de KPIs, projeção, régua, alertas e conciliação ficam em `lib/services.ts`, facilitando posterior execução por fila, cron, n8n ou Kestra.

## Regras

- Recebível/payable é considerado aberto em `PENDING`, `APPROVED` ou `OVERDUE`.
- A projeção diária soma entradas e subtrai saídas pela data de vencimento.
- Cobrança manual repetida em menos de 60 segundos retorna o evento anterior.
- A régua automática contempla D-3, D0, D+2, D+7 e D+15.
- Despesas abertas acima de R$ 20 mil geram alerta alto uma única vez.
- Confirmação e descarte de conciliação geram auditoria.
- Cada pagamento persistente deve usar uma `idempotency_key` fornecida pelo backend.

## Matriz de papéis recomendada

| Ação | Admin | Financeiro | Aprovador | Visualizador |
|---|:---:|:---:|:---:|:---:|
| Consultar módulos | ✓ | ✓ | ✓ | ✓ |
| Baixar recebível | ✓ | ✓ |  |  |
| Simular cobrança | ✓ | ✓ |  |  |
| Criar/editar pagável | ✓ | ✓ |  |  |
| Aprovar pagamento | ✓ |  | ✓ |  |
| Confirmar conciliação | ✓ | ✓ |  |  |
| Resolver alerta | ✓ | ✓ | ✓ |  |
| Configurar integração | ✓ |  |  |  |

## Evolução para persistência plena

- Implementar `PrismaRepository` com a mesma interface do store demo.
- Resolver `company_id`, `user_id` e papel exclusivamente no servidor.
- Envolver baixa + pagamento + auditoria em transação Prisma.
- Usar outbox transacional para eventos destinados ao n8n.
- Mover automações para fila/Kestra e registrar heartbeat/retentativas.
- Criptografar `Integration.encryptedCredentials` com KMS e rotação de chave.
