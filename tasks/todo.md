# Tarefas: jvp-finance

Comandos: `npm test -- --watchAll=false` · `npm run build` · `npm start`
Tarefas marcadas **[UI]** seguem a skill `frontend-ui-engineering`.

## T1: Simulador
Função pura `calcularRemuneracao({bruto, proLabore, dependentes, quotas})` + `TABELA` com as regras da spec (INSS, IRRF progressivo, redutor 2026, taxa adm). Também `calcularBruto({diasUteis, horasDia, valorHora})`.
- [x] Os 5 casos de referência da spec batem (±0,01)
- [x] IRRF 0 com PL ≤ 5000; redutor parcial entre 5000 e 7350; dependentes reduzem a base
- Verificar: `npm test -- --watchAll=false`
- Depende de: —
- Arquivos: `src/simulador.js`, `src/simulador.test.js` · Tamanho: S

## T2: Storage
`carregar()`, `salvar(dados)` (chave `jvp-finance:v1`), `exportar(dados)` (string JSON), `importar(texto)` (valida `version` e `meses`; lança erro se inválido).
- [x] Ida e volta exportar → importar devolve dados idênticos
- [x] JSON inválido/estrutura errada → erro, sem efeito colateral
- [x] `carregar()` sem nada salvo ou com localStorage indisponível → `{version:1, meses:{}}`
- Verificar: `npm test -- --watchAll=false`
- Depende de: —
- Arquivos: `src/storage.js`, `src/storage.test.js` · Tamanho: S

### Checkpoint 1 — testes verdes, 5 casos do simulador batem

## T3: Criar primeiro mês **[UI]**
Remover boilerplate do CRA (logo, reportWebVitals). Tela vazia → "Criar mês" com formulário (mês, dias úteis, valor hora, horas/dia=8, pró-labore, dependentes, quotas, %s 50/20/30 que devem somar 100; PL entre 1518 e 8157,41). Ao salvar, abre o mês mostrando a quebra do simulador e o orçamento de cada pote. `meses.js`: `novoMes(params)`, `orcamentos(mes)`.
- [x] Formulário valida (%s ≠ 100, PL fora da faixa, campos vazios) com mensagens acessíveis
- [x] Quebra do líquido em BRL e orçamentos por pote exibidos
- [x] Recarregar a página mantém o mês
- [x] Sidebar + dashboard (pedido do João); paleta revisada com `design-taste-frontend`
- Verificar: testes + `npm start` manual
- Depende de: T1, T2
- Arquivos: `src/App.js`, `src/App.css`, `src/meses.js`, `src/meses.test.js`, `src/index.js` · Tamanho: M

## T4: Lançamentos por pote **[UI]**
Em cada pote: adicionar/editar/apagar lançamento (Origem, Data, Método, Categoria com `<datalist>` dos já usados, Valor, tipo avulso/fixo/parcelado + n/N). Total e saldo por pote; saldo negativo destacado. `meses.js`: `totaisPorPote(mes)`.
- [x] CRUD de lançamento funciona e persiste
- [x] Total e saldo corretos (teste unitário de `totaisPorPote`)
- [x] Parcelado exige n ≤ N
- Verificar: testes + manual
- Depende de: T3
- Arquivos: `src/App.js`, `src/App.css`, `src/meses.js`, `src/meses.test.js` (+ `src/components/Pote.js` se App.js crescer) · Tamanho: M

### Checkpoint 2 — criar mês → lançar → saldo atualiza → recarregar mantém; revisar com o João

## T5: Lista de meses + mês seguinte com herança **[UI]**
Lista de meses (recente primeiro) com líquido e saldo total; abrir mês. "Criar próximo mês": `herdarLancamentos(anterior)` — fixo copia (data +1 mês), parcelado n<N vira n+1, n=N some; params pré-preenchidos do anterior exceto dias úteis.
- [x] Testes de herança: fixo, parcela avança, parcela final some, data 31/jan → fim de fev
- [x] Mês seguinte criado só preenchendo dias úteis
- Verificar: testes + manual
- Depende de: T4
- Arquivos: `src/meses.js`, `src/meses.test.js`, `src/App.js`, `src/App.css` · Tamanho: M

## T6: Editar parâmetros e excluir mês **[UI]**
Reabrir o formulário do mês com valores atuais (recalcula tudo); excluir mês com confirmação.
- [x] Editar dias úteis muda líquido e orçamentos na hora
- [x] Excluir pede confirmação e remove do storage
- Verificar: manual
- Depende de: T5
- Arquivos: `src/App.js` · Tamanho: S

### Checkpoint 3 — dor principal resolvida

## T7: Gamificação **[UI]**
`streak(meses)` e `dividaCartao(meses)` em `meses.js` conforme spec; card com streak (mês atual "em andamento") e barra de progresso da dívida (`<progress>` nativo, "faltam X parcelas · R$ Y").
- [ ] Testes: streak quebra quando Desejos estoura ou Investimentos não bate; dívida soma (N−n)×valor só de Crédito
- [ ] Card visível na tela inicial
- Verificar: testes + manual
- Depende de: T5
- Arquivos: `src/meses.js`, `src/meses.test.js`, `src/App.js`, `src/App.css` · Tamanho: M

## T8: Backup UI **[UI]**
Botão exportar (download `jvp-finance-AAAA-MM-DD.json` via Blob) e importar (`<input type="file">` + confirmação; erro amigável se inválido).
- [ ] Exportar → apagar localStorage → importar restaura tudo
- [ ] Arquivo inválido mostra erro e não altera dados
- Verificar: manual
- Depende de: T2, T3
- Arquivos: `src/App.js` · Tamanho: S

## T9: Teste de fumaça + passe final **[UI]**
`App.test.js`: cria mês, lança gasto, saldo atualiza. Revisar acessibilidade (labels, foco, contraste, teclado) e layout em janela estreita.
- [ ] Teste de fumaça verde
- [ ] `npm run build` sem warnings de lint
- Depende de: T1–T8
- Arquivos: `src/App.test.js`, `src/App.css` · Tamanho: S

### Checkpoint final — critérios de sucesso da SPEC.md atendidos
