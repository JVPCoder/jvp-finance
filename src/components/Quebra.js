import { brl } from '../formato';

// Quebra bruto → líquido, igual às colunas do simulador
export default function Quebra({ resumo }) {
  const linhas = [
    ['Bruto', resumo.bruto],
    ['Pró-labore', resumo.proLabore, 'base de INSS e IRRF'],
    ['Antecipação de sobras', resumo.sobras, 'isenta'],
    ['INSS', -resumo.inss],
    ['IRRF', -resumo.irrf],
    ['Taxa adm', -resumo.taxaAdm],
    ['Quotas', -resumo.quotas],
  ];
  return (
    <dl className="quebra">
      {linhas.map(([rotulo, valor, nota]) => (
        <div key={rotulo} className={valor < 0 ? 'quebra-linha desconto' : 'quebra-linha'}>
          <dt>
            {rotulo}
            {nota && <small> · {nota}</small>}
          </dt>
          <dd className="num">{brl(valor)}</dd>
        </div>
      ))}
      <div className="quebra-linha total">
        <dt>Total de descontos</dt>
        <dd className="num">{brl(-resumo.totalDesconto)}</dd>
      </div>
      <div className="quebra-linha liquido">
        <dt>Líquido</dt>
        <dd className="num">{brl(resumo.liquido)}</dd>
      </div>
    </dl>
  );
}
