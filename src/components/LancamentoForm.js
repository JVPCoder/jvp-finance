import { useEffect, useRef, useState } from 'react';
import { METODOS, POTES, novoId } from '../meses';
import Campo from './Campo';

function dataPadrao(chave) {
  const hoje = new Date();
  const iso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  return iso.startsWith(chave) ? iso : `${chave}-01`;
}

function paraForm(inicial, chave, pote) {
  if (!inicial) {
    return { pote: pote || 'essenciais', origem: '', data: dataPadrao(chave), metodo: 'Pix', categoria: '', valor: '',
             tipo: 'avulso', parcelaN: '1', parcelaTotal: '' };
  }
  return { ...inicial, valor: String(inicial.valor), parcelaN: String(inicial.parcela?.n ?? 1),
           parcelaTotal: String(inicial.parcela?.total ?? '') };
}

function validar(v) {
  const e = {};
  if (!v.origem.trim()) e.origem = 'Informe de onde veio o gasto.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.data)) e.data = 'Escolha a data.';
  if (!(Number(v.valor) > 0)) e.valor = 'Informe um valor maior que zero.';
  if (v.tipo === 'parcelado') {
    const n = Number(v.parcelaN);
    const total = Number(v.parcelaTotal);
    if (!Number.isInteger(n) || n < 1) e.parcelaN = 'Número inteiro, 1 ou mais.';
    if (!Number.isInteger(total) || total < 2) e.parcelaTotal = 'Pelo menos 2 parcelas.';
    else if (!e.parcelaN && n > total) e.parcelaN = 'A parcela atual não pode passar do total.';
  }
  return e;
}

export default function LancamentoForm({ chave, inicial, poteInicial, categorias, onSalvar, onCancelar }) {
  const [v, setV] = useState(() => paraForm(inicial, chave, poteInicial));
  const [erros, setErros] = useState({});
  const primeiroCampo = useRef(null);
  const mudar = (e) => setV({ ...v, [e.target.name]: e.target.value });

  useEffect(() => primeiroCampo.current?.focus(), []);

  function enviar(e) {
    e.preventDefault();
    const novos = validar(v);
    setErros(novos);
    const primeiro = Object.keys(novos)[0];
    if (primeiro) return document.getElementById(primeiro)?.focus();
    onSalvar({
      id: inicial?.id || novoId(),
      pote: v.pote,
      origem: v.origem.trim(),
      data: v.data,
      metodo: v.metodo,
      categoria: v.categoria.trim(),
      valor: Number(v.valor),
      tipo: v.tipo,
      ...(v.tipo === 'parcelado' && { parcela: { n: Number(v.parcelaN), total: Number(v.parcelaTotal) } }),
    });
  }

  return (
    <form className="painel lancamento-form" onSubmit={enviar} noValidate>
      <h3>{inicial ? 'Editar lançamento' : 'Novo lançamento'}</h3>
      <div className="linha-campos">
        <Campo id="origem" label="Origem" value={v.origem} onChange={mudar} erro={erros.origem} ref={primeiroCampo}
               className="largo" autoComplete="off" />
        <Campo id="valor" label="Valor (R$)" type="number" inputMode="decimal" step="0.01" min="0" value={v.valor}
               onChange={mudar} erro={erros.valor} />
      </div>
      <div className="linha-campos">
        <Campo id="pote" label="Pote" as="select" value={v.pote} onChange={mudar}>
          {POTES.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </Campo>
        <Campo id="data" label="Data" type="date" value={v.data} onChange={mudar} erro={erros.data} />
        <Campo id="metodo" label="Método" as="select" value={v.metodo} onChange={mudar}>
          {METODOS.map((m) => <option key={m}>{m}</option>)}
        </Campo>
      </div>
      <div className="linha-campos">
        <Campo id="categoria" label="Categoria" value={v.categoria} onChange={mudar} list="categorias-usadas"
               autoComplete="off" dica="Ex.: Contas, Games, Delivery" />
        <datalist id="categorias-usadas">
          {categorias.map((c) => <option key={c} value={c} />)}
        </datalist>
        <Campo id="tipo" label="Tipo" as="select" value={v.tipo} onChange={mudar}
               dica={v.tipo === 'avulso' ? 'Só neste mês' : 'Copiado para o próximo mês'}>
          <option value="avulso">Avulso</option>
          <option value="fixo">Fixo</option>
          <option value="parcelado">Parcelado</option>
        </Campo>
        {v.tipo === 'parcelado' && (
          <>
            <Campo id="parcelaN" label="Parcela atual" type="number" inputMode="numeric" step="1" min="1"
                   value={v.parcelaN} onChange={mudar} erro={erros.parcelaN} />
            <Campo id="parcelaTotal" label="Total de parcelas" type="number" inputMode="numeric" step="1" min="2"
                   value={v.parcelaTotal} onChange={mudar} erro={erros.parcelaTotal} />
          </>
        )}
      </div>
      <div className="acoes">
        <button type="submit" className="btn primario">Salvar lançamento</button>
        <button type="button" className="btn" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
