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
