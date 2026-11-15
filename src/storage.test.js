import { CHAVE, carregar, salvar, exportar, importar } from './storage';

const dados = {
  version: 1,
  meses: {
    '2026-12': {
      params: { diasUteis: 21, valorHora: 40, horasDia: 8, proLabore: 1621, dependentes: 0, quotas: 0,
                pct: { essenciais: 50, desejos: 20, investimentos: 30 } },
      lancamentos: [{ id: 'a', pote: 'desejos', origem: 'Quest 3', data: '2026-12-06', metodo: 'Crédito',
                      categoria: 'Games', valor: 353.34, tipo: 'parcelado', parcela: { n: 4, total: 10 } }],
    },
  },
};

beforeEach(() => localStorage.clear());

test('exportar → importar devolve dados idênticos', () => {
  expect(importar(exportar(dados))).toEqual(dados);
});

test('salvar → carregar devolve dados idênticos', () => {
  salvar(dados);
  expect(carregar()).toEqual(dados);
});

test('carregar sem nada salvo → vazio', () => {
  expect(carregar()).toEqual({ version: 1, meses: {} });
});

test.each([
  ['não é JSON', '{oops'],
  ['versão errada', '{"version":2,"meses":{}}'],
  ['sem meses', '{"version":1}'],
  ['mês sem lançamentos', '{"version":1,"meses":{"2026-12":{"params":{}}}}'],
  ['chave de mês inválida', '{"version":1,"meses":{"dezembro":{"params":{},"lancamentos":[]}}}'],
])('importar rejeita: %s', (_, texto) => {
  expect(() => importar(texto)).toThrow('Arquivo de backup inválido');
});

test('dados corrompidos no storage são preservados à parte, não perdidos', () => {
  localStorage.setItem(CHAVE, '{oops');
  expect(carregar()).toEqual({ version: 1, meses: {} });
  expect(localStorage.getItem(`${CHAVE}:corrompido`)).toBe('{oops');
});

test('localStorage indisponível → vazio', () => {
  const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado'); });
  expect(carregar()).toEqual({ version: 1, meses: {} });
  spy.mockRestore();
});
