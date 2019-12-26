import {compareFunctionWDate, dateToChartRange} from "./myFunctions";

function handleOnUpdate(portfolioName) {
    // -- This should also be run when page loads (componentDidMount) --
    // Check date of the latest entry in appData[portfolioName].stocks.chart
    // Then select an appropriate range to fetch (example in handleAddStock). Fetch both chart and quote for all stocks
    // Then update quote
    // Then append the appropriate amount of data to the portfolio. (e.g. find entry with same date)

    let appData = this.state.appData;

    // Find the oldest missing chart entry. (Quote cannot be used since only time, no date, is given when exchange is open)
    let stocks = appData[portfolioName].stocks;
    let stockSymbols = [];
    let oldestLastDate = new Date().toISOString().slice(0,10);  // initialise as today, e.g. "2019-11-23"
    for (let stock in stocks) {
        if (stocks.hasOwnProperty(stock)) {
            stockSymbols.push(stock);
            // Sort the entries
            let entries = Object.values(stocks[stock].chart);  // Convert Object{} to Array[]
            entries.sort(compareFunctionWDate);
            // The latest value is now the last entry
            const lastDate = entries[entries.length - 1].date;
            // String (alphabetical) comparison can be done because the dates are in ISO format
            if (lastDate < oldestLastDate) {
                oldestLastDate = lastDate;
            }
        }
    }

    // Calculate the needed chartRange for fetching the data
    const chartRange = dateToChartRange(oldestLastDate);

    // Fetch the new stock data to be added to the existing data
    let dataFetcher = this.dataFetcher(stockSymbols, "quote,chart", chartRange);
    dataFetcher.then(stockData => {

    })
}