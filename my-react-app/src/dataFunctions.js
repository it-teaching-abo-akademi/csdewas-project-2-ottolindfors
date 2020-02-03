// TODO: reuse code

export function minimizeData(stockData, appData, portfolioName, purchaseDate, purchasePrice, shares) {
    // Clean data fetched from API for a smaller storage footprint

    const stockSymbol = Object.keys(stockData)[0];

    // Get only the necessary quote data
    let quote = {};
    quote["companyName"] = stockData[stockSymbol].quote["companyName"];
    quote["latestPrice"] = stockData[stockSymbol].quote["latestPrice"];

    // Get only the necessary chart data
    let chart = {};
    const chartData = stockData[stockSymbol].chart;
    for (let key in chartData) {
        if (chartData.hasOwnProperty(key)) {
            chart[key] = {"date": chartData[key].date, "close": chartData[key].close};
        }
    }

    // Purchase info
    const purchase = {date: purchaseDate, price: purchasePrice, shares: shares, currency: "USD"};  // default currency "USD"

    // Add quote, chart and purchase to existing portfolio
    appData[portfolioName].stocks[stockSymbol] = {"quote": quote, "chart": chart, "purchase": purchase};

    return appData;
}

/*
Clean data fetched from API for a smaller storage footprint
Does not manipulate purchase date
 */
export function minimizeDataStocksOnly(stockData, appData, portfolioName) {
    const stockSymbol = Object.keys(stockData)[0];

    // Get only the necessary quote data
    let quote = {};
    quote["companyName"] = stockData[stockSymbol].quote["companyName"];
    quote["latestPrice"] = stockData[stockSymbol].quote["latestPrice"];

    // Get only the necessary chart data
    let chart = {};
    const chartData = stockData[stockSymbol].chart;
    for (let key in chartData) {
        if (chartData.hasOwnProperty(key)) {
            chart[key] = {"date": chartData[key].date, "close": chartData[key].close};
        }
    }

    // Add quote, chart and purchase to existing portfolio
    appData[portfolioName].stocks[stockSymbol]["quote"] = quote;
    appData[portfolioName].stocks[stockSymbol]["chart"] = chart;

    return appData;
}