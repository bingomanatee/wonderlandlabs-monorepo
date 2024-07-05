import { Forest } from "../Forest";
import { ForestIF } from "../types";

type SalesDataIF = {
  sales: number;
  returns: number;
};

class SalesData implements SalesDataIF {
  constructor(public sales: number, public returns: number = 0) {}
}
const makeLogs = () => {
  const time = new Date(2025, 11, 1);
  function ds() {
    time.setMonth(time.getMonth() + 1);
    return time.toDateString();
  }
  return new Map<string, SalesDataIF>([
    [ds(), new SalesData(100, 0)],
    [ds(), new SalesData(3000, 20)],
    [ds(), new SalesData(20000, 400)],
    [ds(), new SalesData(25000, 2000)],
    [ds(), new SalesData(8000, 2000)],
  ]);
};
const SALES_SUMMARIES_TREE_NAME = "sales-summaries";

function summarizeSales(f: ForestIF) {
  if (!f.hasTree(SALES_SUMMARIES_TREE_NAME)) {
    f.addTree({ name: SALES_SUMMARIES_TREE_NAME });
  }
  let firstDate = "";
  let lastDate = "";

  const sales = f.tree("sales")!;
  let totalSales = 0;
  let totalReturns = 0;
  //@ts-ignore
  sales.values().forEach((saleData: SalesDataIF, date: string) => {
    if (!firstDate) {
      firstDate = date;
    }
    lastDate = date;
    totalSales += saleData.sales;
    totalReturns += saleData.returns;
  });

  f.set(SALES_SUMMARIES_TREE_NAME, `${firstDate}...${lastDate}`, {
    totalSales,
    totalReturns,
  });
}

describe("transact/Scope", () => {
  it("should not blow up", () => {
    const f = new Forest();
    f.addTree({ name: "sales", data: makeLogs() });

    f.transact(summarizeSales);

    // console.log('sales summaries:', f.tree(SALES_SUMMARIES_TREE_NAME)!.values());
    expect(f.tree(SALES_SUMMARIES_TREE_NAME)?.values()).toEqual(
      new Map([
        [
          "Thu Jan 01 2026...Fri May 01 2026",
          { totalSales: 56100, totalReturns: 4420 },
        ],
      ])
    );
  });
});
