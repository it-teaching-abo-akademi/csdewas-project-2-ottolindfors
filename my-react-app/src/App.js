import React from 'react';
import './App.css';
import {urlBuilder} from "./api";
import {loadFromLocalStorage, saveToLocalStorage} from "./myFunctions";

const LOCALSTORAGE_PORTFOLIOS_NAME = 'portfolios';
const LOCALSTORAGE_APPDATA_NAME = 'appData';

class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // stockSymbols: [],  // Input from 'add' button
            stockSymbols: ['AAPL', 'FB', 'TWTR'],
            data: {},
            // chartRange: null,  // Input from select menu
            chartRange: '5d',
            error: null,
            loading: false,
        };
    }

    render() {
        // Render error if any
        const error = this.state.error;
        if (error) { return <p>{error.message}</p> }

        // Render indicator if loading
        if (this.state.loading) { return <p>Loading ...</p> }

        // Render normally if no error
        return (
            <div>
                <p>{this.props.name}</p>
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            portfolios: [], // Input from 'Add Portfolio' button. ["Portfolio 0", "Portfolio 1", "Portfolio 2"]
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
                console.log(jsonData);
                return jsonData;
            })
            .catch(error => this.setState({error: error}));
    }

    // Add individual elements to the appData state
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
                const dummy = {date: "1970-01-01", open: 10.00};
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
        newPortfolio.then(value =>
            {
                this.appendPortfolio(newPortfolioName, value);
                // Remove next line to remove dummy purchase values
                this.addDummyPurchase(newPortfolioName)
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
        this.addEmptyPortfolio("My New Portfolio");
        this.addEmptyStock("My New Portfolio", "OOT");
        this.addEmptyChart("My New Portfolio", "OOT");
        this.addChartElement("My New Portfolio", "OOT", {date: "1994-02-16", open: 29.99});
        this.addChartElement("My New Portfolio", "OOT", {date: "1994-03-16", open: 29.99});
        this.addQuote("My New Portfolio", "OOT", {date: "1994-03-16", latestPrice: 29.99});
        this.addPurchase("My New Portfolio", "OOT", {date: "1994-02-16", value: 999.99});
        this.appendPortfolio("My Append Portfolio", this.state.appData["My New Portfolio"]);
        this.createAndAppendPortfolio("My Big Portfolio", ["AAPL","GOOGL","TWTR","FB"], 'quote,chart', '5d');
        saveToLocalStorage(["My New Portfolio", "My Append Portfolio", "My Big Portfolio"], LOCALSTORAGE_PORTFOLIOS_NAME);

        // Load array of portfolio names and all app data from local storage.
        //Throws error if not found and fails silently outputting error only to console.
        try {
            const portfolios = loadFromLocalStorage(LOCALSTORAGE_PORTFOLIOS_NAME);  // Trows error if not found
            const appData = loadFromLocalStorage(LOCALSTORAGE_APPDATA_NAME);  // Trows error if not found
            this.setState(
                { portfolios: portfolios, appData: appData },
                () => {
                    console.log("==> Loaded 'portfolios' and 'appData' from local storage");
                    console.log(this.state.appData)
                }
            );
        }
        catch (error) {
            console.log("==>", error);
        }
    }

    render() {
        // Render portfolios
        console.log("appData: ", this.state.appData);
        return (
            <div className="App">
                <h1>SPMS</h1>
                {this.state.portfolios.map(portfolio =>
                    <Portfolio key={portfolio} name={portfolio}/>
                )}
            </div>
        );
    }
}

export default App;
