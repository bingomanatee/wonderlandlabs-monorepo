"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Forest_1 = require("../Forest");
class SalesData {
  constructor(sales, returns = 0) {
    this.sales = sales;
    this.returns = returns;
  }
}
const makeLogs = () => {
  const time = new Date(2025, 11, 1);
  function ds() {
    time.setMonth(time.getMonth() + 1);
    return time.toDateString();
  }
  return new Map([
    [ds(), new SalesData(100, 0)],
    [ds(), new SalesData(3000, 20)],
    [ds(), new SalesData(20000, 400)],
    [ds(), new SalesData(25000, 2000)],
    [ds(), new SalesData(8000, 2000)],
  ]);
};
describe("transact/Scope", () => {
  it("should not blow up", () => {
    const f = new Forest_1.Forest();
    f.addTree({ name: "sales", data: makeLogs() });
    f.transact((f) => {
      if (f.hasTree("sales-summaries")) {
        f.addTree({ name: "sales-summaries" });
      }
      let firstDate = "";
      let lastDate = "";
      const sales = f.tree("sales");
      let totalSales = 0;
      let totalReturns = 0;
      //@ts-ignore
      sales.values().forEach((saleData, date) => {
        if (!firstDate) {
          firstDate = date;
        }
        lastDate = date;
        totalSales += saleData.sales;
        totalReturns += saleData.returns;
      });
      f.set("sales-summaries", `${firstDate}...${lastDate}`, {
        totalSales,
        totalReturns,
      });
    });
    console.log("sales summaries:", f.tree("sales-summaries").values);
  });
});
