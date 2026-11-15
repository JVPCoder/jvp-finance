import { useState } from 'react';
import { TABELA } from '../simulador';
import { POTES, resumoMes } from '../meses';
import { brl, nomeMes } from '../formato';
import Quebra from './Quebra';

const PADRAO = { diasUteis: '', valorHora: '', horasDia: '8', proLabore: '', dependentes: '0', quotas: '0',
                 essenciais: '50', desejos: '20', investimentos: '30' };

function paraParams(v) {
  const n = (k) => Number(v[k]);
  return {
    diasUteis: n('diasUteis'), valorHora: n('valorHora'), horasDia: n('horasDia'), proLabore: n('proLabore'),
    dependentes: n('dependentes'), quotas: n('quotas'),
    pct: { essenciais: n('essenciais'), desejos: n('desejos'), investimentos: n('investimentos') },
  };
}

function validar(v, chavesExistentes) {
  const e = {};
  const n = (k) => (v[k] === '' ? NaN : Number(v[k]));
  if (!/^\d{4}-\d{2}$/.test(v.chave)) e.chave = 'Escolha o mês.';
  else if (chavesExistentes.includes(v.chave)) e.chave = `${nomeMes(v.chave)} já existe.`;
  if (!Number.isInteger(n('diasUteis')) || n('diasUteis') < 1 || n('diasUteis') > 31) e.diasUteis = 'Entre 1 e 31.';
  if (!(n('valorHora') > 0)) e.valorHora = 'Informe um valor maior que zero.';
  if (!(n('horasDia') > 0 && n('horasDia') <= 24)) e.horasDia = 'Entre 1 e 24.';
  if (!(n('proLabore') >= TABELA.salarioMinimo && n('proLabore') <= TABELA.tetoProLabore))
    e.proLabore = `Entre ${brl(TABELA.salarioMinimo)} e ${brl(TABELA.tetoProLabore)}.`;
  if (!Number.isInteger(n('dependentes')) || n('dependentes') < 0) e.dependentes = 'Número inteiro, 0 ou mais.';
  if (!(n('quotas') >= 0)) e.quotas = '0 ou mais.';
  const soma = POTES.reduce((s, p) => s + (Number(v[p.id]) || 0), 0);
  if (Math.abs(soma - 100) > 0.001) e.pct = `Os percentuais somam ${soma}%. Precisam somar 100%.`;
  return e;
}

function Campo({ id, label, erro, dica, ...input }) {
  const descricao = erro ? `${id}-erro` : dica ? `${id}-dica` : undefined;
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} aria-invalid={erro ? true : undefined} aria-describedby={descricao} {...input} />
      {erro ? <small id={`${id}-erro`} className="erro">{erro}</small> : dica && <small id={`${id}-dica`}>{dica}</small>}
    </div>
  );
}

export default function MesForm({ chaveInicial, inicial, chavesExistentes, onSalvar, onCancelar }) {
  const [v, setV] = useState({ ...PADRAO, ...inicial, chave: chaveInicial });
  const [erros, setErros] = useState({});
  const mudar = (e) => setV({ ...v, [e.target.name]: e.target.value });
  const num = (id, label, extra) => <Campo id={id} label={label} type="number" inputMode="decimal" value={v[id]} onChange={mudar} erro={erros[id]} {...extra} />;

  const params = paraParams(v);
  const previa = Object.keys(validar(v, [])).length === 0 ? resumoMes({ params }) : null;

  function enviar(e) {
    e.preventDefault();
    const novos = validar(v, chavesExistentes);
    setErros(novos);
    const primeiro = Object.keys(novos)[0];
    if (primeiro) return document.getElementById(primeiro === 'pct' ? 'essenciais' : primeiro)?.focus();
    onSalvar(v.chave, params);
  }

  return (
    <div className="mes-form-layout">
      <form className="mes-form" onSubmit={enviar} noValidate>
        <fieldset>
          <legend>Renda</legend>
          <Campo id="chave" label="Mês" type="month" value={v.chave} onChange={mudar} erro={erros.chave} />
          <div className="linha-campos">
            {num('diasUteis', 'Dias úteis', { step: 1, min: 1, max: 31, inputMode: 'numeric' })}
            {num('horasDia', 'Horas por dia', { step: 0.5, min: 1, max: 24 })}
            {num('valorHora', 'Valor da hora (R$)', { step: 0.01, min: 0 })}
          </div>
        </fieldset>

        <fieldset>
          <legend>Cooperativa</legend>
          <div className="linha-campos">
            {num('proLabore', 'Pró-labore (R$)', { step: 0.01, dica: `Mín. ${brl(TABELA.salarioMinimo)} · máx. ${brl(TABELA.tetoProLabore)}` })}
            {num('dependentes', 'Dependentes', { step: 1, min: 0, inputMode: 'numeric' })}
            {num('quotas', 'Quotas (R$)', { step: 0.01, min: 0, dica: 'R$ 10 nas 5 primeiras parcelas' })}
          </div>
        </fieldset>

        <fieldset aria-describedby={erros.pct ? 'pct-erro' : undefined}>
          <legend>Divisão do líquido (%)</legend>
          <div className="linha-campos">
            {POTES.map((p) => num(p.id, p.nome, { key: p.id, step: 1, min: 0, max: 100, 'aria-invalid': erros.pct ? true : undefined }))}
          </div>
          {erros.pct && <p id="pct-erro" className="erro" role="alert">{erros.pct}</p>}
        </fieldset>

        <div className="acoes">
          <button type="submit" className="btn primario">Criar mês</button>
          {onCancelar && <button type="button" className="btn" onClick={onCancelar}>Cancelar</button>}
        </div>
      </form>

      <aside className="previa" aria-live="polite">
        <h2>Prévia</h2>
        {previa ? (
          <>
            <p className="previa-conta">
              {params.diasUteis} dias × {params.horasDia}h × {brl(params.valorHora)}
            </p>
            <Quebra resumo={previa} />
          </>
        ) : (
          <p className="vazio-texto">Preencha dias úteis, valor da hora e pró-labore para ver o líquido.</p>
        )}
      </aside>
    </div>
  );
}
