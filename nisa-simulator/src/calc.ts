export interface YearlyResult {
  year: number;
  principal: number;
  balance: number;
  profit: number;
}

export interface SimulationInput {
  initialAmount: number;
  monthlyAmount: number;
  annualRatePercent: number;
  years: number;
}

export interface SimulationResult {
  yearly: YearlyResult[];
  totalPrincipal: number;
  totalProfit: number;
  finalBalance: number;
}

export function simulate({
  initialAmount,
  monthlyAmount,
  annualRatePercent,
  years,
}: SimulationInput): SimulationResult {
  const monthlyRate = annualRatePercent / 100 / 12;
  const yearly: YearlyResult[] = [];

  let balance = initialAmount;
  let principal = initialAmount;

  yearly.push({ year: 0, principal, balance, profit: balance - principal });

  for (let year = 1; year <= years; year++) {
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + monthlyRate) + monthlyAmount;
      principal += monthlyAmount;
    }
    yearly.push({
      year,
      principal,
      balance,
      profit: balance - principal,
    });
  }

  const finalBalance = balance;
  const totalPrincipal = principal;
  const totalProfit = finalBalance - totalPrincipal;

  return { yearly, totalPrincipal, totalProfit, finalBalance };
}
