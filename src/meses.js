import { calcularBruto, calcularRemuneracao } from './simulador';

export const POTES = [
  { id: 'essenciais', nome: 'Essenciais' },
  { id: 'desejos', nome: 'Desejos' },
  { id: 'investimentos', nome: 'Investimentos' },
];

export const novoMes = (params, lancamentos = []) => ({ params, lancamentos });

export const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const dois = (n) => String(n).padStart(2, '0');

// mesmo dia no mês seguinte; 31/jan vira o último dia de fevereiro
function maisUmMes(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const [novoAno, novoMes] = mes === 12 ? [ano + 1, 1] : [ano, mes + 1];
  const ultimoDia = new Date(novoAno, novoMes, 0).getDate();
  return `${novoAno}-${dois(novoMes)}-${dois(Math.min(dia, ultimoDia))}`;
}

const herdavel = (l) => l.tipo === 'fixo' || (l.tipo === 'parcelado' && l.parcela.n < l.parcela.total);

export const herdarLancamentos = (anterior) =>
  anterior.lancamentos.filter(herdavel).map((l) => ({
    ...l,
    id: novoId(),
    data: maisUmMes(l.data),
    ...(l.tipo === 'parcelado' && { parcela: { ...l.parcela, n: l.parcela.n + 1 } }),
  }));

export const mesAnterior = (meses, chave) => Object.keys(meses).filter((k) => k < chave).sort().pop();

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
