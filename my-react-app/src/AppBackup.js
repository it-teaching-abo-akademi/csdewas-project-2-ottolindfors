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

class AppBackup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            portfolios: [], // Input from 'Add Portfolio' button. ["Portfolio 0", "Portfolio 1", "Portfolio 2"]
        };
    }

    componentDidMount() {
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

export default AppBackup;
