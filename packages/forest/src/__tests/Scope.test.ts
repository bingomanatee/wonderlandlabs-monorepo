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

  f.set(
    SALES_SUMMARIES_TREE_NAME,
    `${firstDate}...${lastDate}`,
    new SalesData(totalSales, totalReturns)
  );
}

describe("transact/Scope", () => {
  it("should allow a successful transact scope to complete", () => {
    const f = new Forest();
    f.addTree({ name: "sales", data: makeLogs() });

    f.transact(summarizeSales);

    expect(f.tree(SALES_SUMMARIES_TREE_NAME)?.values()).toEqual(
      new Map([
        ["Thu Jan 01 2026...Fri May 01 2026", new SalesData(56100, 4420)],
      ])
    );
  });

  it("should reset any changes made during a broken transact fn", () => {
    const f = new Forest();
    f.addTree({ name: "sales", data: makeLogs() });

    expect(() => {
      f.transact((f) => {
        const sales = f.tree("sales")!;

        sales.del("Sun Mar 01 2026");
        sales.set("Sun Jan 01 2027", new SalesData(1000, 4000));
        sales.branches.forEach((branch) => {
          console.log('---- branch', branch.id, branch.data, branch.cause.toString(), branch.causeID);
        })
        throw new Error("boom");
      });
    }).toThrow();

    const initialValues = makeLogs();

    const currentValues = f.tree("sales")?.values();
    console.log(
      "--- currentValues are ",
      currentValues,
      "newValues:",
      initialValues
    );
    expect(currentValues).toEqual(initialValues);
  });
});