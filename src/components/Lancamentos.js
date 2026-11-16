import { useState } from 'react';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { POTES } from '../meses';
import { brl } from '../formato';
import LancamentoForm from './LancamentoForm';

const nomePote = Object.fromEntries(POTES.map((p) => [p.id, p.nome]));
const dataCurta = (iso) => iso.split('-').reverse().slice(0, 2).join('/');

export default function Lancamentos({ chave, lancamentos, categorias, onSalvar, onRemover }) {
  const [filtro, setFiltro] = useState('todos');
  const [editando, setEditando] = useState(null); // null | 'novo' | lançamento

  const visiveis = lancamentos
    .filter((l) => filtro === 'todos' || l.pote === filtro)
    .sort((a, b) => b.data.localeCompare(a.data));
  const contagem = (id) => lancamentos.filter((l) => l.pote === id).length;

  function salvar(lanc) {
    onSalvar(lanc);
    setEditando(null);
  }

  return (
    <section className="lancamentos" aria-labelledby="lancamentos-titulo">
      <div className="secao-topo">
        <h2 id="lancamentos-titulo">Lançamentos</h2>
        {editando === null && (
          <button type="button" className="btn primario" onClick={() => setEditando('novo')}>
            <PlusIcon size={16} weight="bold" aria-hidden="true" />
            Novo lançamento
          </button>
        )}
      </div>

      {editando !== null && (
        <LancamentoForm
          key={editando === 'novo' ? 'novo' : editando.id}
          chave={chave}
          inicial={editando === 'novo' ? null : editando}
          poteInicial={filtro === 'todos' ? undefined : filtro}
          categorias={categorias}
          onSalvar={salvar}
          onCancelar={() => setEditando(null)}
        />
      )}

      <div className="filtros" role="group" aria-label="Filtrar por pote">
        {[{ id: 'todos', nome: 'Todos' }, ...POTES].map((p) => (
          <button key={p.id} type="button" className={`filtro filtro-${p.id}`} aria-pressed={filtro === p.id}
                  onClick={() => setFiltro(p.id)}>
            {p.nome}
            <span className="filtro-contagem">{p.id === 'todos' ? lancamentos.length : contagem(p.id)}</span>
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <p className="vazio-texto lista-vazia">
          {lancamentos.length === 0 ? 'Nenhum lançamento neste mês.' : 'Nenhum lançamento neste pote.'}
        </p>
      ) : (
        <div className="tabela-rolagem">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Origem</th>
                <th scope="col">Categoria</th>
                <th scope="col">Método</th>
                <th scope="col">Pote</th>
                <th scope="col" className="direita">Valor</th>
                <th scope="col"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((l) => (
                <tr key={l.id}>
                  <td className="num">{dataCurta(l.data)}</td>
                  <td>
                    {l.origem}
                    {l.tipo === 'fixo' && <span className="etiqueta">Fixo</span>}
                    {l.tipo === 'parcelado' && <span className="etiqueta num">{l.parcela.n}/{l.parcela.total}</span>}
                  </td>
                  <td className="secundario">{l.categoria || '-'}</td>
                  <td className="secundario">{l.metodo}</td>
                  <td><span className={`pote-tag pote-${l.pote}`}>{nomePote[l.pote]}</span></td>
                  <td className="num direita">{brl(l.valor)}</td>
                  <td className="acoes-linha">
                    <button type="button" className="btn-icone" aria-label={`Editar ${l.origem}`} onClick={() => setEditando(l)}>
                      <PencilSimpleIcon size={16} aria-hidden="true" />
                    </button>
                    <button type="button" className="btn-icone perigo" aria-label={`Excluir ${l.origem}`} onClick={() => onRemover(l.id)}>
                      <TrashIcon size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
