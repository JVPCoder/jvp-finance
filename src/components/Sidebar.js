import { CalendarDotsIcon, CalendarPlusIcon, ChartPieSliceIcon, FloppyDiskIcon } from '@phosphor-icons/react';

const ITENS = [
  { id: 'dashboard', rotulo: 'Dashboard', Icone: ChartPieSliceIcon },
  { id: 'meses', rotulo: 'Meses', Icone: CalendarDotsIcon },
  { id: 'novo-mes', rotulo: 'Novo mês', Icone: CalendarPlusIcon },
  { id: 'backup', rotulo: 'Backup', Icone: FloppyDiskIcon },
];

export default function Sidebar({ pagina, onNavegar }) {
  return (
    <nav className="sidebar" aria-label="Principal">
      <p className="marca">
        <img src={`${process.env.PUBLIC_URL}/logo192.png`} alt="" width="24" height="24" />
        JVP Finance
      </p>
      <ul>
        {ITENS.map(({ id, rotulo, Icone }) => {
          const ativo = pagina === id;
          return (
            <li key={id}>
              <button
                type="button"
                className="nav-item"
                aria-current={ativo ? 'page' : undefined}
                onClick={() => onNavegar(id)}
              >
                <Icone size={18} weight={ativo ? 'fill' : 'regular'} aria-hidden="true" />
                {rotulo}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
