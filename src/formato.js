const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Intl usa espaço não separável depois de "R$"; normaliza para espaço comum
export const brl = (valor) => moeda.format(valor).replace(/ /g, ' ');

export function nomeMes(chave) {
  const [ano, mes] = chave.split('-').map(Number);
  const texto = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return texto[0].toUpperCase() + texto.slice(1);
}

export function chaveHoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
