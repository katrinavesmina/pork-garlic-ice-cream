# Pork and Garlic Ice Cream Co. — Year 2 Winter Strategy Planner

A responsive, browser-only classroom planning tool that compares **only two Year 2 Winter decisions**: Winter A and Winter B. It does not invent a complete Year 2 strategy for the other seasons.

## What it does

- Saves the supplied Year 1 Winter verification case and checks for net profit of **Sh 13,621** and closing cash of **Sh 82,996**.
- Provides editable Spring, Summer, and Autumn Year 1 planning sections, prominently marked as estimates until real classroom results replace them.
- Rolls closing cash, machines and their remaining lives, loans, and tax-loss pools through the Year 1 bridge.
- Uses the Autumn closing position (or a clearly marked manual actual-results override) as the common starting point for both Year 2 Winter scenarios.
- Includes editable Year 2 estimate assumptions for sales, milk, premises, machines, costs, salaries, bonus and tax. Defaults copied from Year 1 are explicitly reference-only, not confirmed Year 2 rules.
- Calculates capacity limits, sales, unused milk, spoilage, P&L, cash flow, tax losses, cash warnings, and lower-sales sensitivities with whole-shilling accounting lines.
- Stores all edits in the browser using local storage.

## Important assumptions

The known 410,000-unit Year 2 Winter market forecast is displayed as a reference, not promised sales. The Year 1 Spring–Autumn entries start as empty estimates; the planner deliberately does not fabricate classroom results. In the supplied Winter test, the editable Sh 4,204 minimum-cost line is required to reconcile the given result. The tax rate is zero in that test because no tax rate was provided.

Selected production premises split planned production evenly by default; sold units and transport then follow that production proportion. Maintenance and depreciation apply to every owned machine, including an idle machine. Machine purchases and loan principal affect cash flow but are excluded from profit.

## Update process

1. Click **Restore supplied Winter test case** if the saved test has been changed; it should show PASS.
2. Replace each Year 1 Spring, Summer and Autumn estimate with official classroom inputs as they become available.
3. If only the final actual Autumn position is available, activate the **Manual Autumn actual-results override** and enter actual cash, debt, tax-loss pool and Machine 1 life.
4. Confirm official Year 2 rules, then replace the editable Year 2 estimates before choosing a scenario.
5. Use the calculation and lower-sales sensitivity as discussion support; the recommendation is intentionally provisional.

## Run and verify

No dependency installation is required.

```sh
npm test
npm run build
python3 -m http.server 4173
```

Open `http://localhost:4173` and confirm the supplied Winter card shows PASS.
