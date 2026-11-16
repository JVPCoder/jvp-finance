import { useState } from 'react';
import { TABELA } from '../simulador';
import { POTES, ehClt, herdarLancamentos, mesAnterior, resumoMes } from '../meses';
import { brl, nomeMes } from '../formato';
import Quebra from './Quebra';
import Campo from './Campo';

const PADRAO = { regime: 'pj', salario: '', diasUteis: '', valorHora: '', horasDia: '8', proLabore: '', dependentes: '0', quotas: '0',
                 essenciais: '50', desejos: '20', investimentos: '30' };

function paraParams(v) {
  const n = (k) => Number(v[k]);
  const pct = { essenciais: n('essenciais'), desejos: n('desejos'), investimentos: n('investimentos') };
  if (v.regime === 'clt') return { regime: 'clt', salario: n('salario'), pct };
  return {
    regime: 'pj', diasUteis: n('diasUteis'), valorHora: n('valorHora'), horasDia: n('horasDia'), proLabore: n('proLabore'),
    dependentes: n('dependentes'), quotas: n('quotas'), pct,
  };
}

function validar(v, chavesExistentes) {
  const e = {};
  const n = (k) => (v[k] === '' ? NaN : Number(v[k]));
  if (!/^\d{4}-\d{2}$/.test(v.chave)) e.chave = 'Escolha o mês.';
  else if (chavesExistentes.includes(v.chave)) e.chave = `${nomeMes(v.chave)} já existe.`;
  if (v.regime === 'clt') {
    if (!(n('salario') > 0)) e.salario = 'Informe um valor maior que zero.';
  } else {
    if (!Number.isInteger(n('diasUteis')) || n('diasUteis') < 1 || n('diasUteis') > 31) e.diasUteis = 'Entre 1 e 31.';
    if (!(n('valorHora') > 0)) e.valorHora = 'Informe um valor maior que zero.';
    if (!(n('horasDia') > 0 && n('horasDia') <= 24)) e.horasDia = 'Entre 1 e 24.';
    if (!(n('proLabore') >= TABELA.salarioMinimo && n('proLabore') <= TABELA.tetoProLabore))
      e.proLabore = `Entre ${brl(TABELA.salarioMinimo)} e ${brl(TABELA.tetoProLabore)}.`;
    if (!Number.isInteger(n('dependentes')) || n('dependentes') < 0) e.dependentes = 'Número inteiro, 0 ou mais.';
    if (!(n('quotas') >= 0)) e.quotas = '0 ou mais.';
  }
  const soma = POTES.reduce((s, p) => s + (Number(v[p.id]) || 0), 0);
  if (Math.abs(soma - 100) > 0.001) e.pct = `Os percentuais somam ${soma}%. Precisam somar 100%.`;
  return e;
}

// parâmetros viram valores do formulário; dias úteis só ao editar (mês novo sempre pergunta)
function paraForm(p, comDias) {
  if (!p) return {};
  const s = (x) => String(x);
  const pct = { essenciais: s(p.pct.essenciais), desejos: s(p.pct.desejos), investimentos: s(p.pct.investimentos) };
  if (ehClt(p)) return { regime: 'clt', salario: s(p.salario), ...pct };
  return { regime: 'pj', ...(comDias && { diasUteis: s(p.diasUteis) }), valorHora: s(p.valorHora), horasDia: s(p.horasDia), proLabore: s(p.proLabore), dependentes: s(p.dependentes),
           quotas: s(p.quotas), ...pct };
}

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

function textoHeranca(meses, chave) {
  const anterior = mesAnterior(meses, chave);
  if (!anterior) return null;
  const herdados = herdarLancamentos(meses[anterior]);
  if (herdados.length === 0) return `Nada a herdar de ${nomeMes(anterior)}.`;
  const fixos = herdados.filter((l) => l.tipo === 'fixo').length;
  return `Herda ${plural(fixos, 'fixo', 'fixos')} e ${plural(herdados.length - fixos, 'parcela', 'parcelas')} de ${nomeMes(anterior)}.`;
}

export default function MesForm({ chaveInicial, paramsBase, meses, editando = false, onSalvar, onCancelar }) {
  const chavesExistentes = editando ? [] : Object.keys(meses);
  const [v, setV] = useState({ ...PADRAO, ...paraForm(paramsBase, editando), chave: chaveInicial });
  const heranca = !editando && /^\d{4}-\d{2}$/.test(v.chave) && !chavesExistentes.includes(v.chave)
    ? textoHeranca(meses, v.chave) : null;
  const [erros, setErros] = useState({});
  const mudar = (e) => setV({ ...v, [e.target.name]: e.target.value });
  const num = (id, label, extra) => <Campo key={id} id={id} label={label} type="number" inputMode="decimal" value={v[id]} onChange={mudar} erro={erros[id]} {...extra} />;

  const clt = v.regime === 'clt';
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
          <Campo id="chave" label="Mês" type="month" value={v.chave} onChange={mudar} erro={erros.chave} disabled={editando} />
          <Campo id="regime" label="Regime" as="select" value={v.regime} onChange={mudar}>
            <option value="pj">PJ (cooperativa)</option>
            <option value="clt">CLT</option>
          </Campo>
          {clt ? num('salario', 'Salário líquido (R$)', { step: 0.01, min: 0, dica: 'O valor que cai na conta' }) : (
          <div className="linha-campos">
            {num('diasUteis', 'Dias úteis', { step: 1, min: 1, max: 31, inputMode: 'numeric' })}
            {num('horasDia', 'Horas por dia', { step: 0.5, min: 1, max: 24 })}
            {num('valorHora', 'Valor da hora (R$)', { step: 0.01, min: 0 })}
          </div>
          )}
        </fieldset>

        {!clt && <fieldset>
          <legend>Cooperativa</legend>
          <div className="linha-campos">
            {num('proLabore', 'Pró-labore (R$)', { step: 0.01, dica: `Mín. ${brl(TABELA.salarioMinimo)} · máx. ${brl(TABELA.tetoProLabore)}` })}
            {num('dependentes', 'Dependentes', { step: 1, min: 0, inputMode: 'numeric' })}
            {num('quotas', 'Quotas (R$)', { step: 0.01, min: 0, dica: 'R$ 10 nas 5 primeiras parcelas' })}
          </div>
        </fieldset>}

        <fieldset aria-describedby={erros.pct ? 'pct-erro' : undefined}>
          <legend>Divisão do líquido (%)</legend>
          <div className="linha-campos">
            {POTES.map((p) => num(p.id, p.nome, { step: 1, min: 0, max: 100, 'aria-invalid': erros.pct ? true : undefined }))}
          </div>
          {erros.pct && <p id="pct-erro" className="erro" role="alert">{erros.pct}</p>}
        </fieldset>

        {heranca && <p className="heranca">{heranca}</p>}
        <div className="acoes">
          <button type="submit" className="btn primario">{editando ? 'Salvar mês' : 'Criar mês'}</button>
          {onCancelar && <button type="button" className="btn" onClick={onCancelar}>Cancelar</button>}
        </div>
      </form>

      <aside className="previa" aria-live="polite">
        <h2>Prévia</h2>
        {previa && clt ? (
          <p className="previa-conta">Líquido de {brl(previa.liquido)}</p>
        ) : previa ? (
          <>
            <p className="previa-conta">
              {params.diasUteis} dias × {params.horasDia}h × {brl(params.valorHora)}
            </p>
            <Quebra resumo={previa} />
          </>
        ) : (
          <p className="vazio-texto">{clt ? 'Preencha o salário para ver a divisão.' : 'Preencha dias úteis, valor da hora e pró-labore para ver o líquido.'}</p>
        )}
      </aside>
    </div>
  );
}
