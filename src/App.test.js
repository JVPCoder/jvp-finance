import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { CHAVE } from './storage';

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

function comMes() {
  localStorage.setItem(CHAVE, JSON.stringify({
    version: 1,
    meses: { '2026-12': { params: { diasUteis: 20, valorHora: 40, horasDia: 8, proLabore: 1621, dependentes: 0, quotas: 0,
                                    pct: { essenciais: 50, desejos: 20, investimentos: 30 } }, lancamentos: [] } },
  }));
  render(<App />);
}

function lancar(origem, valor) {
  userEvent.click(screen.getByRole('button', { name: /novo lançamento/i }));
  preencher(/origem/i, origem);
  preencher(/^valor/i, valor);
  userEvent.click(screen.getByRole('button', { name: /salvar lançamento/i }));
}

test('lançar, editar e excluir atualizam o saldo do pote', () => {
  comMes();
  expect(screen.getByText('Restam R$ 2.893,90')).toBeInTheDocument();

  lancar('Academia', '150');
  expect(screen.getByRole('cell', { name: /academia/i })).toBeInTheDocument();
  expect(screen.getByText('Restam R$ 2.743,90')).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /editar academia/i }));
  preencher(/^valor/i, '200');
  userEvent.click(screen.getByRole('button', { name: /salvar lançamento/i }));
  expect(screen.getByText('Restam R$ 2.693,90')).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /excluir academia/i }));
  expect(screen.queryByRole('cell', { name: /academia/i })).not.toBeInTheDocument();
  expect(screen.getByText('Restam R$ 2.893,90')).toBeInTheDocument();
});

test('parcelado com parcela maior que o total é rejeitado', () => {
  comMes();
  userEvent.click(screen.getByRole('button', { name: /novo lançamento/i }));
  preencher(/origem/i, 'Quest 3');
  preencher(/^valor/i, '353.34');
  userEvent.selectOptions(screen.getByLabelText(/tipo/i), 'parcelado');
  preencher(/parcela atual/i, '5');
  preencher(/total de parcelas/i, '3');
  userEvent.click(screen.getByRole('button', { name: /salvar lançamento/i }));
  expect(screen.getByText(/não pode passar do total/i)).toBeInTheDocument();
});

test('criar o próximo mês herda fixos e parcelas e pré-preenche os parâmetros', () => {
  const base = { id: 'x', data: '2026-11-10', metodo: 'Crédito', categoria: '' };
  localStorage.setItem(CHAVE, JSON.stringify({
    version: 1,
    meses: { '2026-11': {
      params: { diasUteis: 20, valorHora: 40, horasDia: 8, proLabore: 1621, dependentes: 0, quotas: 0,
                pct: { essenciais: 50, desejos: 20, investimentos: 30 } },
      lancamentos: [
        { ...base, id: 'a', pote: 'essenciais', origem: 'Academia', valor: 150, tipo: 'fixo' },
        { ...base, id: 'b', pote: 'desejos', origem: 'Quest 3', valor: 353.34, tipo: 'parcelado', parcela: { n: 9, total: 10 } },
        { ...base, id: 'c', pote: 'desejos', origem: 'Pizza', valor: 60, tipo: 'avulso' },
      ],
    } },
  }));
  render(<App />);

  userEvent.click(screen.getByRole('button', { name: /novo mês/i }));
  expect(screen.getByLabelText(/^mês$/i)).toHaveValue('2026-12');
  expect(screen.getByLabelText(/dias úteis/i)).toHaveValue(null);
  expect(screen.getByLabelText(/valor da hora/i)).toHaveValue(40);
  expect(screen.getByText(/herda 1 fixo e 1 parcela de novembro de 2026/i)).toBeInTheDocument();

  preencher(/dias úteis/i, '22');
  userEvent.click(screen.getByRole('button', { name: /criar mês/i }));

  expect(screen.getByRole('heading', { level: 1, name: /dezembro de 2026/i })).toBeInTheDocument();
  expect(screen.getByRole('cell', { name: /academia/i })).toBeInTheDocument();
  expect(screen.getByRole('cell', { name: /quest 3.*10\/10/i })).toBeInTheDocument();
  expect(screen.queryByRole('cell', { name: /pizza/i })).not.toBeInTheDocument();
});

test('página Meses lista os meses e abre um anterior', () => {
  const params = { diasUteis: 20, valorHora: 40, horasDia: 8, proLabore: 1621, dependentes: 0, quotas: 0,
                   pct: { essenciais: 50, desejos: 20, investimentos: 30 } };
  localStorage.setItem(CHAVE, JSON.stringify({
    version: 1,
    meses: { '2026-11': { params, lancamentos: [] }, '2026-12': { params: { ...params, diasUteis: 22 }, lancamentos: [] } },
  }));
  render(<App />);

  userEvent.click(screen.getByRole('button', { name: /^meses$/i }));
  const linhas = screen.getAllByRole('row').slice(1);
  expect(linhas[0]).toHaveTextContent(/dezembro de 2026/i);
  expect(linhas[1]).toHaveTextContent(/novembro de 2026/i);

  userEvent.click(screen.getByRole('button', { name: /novembro de 2026/i }));
  expect(screen.getByRole('heading', { level: 1, name: /novembro de 2026/i })).toBeInTheDocument();
});

test('editar parâmetros recalcula o líquido e mantém os lançamentos', () => {
  comMes();
  lancar('Academia', '150');
  userEvent.click(screen.getByRole('button', { name: /editar mês/i }));
  expect(screen.getByLabelText(/^mês$/i)).toBeDisabled();
  expect(screen.getByLabelText(/dias úteis/i)).toHaveValue(20);

  preencher(/dias úteis/i, '22');
  userEvent.click(screen.getByRole('button', { name: /salvar mês/i }));

  expect(screen.getAllByText('R$ 6.399,00').length).toBeGreaterThan(0);
  expect(screen.getByRole('cell', { name: /academia/i })).toBeInTheDocument();
});

test('excluir mês pede confirmação', () => {
  comMes();
  const confirmar = jest.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);

  userEvent.click(screen.getByRole('button', { name: /excluir mês/i }));
  expect(screen.getByRole('heading', { level: 1, name: /dezembro de 2026/i })).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /excluir mês/i }));
  expect(screen.getByRole('heading', { name: /nenhum mês ainda/i })).toBeInTheDocument();
  expect(confirmar).toHaveBeenCalledTimes(2);
  confirmar.mockRestore();
});

test('dashboard mostra sequência em andamento e dívida do cartão', () => {
  comMes();
  expect(screen.getByText('0 meses')).toBeInTheDocument();
  expect(screen.getByText(/faltam r\$ 1\.736,34 investidos para dezembro de 2026 contar/i)).toBeInTheDocument();
  expect(screen.getByText(/sem parcelas no cartão/i)).toBeInTheDocument();
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
