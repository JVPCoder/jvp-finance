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

// CLT: salário já é o líquido. PJ (ou mês antigo sem regime): calcula pela cooperativa.
export const ehClt = (params) => params.regime === 'clt';

export function resumoMes({ params }) {
  const r = ehClt(params)
    ? { liquido: params.salario }
    : calcularRemuneracao({ bruto: calcularBruto(params), proLabore: params.proLabore, dependentes: params.dependentes, quotas: params.quotas });
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

const CENTAVO = 0.005;

export function bateuMetas(mes) {
  const t = totaisPorPote(mes);
  return t.desejos.saldo >= -CENTAVO && t.investimentos.saldo <= CENTAVO;
}

// meses seguidos (no calendário) que bateram as metas; o mais recente sem meta fica "em andamento"
export function streak(meses) {
  const chaves = Object.keys(meses).sort().reverse();
  if (chaves.length === 0) return { meses: 0, emAndamento: false };
  const emAndamento = !bateuMetas(meses[chaves[0]]);
  let contagem = 0;
  for (let i = emAndamento ? 1 : 0; i < chaves.length; i++) {
    const seguido = i === 0 || proximaChave(chaves[i]) === chaves[i - 1];
    if (!seguido || !bateuMetas(meses[chaves[i]])) break;
    contagem++;
  }
  return { meses: contagem, emAndamento };
}

// parcelas no crédito do mês mais recente; a parcela do mês conta como paga
export function dividaCartao(meses) {
  const chave = ultimoMes(meses);
  const parcelas = chave ? meses[chave].lancamentos.filter((l) => l.tipo === 'parcelado' && l.metodo === 'Crédito') : [];
  if (parcelas.length === 0) return null;
  return parcelas.reduce(
    (d, l) => ({
      pago: d.pago + l.parcela.n * l.valor,
      restante: d.restante + (l.parcela.total - l.parcela.n) * l.valor,
      parcelasRestantes: d.parcelasRestantes + l.parcela.total - l.parcela.n,
    }),
    { pago: 0, restante: 0, parcelasRestantes: 0 },
  );
}

// quanto do líquido ainda sobra depois de tudo que foi lançado no mês (crédito incluso)
export function saldoMes(mes) {
  const { liquido } = resumoMes(mes);
  const soma = (ls) => ls.reduce((s, l) => s + l.valor, 0);
  const gasto = soma(mes.lancamentos);
  return { liquido, gasto, credito: soma(mes.lancamentos.filter((l) => l.metodo === 'Crédito')), saldo: liquido - gasto };
}
