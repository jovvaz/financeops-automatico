# Orquestração

Os YAMLs são exemplos de referência para Kestra. Ajuste namespace, plugin de banco, secrets e URLs no ambiente de destino.

- `daily-bank-sync.yml`: ingere extrato fictício/ERP.
- `daily-cashflow-snapshot.yml`: dispara snapshot diário.
- `weekly-financial-report.yml`: gera e publica resumo semanal.
- `reconciliation-pipeline.yml`: executa conciliação em lote.
- `import-demo-spreadsheets.yml`: valida e importa CSV/XLSX.

O diretório `n8n/` documenta eventos e um webhook de entrada. n8n fica responsável por integrações orientadas a evento; Kestra, por jobs agendados e pipelines em lote.
