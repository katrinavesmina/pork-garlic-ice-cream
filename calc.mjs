export const round = (n) => Math.round(Number(n || 0));
export const money = (n) => round(n).toLocaleString('en-US');

export const suppliedWinter = {
  openingCash: 100000, production: 60000, milkTons: 3, salesRequest: 60000,
  assumedSales: 60000, market: 3000, premise: 'D', machineUse: ['M1'],
  purchases: ['M1'], borrowing: 0, interestRate: 0, repaymentTerm: 0,
  principalRepayment: 0, extraRepayment: 0, minimumCosts: 0,
  price: 2, milkPrice: 20000, milkYield: 20000, salaries: 10000,
  bonusRate: 5, taxRate: 10
};

const normMachine = (m) => ({ ...m, remainingLife: Math.max(0, round(m.remainingLife)), qty: round(m.qty || 1) });

/** Pure season calculation. Cash transactions remain distinct from P&L. */
export function calculateSeason(input) {
  const p = input.params;
  const priorMachines = (input.opening?.machines || []).map(normMachine);
  const purchaseIds = input.purchases || [];
  const catalog = input.machines || [];
  const bought = purchaseIds.map((id, i) => {
    const base = catalog.find((m) => m.id === id) || {};
    return normMachine({ ...base, id: `${id}-new-${i}`, sourceId: id, remainingLife: base.life || 0 });
  });
  const owned = [...priorMachines, ...bought].filter((m) => m.remainingLife > 0);
  const used = new Set(input.machineUse || []);
  const active = owned.filter((m) => used.has(m.id) || used.has(m.sourceId) || used.has(m.modelId));
  const activeCapacity = active.reduce((s, m) => s + round(m.capacity), 0);
  const milkSupported = round(input.milkTons) * round(p.milkYield);
  const requestedProduction = round(input.production);
  const production = Math.max(0, Math.min(requestedProduction, milkSupported, activeCapacity));
  const requestedSales = round(input.salesRequest);
  const assumedSales = round(input.assumedSales ?? requestedSales);
  const actualSales = Math.max(0, Math.min(requestedSales, assumedSales, production));
  const unusedMilk = Math.max(0, milkSupported - production);
  const spoilage = Math.max(0, production - actualSales);
  const premiseIds = Array.isArray(input.premises) ? input.premises : [input.premise];
  const premises = premiseIds.map((id) => p.premises.find((x) => x.id === id)).filter(Boolean);
  const uniquePremises = premises.length ? premises : [];
  const enteredAllocation = input.premiseProduction || {};
  const enteredTotal = uniquePremises.reduce((sum, premise) => sum + Math.max(0, Number(enteredAllocation[premise.id] || 0)), 0);
  // An entered premise allocation is scaled to the achievable production. When no
  // allocation is entered, production is split evenly as a transparent fallback.
  const shares = uniquePremises.map(premise => enteredTotal > 0 ? Math.max(0, Number(enteredAllocation[premise.id] || 0)) / enteredTotal : 1 / Math.max(1, uniquePremises.length));
  const allocate = (total) => {
    let posted = 0;
    return uniquePremises.map((premise, index) => {
      const amount = index === uniquePremises.length - 1 ? total - posted : round(total * shares[index]);
      posted += amount;
      return { premise, amount };
    });
  };
  const productionAllocation = allocate(production);
  const salesAllocation = allocate(actualSales);
  const premiseAllocation = uniquePremises.map((premise, index) => ({
    name: premise.name,
    production: productionAllocation[index].amount,
    sales: salesAllocation[index].amount,
    transport: round(salesAllocation[index].amount * Number(premise.transport || 0))
  }));
  const transport = premiseAllocation.reduce((sum, item) => sum + item.transport, 0);
  const rent = uniquePremises.reduce((s, premise) => s + round(premise.rent), 0);
  const maintenance = owned.reduce((s, m) => s + round(m.maintenance), 0);
  const depreciation = owned.reduce((s, m) => s + round(m.depreciation), 0);
  const milk = round(input.milkTons) * round(p.milkPrice);
  const revenue = actualSales * round(p.price);
  // Year 1 rules: bonus is 5% of positive gross profit, before all operating costs below.
  const grossProfit = revenue - milk - maintenance - depreciation;
  const bonus = round(Math.max(0, grossProfit) * (Number(p.bonusRate || 0) / 100));
  const openingDebt = round(input.opening?.debt);
  const borrowing = round(input.borrowing);
  const interest = round((openingDebt + borrowing) * (Number(input.interestRate || 0) / 100));
  const preTaxProfit = revenue - milk - maintenance - depreciation - transport - round(input.market) - bonus - round(p.salaries) - rent - interest - round(input.minimumCosts);
  const openingTaxLoss = round(input.opening?.taxLoss);
  const taxLossUsed = Math.min(Math.max(0, preTaxProfit), openingTaxLoss);
  const taxableProfit = Math.max(0, preTaxProfit - taxLossUsed);
  const tax = round(taxableProfit * (Number(p.taxRate || 0) / 100));
  const netProfit = preTaxProfit - tax;
  const taxLoss = Math.max(0, openingTaxLoss - taxLossUsed) + Math.max(0, -preTaxProfit);
  const machinePurchases = bought.reduce((s, m) => s + round(m.purchaseCost), 0);
  const scheduledPrincipal = round(input.principalRepayment) || (round(input.repaymentTerm) > 0 ? round((openingDebt + borrowing) / round(input.repaymentTerm)) : 0);
  const principalRepayment = Math.min(openingDebt + borrowing, Math.max(0, scheduledPrincipal + round(input.extraRepayment)));
  const cashBeforeFinance = round(input.opening?.cash) + revenue - milk - maintenance - transport - round(input.market) - bonus - round(p.salaries) - rent - interest - round(input.minimumCosts) - tax - machinePurchases;
  const closingCash = cashBeforeFinance + borrowing - principalRepayment;
  const nextMachines = owned.map((m) => ({ ...m, remainingLife: Math.max(0, round(m.remainingLife) - 1) })).filter((m) => m.remainingLife > 0);
  return {
    requestedProduction, production, milkSupported, activeCapacity, requestedSales, assumedSales, actualSales, unusedMilk, spoilage,
    revenue, milk, maintenance, depreciation, grossProfit, transport: round(transport), market: round(input.market), bonus, salaries: round(p.salaries), rent,
    interest, minimumCosts: round(input.minimumCosts), preTaxProfit, taxLossUsed, taxableProfit, tax, netProfit,
    machinePurchases, borrowing, principalRepayment, cashBeforeFinance, closingCash, debt: openingDebt + borrowing - principalRepayment,
    taxLoss, machines: nextMachines, premises: uniquePremises.map((x) => x.name), premiseAllocation, flags: {
      productionCapped: requestedProduction > production, negativeBeforeFinance: cashBeforeFinance < 0, negativeClosing: closingCash < 0
    }
  };
}

export function calculateBridge(state) {
  let opening = { cash: round(state.winter.openingCash), machines: [], debt: 0, taxLoss: 0 };
  const seasons = [];
  for (const key of ['winter', 'spring', 'summer', 'autumn']) {
    const entry = state[key];
    const result = calculateSeason({ ...entry, opening, params: state.year1Params, machines: state.year1Machines });
    seasons.push({ key, result });
    opening = { cash: result.closingCash, machines: result.machines, debt: result.debt, taxLoss: result.taxLoss };
  }
  return { seasons, ending: opening, annualProfit: seasons.reduce((sum, x) => sum + x.result.netProfit, 0) };
}
