import { useEffect, useState } from 'react';
import './App.css';
import { carregar, salvar } from './storage';
import {
  categoriasUsadas, herdarLancamentos, mesAnterior, novoMes, proximaChave, removerLancamento, salvarLancamento, ultimoMes,
} from './meses';
import { chaveHoje, nomeMes } from './formato';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MesForm from './components/MesForm';
import Meses from './components/Meses';
import Backup from './components/Backup';
import Confirmar from './components/Confirmar';

export default function App() {
  const [dados, setDados] = useState(carregar);
  const [pagina, setPagina] = useState('dashboard');
  const [selecionado, setSelecionado] = useState(null); // null = mês mais recente
  const [erroSalvar, setErroSalvar] = useState(false);
  const [pedido, setPedido] = useState(null); // confirmação aberta

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

  function salvarParams(chave, params) {
    atualizarMes(chave, (m) => ({ ...m, params }));
    setPagina('dashboard');
  }

  function excluirMes(chave) {
    const n = dados.meses[chave].lancamentos.length;
    setPedido({
      titulo: `Excluir ${nomeMes(chave)}?`,
      texto: n ? `Os ${n} lançamentos dele também serão apagados. Não dá para desfazer.` : 'Não dá para desfazer.',
      acao: 'Excluir mês',
      perigo: true,
      onConfirmar: () => {
        setDados((d) => {
          const { [chave]: _removido, ...resto } = d.meses;
          return { ...d, meses: resto };
        });
        setSelecionado(null);
      },
    });
  }

  let conteudo;
  if (pagina === 'editar-mes' && chaveVista) {
    conteudo = (
      <>
        <header className="pagina-topo">
          <h1>Editar {nomeMes(chaveVista)}</h1>
        </header>
        <MesForm
          editando
          chaveInicial={chaveVista}
          paramsBase={dados.meses[chaveVista].params}
          meses={dados.meses}
          onSalvar={salvarParams}
          onCancelar={() => setPagina('dashboard')}
        />
      </>
    );
  } else if (pagina === 'novo-mes') {
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
  } else if (pagina === 'backup') {
    conteudo = (
      <Backup
        dados={dados}
        onConfirmar={setPedido}
        onImportar={(novos) => {
          setDados(novos);
          setSelecionado(null);
        }}
      />
    );
  } else if (pagina === 'meses') {
    conteudo = <Meses meses={dados.meses} onAbrir={abrirMes} onNovoMes={() => navegar('novo-mes')} />;
  } else {
    conteudo = (
      <Dashboard
        chave={chaveVista}
        ehAtual={chaveVista === chaveAtual}
        mes={dados.meses[chaveVista]}
        meses={dados.meses}
        categorias={categoriasUsadas(dados.meses)}
        onNovoMes={() => navegar('novo-mes')}
        onEditarMes={() => setPagina('editar-mes')}
        onExcluirMes={() => excluirMes(chaveVista)}
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
      <Confirmar pedido={pedido} onFechar={() => setPedido(null)} />
    </div>
  );
}
