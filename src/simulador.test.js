import { calcularBruto, calcularRemuneracao } from './simulador';

// SPEC.md — valores de referência
const casos = [
  { bruto: 6400, proLabore: 1621, quotas: 0, inss: 324.2, irrf: 0, taxaAdm: 288, liquido: 5787.8 },
  { bruto: 5000, proLabore: 3500, quotas: 10, inss: 700, irrf: 0, taxaAdm: 225, liquido: 4065 },
  { bruto: 10000, proLabore: 8500, quotas: 10, inss: 1631.48, irrf: 980.11, taxaAdm: 450, liquido: 6928.41 },
  { bruto: 20000, proLabore: 10000, quotas: 10, inss: 1631.48, irrf: 1392.61, taxaAdm: 900, liquido: 16065.91 },
  { bruto: 8000, proLabore: 6000, quotas: 0, inss: 1200, irrf: 231.52, taxaAdm: 360, liquido: 6208.48 },
];

test.each(casos)('bruto $bruto / PL $proLabore → líquido $liquido', (c) => {
  const r = calcularRemuneracao({ bruto: c.bruto, proLabore: c.proLabore, quotas: c.quotas });
  expect(r.inss).toBeCloseTo(c.inss, 2);
  expect(r.irrf).toBeCloseTo(c.irrf, 2);
  expect(r.taxaAdm).toBeCloseTo(c.taxaAdm, 2);
  expect(r.sobras).toBeCloseTo(c.bruto - c.proLabore, 2);
  expect(r.liquido).toBeCloseTo(c.liquido, 2);
});

test('IRRF zero até PL 5000 (redutor 2026)', () => {
  expect(calcularRemuneracao({ bruto: 9000, proLabore: 5000 }).irrf).toBe(0);
});

test('acima de 7350 não há redutor', () => {
  // PL 7400: INSS 1480, base 5920 → 27,5% − 908,73 = 719,27
  expect(calcularRemuneracao({ bruto: 9000, proLabore: 7400 }).irrf).toBeCloseTo(719.27, 2);
});

test('dependentes reduzem a base do IRRF', () => {
  // PL 6000, 2 dep: base 4800 − 379,18 = 4420,82 → 22,5% − 675,49 = 319,19; redutor 179,75 → 139,44
  expect(calcularRemuneracao({ bruto: 8000, proLabore: 6000, dependentes: 2 }).irrf).toBeCloseTo(139.44, 2);
});

test('calcularBruto = dias × horas × valor', () => {
  expect(calcularBruto({ diasUteis: 21, horasDia: 8, valorHora: 40 })).toBe(6720);
});
