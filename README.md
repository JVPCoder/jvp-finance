# JVP Finance

App web pessoal para planejar a renda e controlar os gastos mês a mês. Substitui duas planilhas: um simulador de remuneração de cooperativa (renda por hora) e uma planilha de gastos dividida em potes.

Roda no navegador do PC, sem login e sem servidor. Os dados ficam no `localStorage`, com backup em JSON.

## O que faz

- **Previsão da renda:** ao criar o mês, você informa dias úteis, horas por dia e valor da hora. O app calcula o bruto e chega ao líquido descontando INSS, IRRF, taxa administrativa e quotas.
- **Potes:** o líquido é dividido em Essenciais, Desejos e Investimentos, com percentuais definidos a cada mês.
- **Lançamentos:** cada gasto entra num pote (origem, data, método, categoria e valor), e cada pote mostra quanto foi gasto e quanto ainda resta.
- **Mês seguinte sem retrabalho:** o mês novo já nasce com os lançamentos fixos e as parcelas do anterior, com as parcelas avançadas (3/10 → 4/10). Os parâmetros vêm preenchidos e só os dias úteis ficam em branco.
- **Gamificação:**
  - **Sequência:** conta os meses seguidos em que os Desejos ficaram dentro do orçamento e a meta de investimento foi batida.
  - **Dívida do cartão:** barra de progresso das parcelas no crédito.
- **Backup:** exporta e importa todos os dados em `.json`. O arquivo é validado antes de importar e a importação pede confirmação.

## Como rodar

Requer Node.js 18 ou superior.

```bash
npm install
npm start                        # abre em http://localhost:3000
npm test -- --watchAll=false     # roda os testes uma vez
npm run build                    # gera a versão de produção em build/
```

## Cálculo da remuneração

As regras ficam no objeto `TABELA`, em `src/simulador.js`. Quando alíquotas ou faixas mudarem, é só atualizar ali.

| Item | Regra |
|---|---|
| Bruto | dias úteis × horas por dia × valor da hora |
| Antecipação de sobras | bruto − pró-labore (isenta) |
| INSS | 20% do pró-labore, com teto de R$ 1.631,48 |
| IRRF | tabela progressiva mensal sobre pró-labore − INSS − dependentes |
| Redutor IRRF 2026 | pró-labore até R$ 5.000 não paga; entre R$ 5.000 e R$ 7.350 desconta 978,62 − 0,133145 × pró-labore (Lei 15.270/2025) |
| Taxa adm | 4,5% do bruto |
| Líquido | bruto − (INSS + IRRF + taxa adm + quotas) |

## Estrutura

```
src/
  simulador.js        cálculo bruto → líquido (funções puras)
  meses.js            potes, herança de lançamentos, sequência e dívida (funções puras)
  storage.js          localStorage e backup JSON com validação
  formato.js          moeda (BRL) e nome do mês
  App.js              estado e navegação entre páginas
  components/         Dashboard, Meses, MesForm, Lancamentos, Gamificacao, Backup...
  *.test.js           testes ao lado do código
```

As regras de negócio ficam em funções puras, testadas sem React. Os componentes só chamam essas funções e mostram o resultado.

## Stack

React 19 com Create React App, CSS puro com modo escuro automático, fontes Bricolage Grotesque e Geist (locais, via Fontsource), ícones [Phosphor](https://phosphoricons.com/) e testes com Jest e Testing Library. Dois componentes do [React Bits](https://reactbits.dev) em `src/components/reactbits/` (Counter no saldo, SloshGauge nos potes; licença MIT + Commons Clause) e o AlertDialog do Radix (a base do shadcn/ui) nas confirmações.

## Dados e privacidade

Nada sai do navegador. Limpar os dados do site apaga tudo, então exporte um backup de vez em quando pela página **Backup**.
