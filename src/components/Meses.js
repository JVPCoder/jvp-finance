import { CalendarPlusIcon } from '@phosphor-icons/react';
import { resumoMes } from '../meses';
import { brl, nomeMes } from '../formato';

export default function Meses({ meses, onAbrir, onNovoMes }) {
  const chaves = Object.keys(meses).sort().reverse();

  return (
    <>
      <header className="pagina-topo secao-topo">
        <h1>Meses</h1>
        <button type="button" className="btn primario" onClick={onNovoMes}>
          <CalendarPlusIcon size={16} weight="bold" aria-hidden="true" />
          Novo mês
        </button>
      </header>

      {chaves.length === 0 ? (
        <p className="vazio-texto">Nenhum mês ainda. Crie o primeiro para começar.</p>
      ) : (
        <div className="tabela-rolagem">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">Mês</th>
                <th scope="col" className="direita">Líquido</th>
                <th scope="col" className="direita">Gasto</th>
                <th scope="col" className="direita">Sobra</th>
                <th scope="col" className="direita">Lançamentos</th>
              </tr>
            </thead>
            <tbody>
              {chaves.map((chave) => {
                const mes = meses[chave];
                const { liquido } = resumoMes(mes);
                const gasto = mes.lancamentos.reduce((s, l) => s + l.valor, 0);
                const sobra = liquido - gasto;
                return (
                  <tr key={chave}>
                    <td>
                      <button type="button" className="link" onClick={() => onAbrir(chave)}>{nomeMes(chave)}</button>
                    </td>
                    <td className="num direita">{brl(liquido)}</td>
                    <td className="num direita">{brl(gasto)}</td>
                    <td className={`num direita${sobra < 0 ? ' negativo' : ''}`}>{brl(sobra)}</td>
                    <td className="num direita">{mes.lancamentos.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
