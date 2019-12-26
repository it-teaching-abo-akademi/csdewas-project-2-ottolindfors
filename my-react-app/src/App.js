import React from 'react';
import './App.css';
import {urlBuilder, urlBuilderDate} from "./api";
import {dateToChartRange, loadFromLocalStorage, saveToLocalStorage} from "./myFunctions";
import {AddPortfolioModal} from './AddPortfolioModal'
import {Portfolio} from "./Portfolio";

const LOCALSTORAGE_APPDATA_NAME = 'appData';
const DEFAULT_USER_PREFS = {showInEuro: false, graphRange: "6m"};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appData: {},  // All data
            showAddPortfolioModal: false,
            loading: false,
        };
        this.toggleShowAddPortfolioModal = this.toggleShowAddPortfolioModal.bind(this);
        this.handleAddPortfolio = this.handleAddPortfolio.bind(this);
        this.handleAddStock = this.handleAddStock.bind(this);
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
    puchasePriceFetcher(stockSymbol, yyyymmdd) {
        const apiUrl = urlBuilderDate(stockSymbol, yyyymmdd);
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
                return jsonData[0].close;
            })
            .catch(error => this.setState({error: error}));
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
        console.log("==> componentDidLoad");
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
            /*
            console.log("==> Creating dummy data");
            this.createAndAppendDummyPortfolio("My Big Portfolio", ["AAPL","GOOGL","TWTR","FB"], 'quote,chart', 'max');
            this.createAndAppendDummyPortfolio("My Big Portfolio 2", ["AAPL","GOOGL","TWTR","FB"], 'quote,chart', 'max');
            this.createAndAppendDummyPortfolio("My Big Portfolio 3", ["AAPL","GOOGL","TWTR","FB"], 'quote,chart', 'max');
             */

        }
    }

    toggleShowAddPortfolioModal() {
        this.setState({ showAddPortfolioModal: !this.state.showAddPortfolioModal });
    };
    handleAddPortfolio(newPortfolioName) {
        // Hide the modal
        this.toggleShowAddPortfolioModal();
        // Create new portfolio with no stocks default user preferences.
        console.log("==> Creating new portfolio '" + newPortfolioName + "'");
        let appData = this.state.appData;
        appData[newPortfolioName] = {"userPrefs": DEFAULT_USER_PREFS};
        appData[newPortfolioName]["stocks"] = {};
        this.setState(
            {appData: appData},
            () => {
                console.log("==> Created new portfolio '" + newPortfolioName + "'");
                saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
            }
        );
    }
    handleAddStock(portfolioName, stockSymbol, purchaseDate, purchasePrice, shares) {
        // Add a new stock to the portfolio in appData and save to local storage.
        console.log("==> Adding stock to", portfolioName, stockSymbol, purchaseDate, purchasePrice, shares);

        // Calculate the needed chartRange
        const chartRange = dateToChartRange(purchaseDate);
        // Fetch chart and quota data.
        const type = 'quote,chart';

        let dataFetcher = this.dataFetcher([stockSymbol], type, chartRange);
        dataFetcher.then(stockData => {
            const stockSymbol = Object.keys(stockData)[0];  // exact same as stockSymbol

            // Clean the data for a smaller storage footprint

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

            // TODO: Resolve issue where an existing stock gets replaced if it is added twice.
            //  E.g. Portfolio has 4 AAPL stocks. Adding more AAPL stocks would just overvrite the existing ones with the new ones.
            //  It should create a new separate entry instead.

            // Add quote, chart and purchase to existing portfolio
            let appData = this.state.appData;
            appData[portfolioName].stocks[stockSymbol] = {"quote": quote, "chart": chart, "purchase": purchase};

            // Set state and save to local storage
            this.setState(
                { appData: appData },
                () => {
                    console.log("==> State set. Stock data added to '" + portfolioName + "'");
                    saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
                }
            )
        });
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
                <button
                    onClick={this.toggleShowAddPortfolioModal}>
                    Add portfolio
                </button>
                <AddPortfolioModal
                    show={this.state.showAddPortfolioModal}
                    onCancel={this.toggleShowAddPortfolioModal}
                    onAdd={this.handleAddPortfolio}
                    portfolios={portfolios}>
                    "We are the children of this modal"
                </AddPortfolioModal>
                {portfolios.map(portfolioName =>
                    // Pass portfolio name and portfolio data to the portfolio
                    <Portfolio
                        key={portfolioName}
                        name={portfolioName}
                        portfolio={appData[portfolioName]}
                        onAddStock={this.handleAddStock}
                    />
                )}
            </div>
        );
    }
}

export default App;
