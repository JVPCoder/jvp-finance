import { useEffect, useState } from 'react';
import './App.css';
import { carregar, salvar } from './storage';
import {
  categoriasUsadas, herdarLancamentos, mesAnterior, novoMes, proximaChave, removerLancamento, salvarLancamento, ultimoMes,
} from './meses';
import { chaveHoje } from './formato';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MesForm from './components/MesForm';
import Meses from './components/Meses';

export default function App() {
  const [dados, setDados] = useState(carregar);
  const [pagina, setPagina] = useState('dashboard');
  const [selecionado, setSelecionado] = useState(null); // null = mês mais recente
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
  const chaveVista = selecionado && dados.meses[selecionado] ? selecionado : chaveAtual;

  function navegar(destino) {
    if (destino === 'dashboard') setSelecionado(null);
    setPagina(destino);
  }

  function abrirMes(chave) {
    setSelecionado(chave);
    setPagina('dashboard');
  }

  function criarMes(chave, params) {
    setDados((d) => {
      const anterior = mesAnterior(d.meses, chave);
      const herdados = anterior ? herdarLancamentos(d.meses[anterior]) : [];
      return { ...d, meses: { ...d.meses, [chave]: novoMes(params, herdados) } };
    });
    abrirMes(chave);
  }

  const atualizarMes = (chave, fn) => setDados((d) => ({ ...d, meses: { ...d.meses, [chave]: fn(d.meses[chave]) } }));

  let conteudo;
  if (pagina === 'novo-mes') {
    conteudo = (
      <>
        <header className="pagina-topo">
          <h1>Novo mês</h1>
        </header>
        <MesForm
          chaveInicial={chaveAtual ? proximaChave(chaveAtual) : chaveHoje()}
          paramsBase={dados.meses[chaveAtual]?.params}
          meses={dados.meses}
          onSalvar={criarMes}
          onCancelar={chaveAtual ? () => navegar('dashboard') : undefined}
        />
      </>
    );
  } else if (pagina === 'meses') {
    conteudo = <Meses meses={dados.meses} onAbrir={abrirMes} onNovoMes={() => navegar('novo-mes')} />;
  } else {
    conteudo = (
      <Dashboard
        chave={chaveVista}
        ehAtual={chaveVista === chaveAtual}
        mes={dados.meses[chaveVista]}
        categorias={categoriasUsadas(dados.meses)}
        onNovoMes={() => navegar('novo-mes')}
        onSalvarLancamento={(l) => atualizarMes(chaveVista, (m) => salvarLancamento(m, l))}
        onRemoverLancamento={(id) => atualizarMes(chaveVista, (m) => removerLancamento(m, id))}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar pagina={pagina} onNavegar={navegar} />
      <main className="conteudo">
        {erroSalvar && (
          <p className="alerta" role="alert">
            Não foi possível salvar no navegador. Suas alterações podem se perder ao fechar a página.
          </p>
        )}
        {conteudo}
      </main>
    </div>
  );
}
