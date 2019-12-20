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
            portfolios: [], // Should maybe not be used as it can be derived from appData. Input from 'Add Portfolio' button. ["Portfolio 0", "Portfolio 1", "Portfolio 2"]
            appData: {},  // All data
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
                // Extract data and save to local storage
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
    // Append a whole existing portfolio at once to the appData state
    appendPortfolio(newPortfolioName, existingPortfolioContent) {
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

    // Create and append a whole portfolio at once (with dummy 'purchase' element) to the appData state
    createAndAppendPortfolio(newPortfolioName, stockSymbols, type, chartRange) {
        // dataFetcher uses fetch() so it returns a promise. Therefore newPortfolio.then() to access the result value.
        const newPortfolio = this.dataFetcher(stockSymbols, type, chartRange);
        newPortfolio.then(portfolioData =>
            {
                // Add dummy purchase data
                for (let key in portfolioData) {
                    if (portfolioData.hasOwnProperty(key)) {
                        portfolioData[key]["purchase"] = {date: "1970-01-01", price: 10.00, shares: 10};
                    }
                }
                // Add portfolio to appData
                let appData = this.state.appData;
                appData[newPortfolioName] = portfolioData;
                // Set state
                this.setState(
                    { appData: appData },
                    () => {
                        console.log("==> Data fetched, dummy purchase data added");
                        saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
                    }
                )
            }
        );
    }

    // Load data from local storage if avalible
    componentDidMount() {
        /*
        FIRST TRY LOADING DATA FROM LOCAL STORAGE.
        IF THERE IS NOTHING IN LOCAL STORAGE THEN LOAD FROM INTERNET (BUT ONLY ON USER INPUT REFRESH/GET/ADD BUTTON)
         */

        // *** CREATE DUMMY DATA. DO NOT USE IN PRODUCTION ***
        console.log("==> Creating dummy data: ");
        /*
        this.addEmptyPortfolio("My New Portfolio");
        this.addEmptyStock("My New Portfolio", "OOT");
        this.addEmptyChart("My New Portfolio", "OOT");
        this.addChartElement("My New Portfolio", "OOT", {date: "1994-02-16", open: 29.99});
        this.addChartElement("My New Portfolio", "OOT", {date: "1994-03-16", open: 29.99});
        this.addQuote("My New Portfolio", "OOT", {date: "1994-03-16", latestPrice: 29.99});
        this.addPurchase("My New Portfolio", "OOT", {date: "1994-02-16", value: 999.99});
        this.appendPortfolio("My Append Portfolio", this.state.appData["My New Portfolio"]);
         */
        this.createAndAppendPortfolio("My Big Portfolio", ["AAPL","GOOGL","TWTR","FB"], 'quote,chart', '5d');
        this.createAndAppendPortfolio("My Big Portfolio 2", ["AAPL","GOOGL","TWTR","FB"], 'quote,chart', '5d');
        this.createAndAppendPortfolio("My Big Portfolio 3", ["AAPL","GOOGL","TWTR","FB"], 'quote,chart', '5d');

        // Load array of portfolio names and all app data from local storage.
        //Throws error if not found and fails silently outputting error only to console.
        try {
            const portfolios = loadFromLocalStorage(LOCALSTORAGE_PORTFOLIOS_NAME);  // Trows error if not found
            const appData = loadFromLocalStorage(LOCALSTORAGE_APPDATA_NAME);  // Trows error if not found
            this.setState(
                { portfolios: portfolios, appData: appData },
                () => {
                    console.log("==> Loaded 'portfolios' and 'appData' from local storage");
                    console.log("==> appData:", this.state.appData)
                }
            );
        }
        catch (error) {
            console.log("==>", error);
        }
    }

    render() {
        console.log("==> App render");
        // Get list of portfolios from appData
        const appData = this.state.appData;
        let portfolios = [];
        for (let portfolio in appData) {
            if (appData.hasOwnProperty(portfolio)) {
                portfolios.push(portfolio);
            }
        }

        // Render portfolios and 'add portfolio' button
        return (
            <div className="App">
                <h1>SPMS</h1>
                <a href="https://iexcloud.io">Data provided by IEX Cloud</a>
                <p>15 minute delay in price</p>
                <AddPortfolioButton />
                {portfolios.map(portfolio =>
                    // Pass portfolio name and portfolio data to the portfolio
                    <Portfolio key={portfolio} name={portfolio} portfolioData={appData[portfolio]}/>
                )}
            </div>
        );
    }
}

export default App;
