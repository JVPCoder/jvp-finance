import { CreditCardIcon, FireIcon } from '@phosphor-icons/react';
import { dividaCartao, streak, totaisPorPote, ultimoMes } from '../meses';
import { brl, nomeMes } from '../formato';

function motivoEmAndamento(chave, mes) {
  const t = totaisPorPote(mes);
  if (t.desejos.saldo < 0) return `${nomeMes(chave)} não conta: Desejos passou ${brl(-t.desejos.saldo)} do orçamento.`;
  return `Faltam ${brl(t.investimentos.saldo)} investidos para ${nomeMes(chave)} contar.`;
}

export default function Gamificacao({ meses }) {
  const chave = ultimoMes(meses);
  const s = streak(meses);
  const divida = dividaCartao(meses);
  const pctPago = divida ? Math.round((divida.pago / (divida.pago + divida.restante)) * 100) : 0;

  return (
    <div className="gamificacao">
      <section className={`painel conquista${s.meses > 0 ? ' ativa' : ''}`} aria-labelledby="sequencia-titulo">
        <div className="conquista-topo">
          <FireIcon size={20} weight={s.meses > 0 ? 'fill' : 'regular'} aria-hidden="true" />
          <h2 id="sequencia-titulo">Sequência</h2>
        </div>
        <p className="conquista-valor num">
          {s.meses} {s.meses === 1 ? 'mês' : 'meses'}
        </p>
        <p className="conquista-texto">
          {s.emAndamento ? motivoEmAndamento(chave, meses[chave]) : 'Desejos dentro do orçamento e meta de investimento batida.'}
        </p>
      </section>

      <section className="painel conquista" aria-labelledby="divida-titulo">
        <div className="conquista-topo">
          <CreditCardIcon size={20} aria-hidden="true" />
          <h2 id="divida-titulo">Dívida do cartão</h2>
        </div>
        {divida ? (
          <>
            <p className="conquista-valor num">{brl(divida.restante)}</p>
            <div className="barra barra-divida" aria-hidden="true">
              <span style={{ width: `${pctPago}%` }} />
            </div>
            <p className="conquista-texto num">
              {pctPago}% pago · {divida.parcelasRestantes === 0
                ? 'última parcela neste mês'
                : `faltam ${divida.parcelasRestantes} ${divida.parcelasRestantes === 1 ? 'parcela' : 'parcelas'}`}
            </p>
          </>
        ) : (
          <>
            <p className="conquista-valor num">{brl(0)}</p>
            <p className="conquista-texto">Sem parcelas no cartão.</p>
          </>
        )}
      </section>
    </div>
  );
}
