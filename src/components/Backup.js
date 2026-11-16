import { useState } from 'react';
import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { exportar, importar } from '../storage';

const resumo = (dados) => {
  const meses = Object.values(dados.meses);
  const lancamentos = meses.reduce((s, m) => s + m.lancamentos.length, 0);
  return `${meses.length} ${meses.length === 1 ? 'mês' : 'meses'} e ${lancamentos} ${lancamentos === 1 ? 'lançamento' : 'lançamentos'}`;
};

function lerArquivo(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    leitor.readAsText(arquivo);
  });
}

function baixar(dados) {
  const hoje = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(new Blob([exportar(dados)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `jvp-finance-${hoje}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Backup({ dados, onImportar }) {
  const [mensagem, setMensagem] = useState(null); // { tipo: 'erro' | 'ok', texto }

  async function aoEscolher(e) {
    const arquivo = e.target.files[0];
    e.target.value = ''; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;
    try {
      const novos = importar(await lerArquivo(arquivo));
      if (!window.confirm(`Substituir os dados atuais (${resumo(dados)}) pelos do arquivo (${resumo(novos)})?`)) return;
      onImportar(novos);
      setMensagem({ tipo: 'ok', texto: `Backup importado: ${resumo(novos)}.` });
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: `${erro.message}. Seus dados atuais não foram alterados.` });
    }
  }

  return (
    <>
      <header className="pagina-topo">
        <h1>Backup</h1>
      </header>

      <div className="backup-grid">
        <section className="painel" aria-labelledby="exportar-titulo">
          <h2 id="exportar-titulo">Exportar</h2>
          <p className="legenda">
            Os dados ficam só neste navegador. Limpar o histórico do navegador apaga tudo, então exporte um backup de vez em quando.
          </p>
          <button type="button" className="btn primario" onClick={() => baixar(dados)}>
            <DownloadSimpleIcon size={16} weight="bold" aria-hidden="true" />
            Exportar backup
          </button>
          <p className="conquista-texto">{resumo(dados)}</p>
        </section>

        <section className="painel" aria-labelledby="importar-titulo">
          <h2 id="importar-titulo">Importar</h2>
          <p className="legenda">Substitui todos os dados atuais pelos do arquivo. Pede confirmação antes.</p>
          <div className="campo">
            <label htmlFor="arquivo-backup">Arquivo de backup (.json)</label>
            <input id="arquivo-backup" type="file" accept="application/json,.json" onChange={aoEscolher} />
          </div>
          {mensagem && (
            <p className={mensagem.tipo === 'erro' ? 'erro' : 'sucesso'} role={mensagem.tipo === 'erro' ? 'alert' : 'status'}>
              {mensagem.texto}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
