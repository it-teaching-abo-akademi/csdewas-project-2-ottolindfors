import React from 'react';
import './App.css';
import {urlBuilder} from "./api";
import {loadFromLocalStorage, saveToLocalStorage} from "./myFunctions";
import {AddPortfolioButton} from './AddPortfolioButton'
import {Portfolio} from "./Portfolio";

const LOCALSTORAGE_PORTFOLIOS_NAME = 'portfolios';
const LOCALSTORAGE_APPDATA_NAME = 'appData';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appData: {},  // All data
            loading: false,
        };
    }

    // Fetches latest quote and/or chart (historic data) for all stockSymbols
    dataFetcher(stockSymbols, type, chartRange) {
        const apiUrl = urlBuilder(stockSymbols, type, chartRange);
        return fetch(apiUrl)
            .then(response => {
                // "Parse" json
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("Error while fetching from api...")
                }
            })
            .then(jsonData => {
                return jsonData;
            })
            .catch(error => this.setState({error: error}));
    }

    // *** METHODS TO MANIPULATE THE STATE ***
    addEmptyPortfolio(newPortfolioName) {
        // Get appData from state
        let appData = this.state.appData;
        // Add empty portfolio to appData
        appData[newPortfolioName] = {};
        // Set new state
        this.setState(
            { appData: appData },
            () => {
                console.log("==> new empty portfolio added");
                console.log("==> Saving to local storage");
                saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
            }
            );
    }
    addEmptyStock(toPortfolio, newStockName) {
        // Get appData from state
        let appData = this.state.appData;
        // Add empty stock to portfolio
        appData[toPortfolio][newStockName] = {};
        // Set new state
        this.setState(
            { appData: appData },
            () => {
                console.log("==> new empty stock added");
                console.log("==> Saving to local storage");
                saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
            }
        );
    }
    addEmptyChart(toPortfolio, toStock) {
        // Get appData from state
        let appData = this.state.appData;
        // Add empty chart to stock
        appData[toPortfolio][toStock]["chart"] = [];
        // Set new state
        this.setState(
            { appData: appData },
            () => {
                console.log("==> new empty chart added");
                console.log("==> Saving to local storage");
                saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
            }
        );
    }
    addChartElement(toPortfolio, toStock, newObjectWithData) {
        /*
        newObjectWithData should be like {date: "1994-02-16", open: 29.99, ...}
         */
        // Get appData from state
        let appData = this.state.appData;
        // Add element to chart
        appData[toPortfolio][toStock]["chart"].push(newObjectWithData);
        // Set new state
        this.setState(
            { appData: appData },
            () => {
                console.log("==> new chart element added");
                console.log("==> Saving to local storage");
                saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
            }
        );
    }
    addQuote(toPortfolio, toStock, newObjectWithData) {
        /*
        newObjectWithData should be like {date: "1994-02-16", open: 29.99, ...}
         */
        // Get appData from state
        let appData = this.state.appData;
        // Add empty quote to stock
        appData[toPortfolio][toStock]["quote"] = newObjectWithData;
        // Set new state
        this.setState(
            { appData: appData },
            () => {
                console.log("==> new quote added");
                console.log("==> Saving to local storage");
                saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
            }
        );
    }
    addPurchase(toPortfolio, toStock, newObjectWithData) {
        /*
        newObjectWithData should be like {date: "1994-02-16", price: 29.99}
         */
        // Get appData from state
        let appData = this.state.appData;
        // Add purchase info to stock
        appData[toPortfolio][toStock]["purchase"] = newObjectWithData;
        // Set new state
        this.setState(
            { appData: appData },
            () => {
                console.log("==> new purchase added");
                console.log("==> Saving to local storage");
                saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
            }
        );
    }
    addDummyPurchase(toPortfolio) {
        // Get appData from state
        let appData = this.state.appData[toPortfolio];
        for (let key in appData) {
            if (appData.hasOwnProperty(key)) {
                const dummy = {date: "1970-01-01", price: 10.00, shares: 10};
                this.addPurchase(toPortfolio, key, dummy)
            }
        }
    }

    appendPortfolio(newPortfolioName, existingPortfolioContent) {
        /*
        Append a whole existing portfolio at once to the appData state
         */
        // Get appData from state
        let appData = this.state.appData;
        // Add empty portfolio to appData
        appData[newPortfolioName] = existingPortfolioContent;
        // Set new state
        this.setState(
            { appData: appData },
            () => {
                console.log("==> appended portfolio");
                console.log("==> Saving to local storage");
                saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);            }
        );
    }

    createAndAppendDummyPortfolio(newPortfolioName, stockSymbols, type, chartRange) {
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

    refreshPortfolio(portfolioName) {
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

    componentDidMount() {
        /*
        FIRST TRY LOADING DATA FROM LOCAL STORAGE.
        IF THERE IS NOTHING IN LOCAL STORAGE THEN LOAD FROM INTERNET (BUT ONLY ON USER INPUT REFRESH/GET/ADD BUTTON)
         */

        // Load array of portfolio names and all app data from local storage. Throws error if not found and fails silently outputting error only to console.
        try {
            const appData = loadFromLocalStorage(LOCALSTORAGE_APPDATA_NAME);  // Trows error if not found
            this.setState(
                { appData: appData },
                () => {
                    console.log("==> State set. Loaded 'portfolios' and 'appData' from local storage");
                    console.log("==> appData:", this.state.appData)
                }
            );
        }
        catch (error) {
            console.log("==>", error);
            // *** CREATE DUMMY DATA. DO NOT USE IN PRODUCTION ***
            console.log("==> Creating dummy data");
            this.createAndAppendDummyPortfolio("My Big Portfolio", ["AAPL","GOOGL","TWTR","FB"], 'quote,chart', 'max');
            this.createAndAppendDummyPortfolio("My Big Portfolio 2", ["AAPL","GOOGL","TWTR","FB"], 'quote,chart', 'max');
            this.createAndAppendDummyPortfolio("My Big Portfolio 3", ["AAPL","GOOGL","TWTR","FB"], 'quote,chart', 'max');
        }
    }

    render() {
        console.log("==> App render");
        // Get list of portfolios from appData
        const appData = this.state.appData;
        let portfolios = [];
        for (let portfolioName in appData) {
            if (appData.hasOwnProperty(portfolioName)) {
                portfolios.push(portfolioName);
            }
        }

        // Render portfolios and 'add portfolio' button
        return (
            <div className="App">
                <h1>SPMS</h1>
                <a href="https://iexcloud.io">Data provided by IEX Cloud</a>
                <p>15 minute delay in price</p>
                <AddPortfolioButton />
                {portfolios.map(portfolioName =>
                    // Pass portfolio name and portfolio data to the portfolio
                    <Portfolio key={portfolioName} name={portfolioName} portfolio={appData[portfolioName]} />
                )}
            </div>
        );
    }
}

export default App;
