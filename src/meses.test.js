import { novoMes, resumoMes, ultimoMes, proximaChave } from './meses';

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
