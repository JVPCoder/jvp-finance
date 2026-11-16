import { brl } from './formato';

test('brl não mostra sinal em zero', () => {
  expect(brl(-0)).toBe('R$ 0,00');
  expect(brl(-0.001)).toBe('R$ 0,00');
  expect(brl(-324.2)).toBe('-R$ 324,20');
  expect(brl(5787.8)).toBe('R$ 5.787,80');
});
