import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => localStorage.clear());

function preencher(rotulo, valor) {
  const campo = screen.getByLabelText(rotulo);
  userEvent.clear(campo);
  userEvent.type(campo, valor);
}

test('sem meses mostra convite para criar o primeiro', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /nenhum mês ainda/i })).toBeInTheDocument();
});

test('criar o primeiro mês mostra o líquido no dashboard e persiste', () => {
  const { unmount } = render(<App />);
  userEvent.click(screen.getByRole('button', { name: /criar primeiro mês/i }));

  fireEvent.change(screen.getByLabelText(/^mês$/i), { target: { value: '2026-12' } });
  preencher(/dias úteis/i, '20');
  preencher(/valor da hora/i, '40');
  preencher(/pró-labore/i, '1621');
  userEvent.click(screen.getByRole('button', { name: /criar mês/i }));

  expect(screen.getByRole('heading', { level: 1, name: /dezembro de 2026/i })).toBeInTheDocument();
  expect(screen.getAllByText('R$ 5.787,80').length).toBeGreaterThan(0);

  unmount();
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: /dezembro de 2026/i })).toBeInTheDocument();
});

test('percentuais que não somam 100 bloqueiam o envio', () => {
  render(<App />);
  userEvent.click(screen.getByRole('button', { name: /criar primeiro mês/i }));
  preencher(/dias úteis/i, '20');
  preencher(/valor da hora/i, '40');
  preencher(/pró-labore/i, '1621');
  preencher(/desejos/i, '30');
  userEvent.click(screen.getByRole('button', { name: /criar mês/i }));

  expect(screen.getByText(/somam 110%/i)).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 1, name: /de 2026/i })).not.toBeInTheDocument();
});
