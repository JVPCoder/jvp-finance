const ITENS = [
  { id: 'dashboard', rotulo: 'Dashboard' },
  { id: 'novo-mes', rotulo: 'Novo mês' },
];

export default function Sidebar({ pagina, onNavegar }) {
  return (
    <nav className="sidebar" aria-label="Principal">
      <p className="marca">JVP Finance</p>
      <ul>
        {ITENS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="nav-item"
              aria-current={pagina === item.id ? 'page' : undefined}
              onClick={() => onNavegar(item.id)}
            >
              {item.rotulo}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
