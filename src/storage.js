export const CHAVE = 'jvp-finance:v1';

const vazio = () => ({ version: 1, meses: {} });
const ehObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export function importar(texto) {
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    dados = null;
  }
  const valido =
    ehObjeto(dados) && dados.version === 1 && ehObjeto(dados.meses) &&
    Object.entries(dados.meses).every(
      ([chave, mes]) => /^\d{4}-\d{2}$/.test(chave) && ehObjeto(mes) && ehObjeto(mes.params) && Array.isArray(mes.lancamentos),
    );
  if (!valido) throw new Error('Arquivo de backup inválido');
  return dados;
}

export const exportar = (dados) => JSON.stringify(dados, null, 2);

export function salvar(dados) {
  localStorage.setItem(CHAVE, JSON.stringify(dados));
}

export function carregar() {
  let texto;
  try {
    texto = localStorage.getItem(CHAVE);
  } catch {
    return vazio(); // storage bloqueado (modo privado etc.)
  }
  if (!texto) return vazio();
  try {
    return importar(texto);
  } catch {
    // não deixa o próximo salvar() apagar o que estava lá
    localStorage.setItem(`${CHAVE}:corrompido`, texto);
    return vazio();
  }
}
