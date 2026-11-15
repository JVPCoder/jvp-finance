# Spec: jvp-finance

Fonte da intenção: `docs/intent/jvp-finance.md`.

## Objetivo

App web pessoal (só o João, no PC) que substitui `Meus Gastos.xlsx` + `SIMULADOR_SOMA COOPERATIVA.xlsx`.
Previsão primeiro (quanto vou receber líquido), controle depois (quanto sobra em cada pote).
Dor que resolve: recriar o mês à mão (duplicar aba, recopiar fixos, avançar parcelas, refazer o simulador).

### Histórias / critérios de aceite

1. **Criar mês** — Escolho o mês (ex.: 2026-12). O app pergunta:
   dias úteis, valor da hora, horas/dia (padrão 8), pró-labore, dependentes, quotas do mês (padrão 0),
   e % de Essenciais / Desejos / Investimentos (devem somar 100).
   Campos exceto dias úteis vêm pré-preenchidos do mês anterior.
   - Bruto = dias úteis × horas/dia × valor da hora.
   - Mostra a quebra do simulador: bruto, pró-labore, antecipação de sobras, INSS, IRRF, taxa adm, quotas, total desconto, **líquido**.
   - Orçamento de cada pote = líquido × %.
2. **Herança** — O mês novo nasce com os lançamentos do mês anterior marcados como *fixo* ou *parcelado*:
   - fixo → copiado igual, data +1 mês;
   - parcelado `n/N` com n < N → copiado como `n+1/N`, data +1 mês; com n = N → não copia.
   - O mês é editável depois (dá para apagar/editar herdados).
3. **Lançamentos** — Em cada pote: Origem, Data, Método (Pix/Crédito/Débito/Dinheiro), Categoria (texto livre com sugestões dos valores já usados), Valor, tipo (avulso/fixo/parcelado + `n/N`).
   Por pote: total gasto e saldo (orçamento − total). Saldo negativo em destaque.
4. **Navegação** — Layout com sidebar (Dashboard, Novo mês, Meses, Backup; vira barra no topo em tela estreita) e **dashboard** com as principais informações do mês mais recente (líquido, quebra, potes, gamificação). Página Meses: lista (mais recente primeiro); abrir, editar parâmetros (recalcula), excluir mês (com confirmação). Páginas são `useState`, sem roteador.
5. **Gamificação**
   - **Streak**: meses consecutivos (do mais recente para trás) em que Desejos ≤ orçamento **e** Investimentos ≥ orçamento. Mês corrente aparece como "em andamento" se ainda não bateu.
   - **Dívida do cartão**: soma das parcelas restantes de lançamentos parcelados com Método = Crédito, no mês mais recente: Σ (N − n) × valor. Barra = pago / (pago + restante), com "faltam X parcelas · R$ Y".
6. **Backup** — Exportar todos os dados como `.json`; importar `.json` substitui os dados (com confirmação). Arquivo inválido → mensagem de erro, dados atuais intactos.
7. **Persistência** — Tudo em `localStorage` (chave `jvp-finance:v1`), salvo a cada alteração.

### Regras do simulador (planilha + redutor IRRF 2026, Lei 15.270/2025)

Constantes num único objeto `TABELA` em `src/simulador.js` para atualizar quando mudarem:

| Item | Regra |
|---|---|
| Antecipação de sobras | bruto − pró-labore (isenta) |
| INSS | min(pró-labore × 20%, 1631,48) |
| IRRF | se pró-labore ≤ 2428,80 → 0; senão base = PL − INSS − dependentes × 189,59; faixas: ≤2826,65 → 7,5% − 182,16; ≤3751,05 → 15% − 394,16; ≤4664,68 → 22,5% − 675,49; acima → 27,5% − 908,73 (tabela progressiva mensal, igual à planilha). **Redutor 2026** sobre o pró-labore bruto (X): X ≤ 5000 → IRRF 0; 5000 < X ≤ 7350 → IRRF − min(978,62 − 0,133145 × X, IRRF); X > 7350 → sem redutor. Resultado ≤ 10 → 0 |
| Taxa adm | bruto × 4,5% |
| Quotas | valor informado no mês (R$ 10 nas 5 primeiras parcelas, 0 depois) |
| Líquido | bruto − (INSS + IRRF + taxa adm + quotas) |

Pró-labore validado entre salário mínimo (R$ 1.518,00) e teto (R$ 8.157,41).

Valores de referência (viram testes). Linhas 1, 3, 4 = cache da planilha (redutor não altera);
linha 2 muda com o redutor (planilha dava IRRF 27,84 / líquido 4037,16); linha 5 calculada à mão para a faixa parcial:

| Bruto | PL | Dep | Quotas | INSS | IRRF | Taxa | Líquido |
|---|---|---|---|---|---|---|---|
| 6400 | 1621 | 0 | 0 | 324,20 | 0 | 288 | 5787,80 |
| 5000 | 3500 | 0 | 10 | 700 | 0 | 225 | 4065,00 |
| 10000 | 8500 | 0 | 10 | 1631,48 | 980,11 | 450 | 6928,41 |
| 20000 | 10000 | 0 | 10 | 1631,48 | 1392,61 | 900 | 16065,91 |
| 8000 | 6000 | 0 | 0 | 1200 | 231,52 | 360 | 6208,48 |

Linha 5: base 4800 → 27,5% − 908,73 = 411,27; redutor 978,62 − 0,133145 × 6000 = 179,75 → 231,52.
(Linhas 3 e 4 usam PL acima do teto; o app valida no formulário, mas a função pura aceita qualquer PL.)

## Tech Stack

React 19 + Create React App (`react-scripts` 5) já existentes, JavaScript, CSS puro. **Sem dependências novas.**
Datas com `Date`/`Intl`; moeda com `Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`.

## Comandos

```
Dev:   npm start
Test:  npm test -- --watchAll=false
Build: npm run build
```

## Estrutura

```
src/simulador.js       → calcularRemuneracao(params) — função pura + TABELA
src/meses.js           → criarMes(anterior, params), herdar, totais por pote, streak, dívida — funções puras
src/storage.js         → load/save localStorage, exportar/importar JSON (validação)
src/App.js             → estado (useState + useEffect p/ salvar), lista de meses / mês aberto
src/components/*.js    → MesForm, Pote, LancamentoForm, Gamificacao (só se App.js passar de ~300 linhas)
src/*.test.js          → testes ao lado do código
```

### Modelo de dados

```js
{
  version: 1,
  meses: {
    "2026-12": {
      params: { diasUteis: 21, valorHora: 40, horasDia: 8, proLabore: 1621, dependentes: 0, quotas: 0,
                pct: { essenciais: 50, desejos: 20, investimentos: 30 } },
      lancamentos: [
        { id: "uuid", pote: "desejos", origem: "Quest 3", data: "2026-12-06", metodo: "Crédito",
          categoria: "Games", valor: 353.34, tipo: "parcelado", parcela: { n: 4, total: 10 } }
      ]
    }
  }
}
```

Valores derivados (bruto, líquido, orçamentos, totais) **não são salvos** — sempre calculados.

## Code Style

```js
// src/simulador.js
export const TABELA = { inssAliquota: 0.2, inssTeto: 1631.48, taxaAdm: 0.045, /* ... */ };

export function calcularRemuneracao({ bruto, proLabore, dependentes = 0, quotas = 0 }) {
  const inss = Math.min(proLabore * TABELA.inssAliquota, TABELA.inssTeto);
  const irrf = calcularIrrf(proLabore, inss, dependentes);
  const taxaAdm = bruto * TABELA.taxaAdm;
  const totalDesconto = inss + irrf + taxaAdm + quotas;
  return { bruto, proLabore, sobras: bruto - proLabore, inss, irrf, taxaAdm, quotas, totalDesconto, liquido: bruto - totalDesconto };
}
```

Nomes de domínio em português (mês, pote, lançamento), funções puras para regras, componentes sem lógica de cálculo. Arredondar só na exibição.

## Testes

Jest + Testing Library (já vêm no CRA).
- `simulador.test.js`: as 4 linhas da tabela de referência (tolerância 0,01) + IRRF zero ≤ 2428,80 + dependentes.
- `meses.test.js`: herança (fixo, parcela avança, parcela final some), totais/saldo, streak, dívida.
- `storage.test.js`: exportar → importar ida-e-volta; JSON inválido rejeitado.
- UI: um teste de fumaça (cria mês, lança gasto, saldo atualiza). Sem cobertura mínima formal.

## Limites

- **Sempre:** testes passando antes de commit; regras de cálculo só em funções puras; confirmar antes de apagar mês/importar.
- **Perguntar antes:** adicionar dependência; mudar formato do `localStorage` (exige migração de `version`); mudar regras do simulador.
- **Nunca:** enviar dados para fora do navegador; commitar backups JSON reais; apagar dados sem confirmação.

## Critérios de sucesso

- [ ] Os 5 casos de referência batem (±R$ 0,01).
- [ ] Criar o mês seguinte herda fixos e avança parcelas sem digitação extra; só preencho dias úteis (e ajusto o que mudou).
- [ ] Saldos dos 3 potes atualizam ao lançar/editar/apagar.
- [ ] Streak e barra de dívida refletem as regras acima.
- [ ] Recarregar a página mantém tudo; exportar/importar restaura idêntico.
- [ ] `npm test -- --watchAll=false` e `npm run build` passam.

## Decisões (2026-11-15)

1. **IRRF:** aplica o redutor de 2026 (Lei 15.270/2025) sobre o pró-labore bruto. Tabela progressiva mantida igual à planilha.
2. **Dívida do cartão:** só parcelas restantes no Crédito; sem saldo manual.
3. **Primeiro mês:** campos em branco, %s padrão 50/20/30.
