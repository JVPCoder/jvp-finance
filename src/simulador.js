// Regras do SIMULADOR_SOMA COOPERATIVA.xlsx + redutor IRRF 2026 (Lei 15.270/2025). Atualize aqui quando mudarem.
export const TABELA = {
  salarioMinimo: 1518,
  tetoProLabore: 8157.41,
  inssAliquota: 0.2,
  inssTeto: 1631.48,
  deducaoDependente: 189.59,
  // faixas mensais sobre a base (PL − INSS − dependentes): [até, alíquota, parcela a deduzir]
  faixasIrrf: [
    [2428.8, 0, 0],
    [2826.65, 0.075, 182.16],
    [3751.05, 0.15, 394.16],
    [4664.68, 0.225, 675.49],
    [Infinity, 0.275, 908.73],
  ],
  irrfMinimo: 10, // imposto ≤ 10 não é retido
  redutor: { isencaoAte: 5000, parcialAte: 7350, a: 978.62, b: 0.133145 },
  taxaAdm: 0.045,
};

export function calcularBruto({ diasUteis, horasDia, valorHora }) {
  return diasUteis * horasDia * valorHora;
}

function calcularIrrf(proLabore, inss, dependentes) {
  const { redutor, faixasIrrf, deducaoDependente, irrfMinimo } = TABELA;
  if (proLabore <= redutor.isencaoAte) return 0;

  const base = proLabore - inss - dependentes * deducaoDependente;
  const [, aliquota, deduzir] = faixasIrrf.find(([ate]) => base <= ate);
  let irrf = Math.max(base * aliquota - deduzir, 0);

  // redutor 2026 calculado sobre o rendimento bruto (pró-labore), limitado ao imposto
  if (proLabore <= redutor.parcialAte) {
    irrf -= Math.min(redutor.a - redutor.b * proLabore, irrf);
  }
  return irrf <= irrfMinimo ? 0 : irrf;
}

export function calcularRemuneracao({ bruto, proLabore, dependentes = 0, quotas = 0 }) {
  const inss = Math.min(proLabore * TABELA.inssAliquota, TABELA.inssTeto);
  const irrf = calcularIrrf(proLabore, inss, dependentes);
  const taxaAdm = bruto * TABELA.taxaAdm;
  const totalDesconto = inss + irrf + taxaAdm + quotas;
  return { bruto, proLabore, sobras: bruto - proLabore, inss, irrf, taxaAdm, quotas, totalDesconto, liquido: bruto - totalDesconto };
}
