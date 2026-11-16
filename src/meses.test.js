import { novoMes, resumoMes, ultimoMes, proximaChave, totaisPorPote, salvarLancamento, removerLancamento, categoriasUsadas, herdarLancamentos, mesAnterior } from './meses';

const params = { diasUteis: 20, valorHora: 40, horasDia: 8, proLabore: 1621, dependentes: 0, quotas: 0,
                 pct: { essenciais: 50, desejos: 20, investimentos: 30 } };

test('novoMes começa sem lançamentos', () => {
  expect(novoMes(params)).toEqual({ params, lancamentos: [] });
});

test('resumoMes calcula bruto, líquido e orçamento por pote', () => {
  const r = resumoMes(novoMes(params));
  expect(r.bruto).toBe(6400);
  expect(r.liquido).toBeCloseTo(5787.8, 2);
  expect(r.orcamentos.essenciais).toBeCloseTo(2893.9, 2);
  expect(r.orcamentos.desejos).toBeCloseTo(1157.56, 2);
  expect(r.orcamentos.investimentos).toBeCloseTo(1736.34, 2);
});

test('ultimoMes pega a maior chave', () => {
  expect(ultimoMes({ '2026-02': {}, '2026-11': {}, '2026-03': {} })).toBe('2026-11');
  expect(ultimoMes({})).toBeUndefined();
});

test('proximaChave vira o ano', () => {
  expect(proximaChave('2026-11')).toBe('2026-12');
  expect(proximaChave('2026-12')).toBe('2027-01');
});

const l = (id, pote, valor, categoria = '') => ({ id, pote, valor, categoria, origem: id, data: '2026-12-01', metodo: 'Pix', tipo: 'avulso' });

test('totaisPorPote soma gastos e calcula saldo', () => {
  const mes = { params, lancamentos: [l('a', 'desejos', 100), l('b', 'desejos', 57.56), l('c', 'essenciais', 3000)] };
  const t = totaisPorPote(mes);
  expect(t.desejos.gasto).toBeCloseTo(157.56, 2);
  expect(t.desejos.saldo).toBeCloseTo(1000, 2);
  expect(t.essenciais.saldo).toBeCloseTo(-106.1, 2);
  expect(t.investimentos.gasto).toBe(0);
});

test('salvarLancamento insere novo e substitui existente pelo id', () => {
  let mes = novoMes(params);
  mes = salvarLancamento(mes, l('a', 'desejos', 10));
  mes = salvarLancamento(mes, l('b', 'desejos', 20));
  mes = salvarLancamento(mes, { ...l('a', 'desejos', 99) });
  expect(mes.lancamentos.map((x) => [x.id, x.valor])).toEqual([['a', 99], ['b', 20]]);
});

test('removerLancamento tira só o id pedido', () => {
  const mes = { params, lancamentos: [l('a', 'desejos', 10), l('b', 'desejos', 20)] };
  expect(removerLancamento(mes, 'a').lancamentos.map((x) => x.id)).toEqual(['b']);
});

test('categoriasUsadas junta categorias únicas de todos os meses', () => {
  const meses = {
    '2026-11': { params, lancamentos: [l('a', 'desejos', 1, 'Games'), l('b', 'desejos', 1, '')] },
    '2026-12': { params, lancamentos: [l('c', 'essenciais', 1, 'Contas'), l('d', 'desejos', 1, 'Games')] },
  };
  expect(categoriasUsadas(meses)).toEqual(['Contas', 'Games']);
});

test('herdarLancamentos: fixo copia, parcela avança, última parcela e avulso somem', () => {
  const anterior = {
    params,
    lancamentos: [
      { ...l('academia', 'essenciais', 150), tipo: 'fixo', data: '2026-11-15' },
      { ...l('quest', 'desejos', 353.34), tipo: 'parcelado', parcela: { n: 9, total: 10 }, data: '2026-11-06' },
      { ...l('tv', 'desejos', 200), tipo: 'parcelado', parcela: { n: 10, total: 10 }, data: '2026-11-06' },
      { ...l('ifood', 'desejos', 49), tipo: 'avulso', data: '2026-11-18' },
    ],
  };
  const herdados = herdarLancamentos(anterior);
  expect(herdados.map((x) => [x.origem, x.data, x.parcela?.n])).toEqual([
    ['academia', '2026-12-15', undefined],
    ['quest', '2026-12-06', 10],
  ]);
  expect(herdados.map((x) => x.id)).not.toContain('academia');
  expect(new Set(herdados.map((x) => x.id)).size).toBe(2);
  expect(anterior.lancamentos[1].parcela.n).toBe(9); // não muta o anterior
});

test('herdarLancamentos: dia 31 vira o último dia do mês seguinte', () => {
  const anterior = { params, lancamentos: [{ ...l('aluguel', 'essenciais', 1505), tipo: 'fixo', data: '2026-01-31' }] };
  expect(herdarLancamentos(anterior)[0].data).toBe('2026-02-28');
});

test('mesAnterior pega o mês mais recente antes da chave', () => {
  const meses = { '2026-09': {}, '2026-11': {}, '2027-01': {} };
  expect(mesAnterior(meses, '2026-12')).toBe('2026-11');
  expect(mesAnterior(meses, '2026-09')).toBeUndefined();
});
