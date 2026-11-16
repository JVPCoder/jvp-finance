import { calcularBruto, calcularRemuneracao } from './simulador';

export const POTES = [
  { id: 'essenciais', nome: 'Essenciais' },
  { id: 'desejos', nome: 'Desejos' },
  { id: 'investimentos', nome: 'Investimentos' },
];

export const novoMes = (params) => ({ params, lancamentos: [] });

export function resumoMes({ params }) {
  const bruto = calcularBruto(params);
  const r = calcularRemuneracao({ bruto, proLabore: params.proLabore, dependentes: params.dependentes, quotas: params.quotas });
  const orcamentos = Object.fromEntries(POTES.map((p) => [p.id, (r.liquido * params.pct[p.id]) / 100]));
  return { ...r, orcamentos };
}

export const ultimoMes = (meses) => Object.keys(meses).sort().pop();

export function proximaChave(chave) {
  const [ano, mes] = chave.split('-').map(Number);
  return mes === 12 ? `${ano + 1}-01` : `${ano}-${String(mes + 1).padStart(2, '0')}`;
}

export const METODOS = ['Pix', 'Crédito', 'Débito', 'Dinheiro'];

export function totaisPorPote(mes) {
  const { orcamentos } = resumoMes(mes);
  return Object.fromEntries(
    POTES.map((p) => {
      const gasto = mes.lancamentos.filter((l) => l.pote === p.id).reduce((s, l) => s + l.valor, 0);
      return [p.id, { orcamento: orcamentos[p.id], gasto, saldo: orcamentos[p.id] - gasto }];
    }),
  );
}

export const salvarLancamento = (mes, lanc) => ({
  ...mes,
  lancamentos: mes.lancamentos.some((l) => l.id === lanc.id)
    ? mes.lancamentos.map((l) => (l.id === lanc.id ? lanc : l))
    : [...mes.lancamentos, lanc],
});

export const removerLancamento = (mes, id) => ({ ...mes, lancamentos: mes.lancamentos.filter((l) => l.id !== id) });

export const categoriasUsadas = (meses) =>
  [...new Set(Object.values(meses).flatMap((m) => m.lancamentos.map((l) => l.categoria)).filter(Boolean))].sort();
