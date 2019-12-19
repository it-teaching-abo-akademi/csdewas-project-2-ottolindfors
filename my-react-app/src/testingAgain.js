/*
A playground for testing arround in order to get the data from the API while keeping the App.js clean.
 */

import React from 'react';
import './App.css';
import {urlBuilder} from "./api";

class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // stockSymbols: [],
            stockSymbols: ['AAPL', 'FB', 'TWTR'],  // Input from 'add' button
            data: {},  // Latest data from today (quote) and historic data (chart)
            // chartRange: null,
            chartRange: '5d',  // Input from select menu
            error: null,
        };
    }

    savePortfolio(data) {
        localStorage.setItem(this.props.name, JSON.stringify(data));
        console.log("==> Saved portfolio '" + this.props.name + "' to local storage after fetching from api.");
    }

    dataFetcher(stockSymbols, type, chartRange) {
        /*
        Fetches latest quote for all stockSymbols
        or
        Fetches historic stock data (chart data) for all stockSymbols
         */
        const apiUrl = urlBuilder(stockSymbols, type, chartRange);
        fetch(apiUrl)
            .then(response => {
                // Parse json
                if (response.ok) { return response.json() }
                else { throw new Error("Error while fetching from api...") }
            })
            .then(jsonData => {
                // Extract data and save to local storage
                this.setState({ data: jsonData }, () => this.savePortfolio(jsonData));
            })
            .catch(error => this.setState({ error: error}));
    }

    componentDidMount() {
        // Fetching stock data after component has mounted.
        const stockSymbols = this.state.stockSymbols;
        const chartRange = this.state.chartRange;
        this.dataFetcher(stockSymbols, 'quote,chart', chartRange);
    }

    render() {
        // Render error if any
        const error = this.state.error;
        if (error) { return <p>{error.message}</p> }

        // Render normally if no error
        return (
            <div>
                <p>Portfolio</p>
            </div>
        );
    }
}

class TestAgainApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            portfolios: [], // Input from 'Add Portfolio' button. ["Portfolio 0", "Portfolio 1", "Portfolio 2"],
        };
    }

    loadFromLocalStorage(key) {
        let data = JSON.parse(localStorage.getItem(key));
        // Check if null
        if (!data) {
            throw new Error("'" + key + "' not in local storage");
        }
        return data;
    }

    componentDidMount() {
        // Load array of portfolio names from local storage
        try {
            let portfolios = this.loadFromLocalStorage('portfolios');  // Trows error if not found
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

export default TestAgainApp;
