import { POTES, resumoMes } from '../meses';
import { brl, nomeMes } from '../formato';
import Quebra from './Quebra';

export default function Dashboard({ chave, mes, onNovoMes }) {
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
  const { params } = mes;

  return (
    <>
      <header className="pagina-topo">
        <p className="sobretitulo">Mês atual</p>
        <h1>{nomeMes(chave)}</h1>
      </header>

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
            {POTES.map((p) => (
              <li key={p.id} className={`pote pote-${p.id}`}>
                <span className="pote-nome">{p.nome}</span>
                <span className="pote-pct">{params.pct[p.id]}%</span>
                <span className="pote-valor num">{brl(r.orcamentos[p.id])}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
