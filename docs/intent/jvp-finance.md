# jvp-finance — Intenção confirmada (2026-11-15)

Substituir as planilhas `docs/Meus Gastos.xlsx` e `docs/SIMULADOR_SOMA COOPERATIVA.xlsx`
por um app web pessoal, organizado por meses: **previsão primeiro, controle de gastos depois**.

- **Dor principal:** recriar o mês todo mês — duplicar aba, recopiar fixos/assinaturas,
  avançar parcelas (2/10 → 3/10) e refazer a conta do líquido no simulador.
- **Criar mês:** pergunta dias úteis, valor da hora e percentuais dos 3 potes
  (Essenciais / Desejos / Investimentos — definidos a cada mês).
  - Bruto = dias úteis × 8h × valor da hora.
  - Líquido via regras do simulador: pró-labore, INSS 20% (teto), IRRF progressivo
    com dependentes, taxa adm 4,5% sobre o bruto, quotas.
  - Pró-labore, dependentes e horas/dia vêm pré-preenchidos do mês anterior.
- **Herança:** mês novo nasce com fixos, assinaturas e parcelas do anterior;
  parcelas avançam sozinhas e somem ao terminar.
- **Controle:** lançamentos por pote (Origem, Data, Método, Categoria, Valor),
  com total e saldo restante por pote. "Pai" é lançamento manual.
- **Gamificação:** streak de meses dentro do orçamento + meta de investimento batida;
  barra de progresso da dívida do cartão (parcelas e valor restantes).
- **Restrição:** web no PC (React/CRA existente), sem login/servidor,
  dados em localStorage + exportar/importar backup JSON.
- **Fora do escopo:** celular/sync, integração com banco/cartão, IMPORTRANGE do "Pai",
  importar planilhas antigas, gráficos/relatórios além dos saldos, pontos/níveis/medalhas.

## Observação sobre as planilhas
Em "Meus Gastos", rótulos e fórmulas dos potes divergem (FEV: "Desejos (20%)" calcula 30%,
"Investimentos (30%)" calcula 20%). O app usa um único percentual por pote, definido na criação do mês.
