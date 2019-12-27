import {compareFunctionWDate, dateToChartRange, saveToLocalStorage} from "./myFunctions";

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
function createAndAppendDummyPortfolio(newPortfolioName, stockSymbols, type, chartRange) {
    /*
    Creates and appends a whole portfolio at once (with dummy 'purchase' element) to the appData state
    */
    console.log("==> Creating dummy portfolio '" + newPortfolioName + "'");
    // dataFetcher uses fetch() so it returns a promise. Therefore newPortfolio.then() to access the result value.
    const newPortfolio = this.dataFetcher(stockSymbols, type, chartRange);
    newPortfolio.then(stockData =>
        {
            // Add dummy purchase data
            for (let key in stockData) {
                if (stockData.hasOwnProperty(key)) {
                    stockData[key]["purchase"] = {date: "1970-01-01", price: 10.00, shares: 7, currency: "USD"};
                }
            }
            // Add portfolio to appData
            let appData = this.state.appData;
            appData[newPortfolioName] = {"stocks": stockData};
            // Add currency and graph visualisation range preference
            appData[newPortfolioName]["userPrefs"] = {showInEuro: false, graphRange: "6m"};
            // Set state
            this.setState(
                { appData: appData },
                () => {
                    console.log("==> State set. Dummy purchase data added to" + newPortfolioName);
                    saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
                }
            )
        }
    );
}
function refreshPortfolio(portfolioName) {
    /*
    Refresh portfolio data (called on button press)
    */
    console.log("==> Refreshing portfolio data '" + portfolioName + "'");

    // Copy current portfolio
    let appData = this.state.appData;

    const stockSymbols = Object.keys(appData[portfolioName].stocks);
    const type = "quote,chart";  // These are the types the application always and only show
    const chartRange = "5d";  // Later improvement to only fetch the missing data to save loading time and server time (power)

    let newStockData = this.dataFetcher(stockSymbols, type, chartRange);
    newStockData.then(stockData => {
        for (let stock in stockData) {
            if (stockData.hasOwnProperty(stock)) {
                // Overwrite old stock data
                appData[portfolioName].stocks[stock].chart = stockData[stock].chart;
            }
        }
        console.log("==> Refreshed portfolio:" , appData[portfolioName]);
        this.setState(
            { appData: appData },
            () => {
                console.log("==> Set state with newStockData and range 5d !!!!!!!!!!!!!!!!");
                saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
            }
        );
    });
}
