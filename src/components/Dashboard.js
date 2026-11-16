import { PencilSimpleIcon, TrashIcon, WalletIcon } from '@phosphor-icons/react';
import { POTES, resumoMes, totaisPorPote, saldoMes } from '../meses';
import { brl, nomeMes } from '../formato';
import Quebra from './Quebra';
import Lancamentos from './Lancamentos';
import Gamificacao from './Gamificacao';

function textoSaldo(poteId, saldo) {
  if (poteId === 'investimentos') return saldo > 0 ? `Faltam ${brl(saldo)} para a meta` : 'Meta batida';
  return saldo >= 0 ? `Restam ${brl(saldo)}` : `Passou ${brl(-saldo)}`;
}

export default function Dashboard({
  chave, ehAtual, mes, meses, categorias, onNovoMes, onEditarMes, onExcluirMes, onSalvarLancamento, onRemoverLancamento,
}) {
  if (!mes) {
    return (
      <section className="vazio">
        <h1>Nenhum mês ainda</h1>
        <p>Crie o primeiro mês informando dias úteis, valor da hora e pró-labore. O líquido é calculado na hora.</p>
        <button type="button" className="btn primario" onClick={onNovoMes}>Criar primeiro mês</button>
      </section>
    );
  }

  const r = resumoMes(mes);
  const totais = totaisPorPote(mes);
  const saldo = saldoMes(mes);
  const { params } = mes;

  return (
    <>
      <header className="pagina-topo secao-topo">
        <div>
          <p className="sobretitulo">{ehAtual ? 'Mês atual' : 'Mês anterior'}</p>
          <h1>{nomeMes(chave)}</h1>
        </div>
        <div className="acoes">
          <button type="button" className="btn" onClick={onEditarMes}>
            <PencilSimpleIcon size={16} aria-hidden="true" />
            Editar mês
          </button>
          <button type="button" className="btn perigo" onClick={onExcluirMes}>
            <TrashIcon size={16} aria-hidden="true" />
            Excluir mês
          </button>
        </div>
      </header>

      <section className={`painel saldo-mes${saldo.saldo < 0 ? ' estourou' : ''}`} aria-labelledby="saldo-titulo">
        <div className="conquista-topo">
          <WalletIcon size={20} aria-hidden="true" />
          <h2 id="saldo-titulo">{saldo.saldo >= 0 ? 'Ainda posso gastar' : 'Passei da renda'}</h2>
        </div>
        <p className="destaque num">{brl(Math.abs(saldo.saldo))}</p>
        <p className="conquista-texto num">
          {brl(saldo.gasto)} lançados de {brl(saldo.liquido)} líquido · {brl(saldo.credito)} no crédito
          {totais.investimentos.saldo > 0 && ` · ${brl(totais.investimentos.saldo)} ainda reservados para investir`}
        </p>
      </section>

      <Gamificacao meses={meses} />

      <div className="dashboard-grid">
        <section className="painel" aria-labelledby="renda-titulo">
          <h2 id="renda-titulo">Renda</h2>
          <p className="destaque num">{brl(r.liquido)}</p>
          <p className="legenda">
            líquido · {params.diasUteis} dias × {params.horasDia}h × {brl(params.valorHora)} = {brl(r.bruto)} bruto
          </p>
          <Quebra resumo={r} />
        </section>

        <section className="painel" aria-labelledby="potes-titulo">
          <h2 id="potes-titulo">Potes</h2>
          <ul className="potes">
            {POTES.map((p) => {
              const t = totais[p.id];
              const pct = t.orcamento > 0 ? Math.min((t.gasto / t.orcamento) * 100, 100) : 0;
              const estourou = p.id !== 'investimentos' && t.saldo < 0;
              return (
                <li key={p.id} className={`pote pote-${p.id}${estourou ? ' estourou' : ''}`}>
                  <div className="pote-cabecalho">
                    <span className="pote-nome">{p.nome}</span>
                    <span className="pote-pct">{params.pct[p.id]}%</span>
                  </div>
                  <p className="pote-uso num">
                    {brl(t.gasto)} <span>de {brl(t.orcamento)}</span>
                  </p>
                  <div className="barra" aria-hidden="true">
                    <span style={{ '--pct': pct }} />
                  </div>
                  <p className="pote-saldo num">{textoSaldo(p.id, t.saldo)}</p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <Lancamentos
        key={chave}
        chave={chave}
        lancamentos={mes.lancamentos}
        categorias={categorias}
        onSalvar={onSalvarLancamento}
        onRemover={onRemoverLancamento}
      />
    </>
  );
}
