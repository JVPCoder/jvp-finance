import { useEffect, useState } from 'react';
import './App.css';
import { carregar, salvar } from './storage';
import { novoMes, proximaChave, ultimoMes } from './meses';
import { chaveHoje } from './formato';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MesForm from './components/MesForm';

export default function App() {
  const [dados, setDados] = useState(carregar);
  const [pagina, setPagina] = useState('dashboard');
  const [erroSalvar, setErroSalvar] = useState(false);

  useEffect(() => {
    try {
      salvar(dados);
      setErroSalvar(false);
    } catch {
      setErroSalvar(true);
    }
  }, [dados]);

  const chaveAtual = ultimoMes(dados.meses);

  function criarMes(chave, params) {
    setDados((d) => ({ ...d, meses: { ...d.meses, [chave]: novoMes(params) } }));
    setPagina('dashboard');
  }

  return (
    <div className="app">
      <Sidebar pagina={pagina} onNavegar={setPagina} />
      <main className="conteudo">
        {erroSalvar && (
          <p className="alerta" role="alert">
            Não foi possível salvar no navegador. Suas alterações podem se perder ao fechar a página.
          </p>
        )}
        {pagina === 'novo-mes' ? (
          <>
            <header className="pagina-topo">
              <h1>Novo mês</h1>
            </header>
            <MesForm
              chaveInicial={chaveAtual ? proximaChave(chaveAtual) : chaveHoje()}
              chavesExistentes={Object.keys(dados.meses)}
              onSalvar={criarMes}
              onCancelar={chaveAtual ? () => setPagina('dashboard') : undefined}
            />
          </>
        ) : (
          <Dashboard chave={chaveAtual} mes={dados.meses[chaveAtual]} onNovoMes={() => setPagina('novo-mes')} />
        )}
      </main>
    </div>
  );
}
