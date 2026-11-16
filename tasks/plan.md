# Plano de implementação: jvp-finance

## Visão geral
Implementar a `SPEC.md` no CRA existente em fatias verticais: primeiro o cálculo (maior risco: dinheiro),
depois o fluxo "criar mês → lançar gastos", depois herança, gamificação e backup.
Detalhes de cada tarefa em `tasks/todo.md`.

## Decisões de arquitetura
- **Regras em funções puras** (`simulador.js`, `meses.js`), testadas sem React. A UI só chama e exibe.
- **Estado único** em `App.js` (`useState` com o objeto `{version, meses}`) + `useEffect` que salva no localStorage. Sem Redux/Context — um usuário, uma tela.
- **Derivados nunca salvos** (bruto, líquido, orçamentos, totais, streak, dívida) — recalculados a cada render; volume é minúsculo.
- **Sem dependências novas, sem roteador**: "mês aberto" é um `useState` com a chave `YYYY-MM`.
- **UI**: toda tarefa com interface é implementada seguindo a skill `frontend-ui-engineering` (acessível, responsiva, sem cara de template), CSS puro em `App.css` com tokens em `:root`.
- Componentes em `src/components/` só quando `App.js` ficaria grande demais — não criar arquivo por antecipação.

## Grafo de dependências
```
simulador.js ──┐
storage.js ────┼─> App (criar mês) ─> lançamentos ─> herança/navegação ─> gamificação
meses.js ──────┘                                                        └> backup UI
```

## Lista de tarefas

### Fase 1: Fundação
- [x] T1: Simulador (cálculo + testes de referência)
- [x] T2: Storage (localStorage + exportar/importar JSON + testes)

### Checkpoint 1
- [x] `npm test -- --watchAll=false` verde; 5 casos do simulador batem

### Fase 2: Fluxo principal
- [x] T3: Criar primeiro mês e ver quebra do líquido + orçamentos (UI)
- [x] T4: Lançamentos por pote com total e saldo (UI)

### Checkpoint 2
- [x] Criar mês → lançar gasto → saldo atualiza → recarregar mantém. Revisão com o João.

### Fase 3: Fim da dor (recriar mês)
- [x] T5: Lista de meses + criar mês seguinte com herança
- [x] T6: Editar parâmetros e excluir mês

### Checkpoint 3
- [x] Mês seguinte nasce com fixos e parcelas avançadas; só digito dias úteis

### Fase 4: Motivação e segurança
- [x] T7: Gamificação (streak + barra da dívida)
- [x] T8: Backup UI (exportar/importar)
- [x] T9: Teste de fumaça + passe final de acessibilidade/responsividade

### Checkpoint final
- [x] Todos os critérios de sucesso da `SPEC.md`; `npm run build` passa

## Riscos e mitigações
| Risco | Impacto | Mitigação |
|---|---|---|
| Erro no cálculo do IRRF/redutor | Alto | T1 primeiro, TDD com os 5 casos da spec |
| Perder dados do localStorage (limpar navegador) | Alto | Backup JSON (T8); lembrete visível de exportar |
| JSON importado corrompido apaga dados | Médio | Validar antes de substituir; nada muda se inválido |
| Arredondamento acumulado | Baixo | Calcular em float, arredondar só na exibição; testes com tolerância 0,01 |
| Redutor 2026 contestado no STF | Baixo | Constantes isoladas em `TABELA` |

## Perguntas em aberto
Nenhuma.
