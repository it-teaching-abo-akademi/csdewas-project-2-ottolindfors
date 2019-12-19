import React from 'react';
import './App.css';
import {urlBuilder} from "./api";
import {loadFromLocalStorage} from "./myFunctions";

const LOCALSTORAGE_PORTFOLIOS_NAME = 'portfolios';

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

    savePortfolio(data) {
        /*
        Saves the portfolio (data) to local storage.
         */
        const portfolioName = this.props.name;
        localStorage.setItem(portfolioName, JSON.stringify(data));
        console.log("==> Saved portfolio '" + portfolioName + "' to local storage after fetching from api.");
    }

    dataFetcher(stockSymbols, type, chartRange) {
        /*
        Fetches latest quote and/or chart (historic data) for all stockSymbols.
         */
        const apiUrl = urlBuilder(stockSymbols, type, chartRange);
        this.setState({ loading: true });  // For loading indicator
        fetch(apiUrl)
            .then(response => {
                // "Parse" json
                if (response.ok) { return response.json() }
                else { throw new Error("Error while fetching from api...") }
            })
            .then(jsonData => {
                // Extract data and save to local storage
                console.log(jsonData);
                this.setState(
                    { data: jsonData, loading: false },
                    () => this.savePortfolio(jsonData)
                );
            })
            .catch(error => this.setState({ error: error}));
    }

    componentDidMount() {
        /*
        After component has mounted.
        Tries to load from local storage first then fetches stock data.
         */
        // TODO: Try to load from local storage first. Then fetch newest data.
        const stockSymbols = this.state.stockSymbols;
        const chartRange = this.state.chartRange;
        this.dataFetcher(stockSymbols, 'quote,chart', chartRange);
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

    /*
    USAGE (har testat och JSON.stringify() fungerar)

    // Add new empty stock
    jsonData["STK"] = {};

    // Add new empty chart
    jsonData["STK"]["chart"] = [];

    // Add new entry in chart
    jsonData["STK"]["chart"].push({date: "1994-02-16", open: 19.99});
    jsonData["STK"]["chart"].push({date: "1994-02-16", open: 29.99});
     */
    dataFetcher(stockSymbols, type, chartRange) {
        /*
        Fetches latest quote and/or chart (historic data) for all stockSymbols.
         */

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

    // Add individual elements
    addEmptyPortfolio(newPortfolioName) {
        // Get appData from state
        let appData = this.state.appData;
        // Add empty portfolio to appData
        appData[newPortfolioName] = {};
        // Set new state
        this.setState(
            { appData: appData },
            () => console.log("new portfolio:", newPortfolioName)
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
            () => console.log("new stock:", newStockName)
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
            () => console.log("new chart to stock:", toStock)
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
            () => console.log("new chart element:", newObjectWithData)
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
            () => console.log("new quote to stock:", newObjectWithData)
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
            () => console.log("new purchase to stock:", newObjectWithData)
        );
    }

    // Append a whole existing portfolio at once
    appendPortfolio(newPortfolioName, existingPortfolioContent) {
        // Get appData from state
        let appData = this.state.appData;
        // Add empty portfolio to appData
        appData[newPortfolioName] = existingPortfolioContent;
        // Set new state
        this.setState(
            { appData: appData },
            () => console.log("appended portfolio:", appData)
        );
    }

    componentDidMount() {
        /*
        FIRST TRY LOADING DATA FROM LOCAL STORAGE.
        IF THERE IS NOTHING IN LOCAL STORAGE THEN LOAD FROM INTERNET (MAYBE ONLY WHEN PRESSING UI REFRESH/GET BUTTON)
         */

        this.addEmptyPortfolio("My New Portfolio");
        this.addEmptyStock("My New Portfolio", "OOT");
        this.addEmptyChart("My New Portfolio", "OOT");
        this.addChartElement("My New Portfolio", "OOT", {date: "1994-02-16", open: 29.99});
        this.addChartElement("My New Portfolio", "OOT", {date: "1994-03-16", open: 29.99});
        this.addQuote("My New Portfolio", "OOT", {date: "1994-03-16", latestPrice: 29.99});
        this.addPurchase("My New Portfolio", "OOT", {date: "1994-02-16", latestPrice: 999.99});

        this.appendPortfolio("My Append Portfolio", this.state.appData["My New Portfolio"]);

        // Create a whole portfolio and then append it
        // dataFetcher uses fetch() so it returns a promise. Therefore newPortfolio.then() to acces the result value.
        const newPortfolio = this.dataFetcher(["AAPL","GOOGL","TWTR","FB"], 'quote,chart', '5d');
        newPortfolio.then(value => this.appendPortfolio("Big Portfolio", value));

        /*
        Load array of portfolio names from local storage.
        Throws error if not found and fails silently outputting error only to console.
         */
        try {
            const portfolios = loadFromLocalStorage(LOCALSTORAGE_PORTFOLIOS_NAME);  // Trows error if not found
            this.setState(
                { portfolios: portfolios },
                () => console.log("==> Loaded 'portfolios' from local storage")
            );
        }
        catch (error) {
            console.log("==>", error)
        }
    }

    render() {
        // Render portfolios
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
