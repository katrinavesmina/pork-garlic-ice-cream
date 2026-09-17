import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSeason, suppliedWinter } from '../calc.mjs';

const params = { price: 2, milkPrice: 20000, milkYield: 20000, salaries: 10000, bonusRate: 5, taxRate: 10, premises: [{ id: 'D', name: 'Premise D', rent: 17000, transport: .1 }] };
const machines = [{ id: 'M1', modelId: 'M1', name: 'Machine 1', capacity: 72000, purchaseCost: 35000, maintenance: 1800, depreciation: 4375, life: 8 }];
test('supplied Year 1 Winter verification case reconciles', () => {
  const r = calculateSeason({ ...suppliedWinter, opening: { cash: 100000, machines: [], debt: 0, taxLoss: 0 }, params, machines });
  assert.equal(r.netProfit, 13621);
  assert.equal(r.closingCash, 82996);
  assert.equal(r.bonus, 2691);
  assert.equal(r.tax, 1513);
  assert.equal(r.machines[0].remainingLife, 7);
});
