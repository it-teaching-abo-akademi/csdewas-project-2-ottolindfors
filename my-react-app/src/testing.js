/*
A playground for testing arround in ordet to get the data from the API while keeping the App.js clean.
 */

import React from 'react';
import './App.css';
import {urlBuilder} from "./api";

class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // stockSymbols: [],
            stockSymbols: ['AAPL', 'FB', 'TWTR'],
            quoteData: [],  // Latest data from today
            chartData: [],  // historic data
            // chartRange: null,
            chartRange: '5d',
            error: null,
        };
    }

    dataFetcher(stockSymbols, type, chartRange) {
        /*
        Fetches lates quote for all stockSymbols
        or
        Fetches historic stock data (chart data) for all stockSymbols
         */
        const apiUrl = urlBuilder(stockSymbols, type, chartRange);
        let data = [];
        fetch(apiUrl)
            .then(response => {
                // Parse json
                if (response.ok) { return response.json() }
                else { throw new Error("Error while fetching from api...") }
            })
            .then(jsonData => {
                // Extract key (stock symbol) and value (latest quote / chart data)
                for (let [key, value] of Object.entries(jsonData)) {
                    if (jsonData.hasOwnProperty(key)){
                        data[key] = value[type];
                    }
                }
            })
            .catch(error => this.setState({ error: error}));
        return data;
    }

    componentDidMount() {
        /*
        Fetch stock data after component has rendered.
         */
        const stockSymbols = this.state.stockSymbols;
        const chartRange = this.state.chartRange;

        let quoteData = [];
        let chartData = [];
        quoteData = this.dataFetcher(stockSymbols, 'quote');
        chartData = this.dataFetcher(stockSymbols, 'chart', chartRange);
        this.setState({
            quoteData: quoteData,
            chartData: chartData,
        });
    }

    render() {
        console.log(this.state);
        // console.log(urlBuilder(['AAPL', 'FB', 'TWTR'], 'chart', '5d'));
        const error = this.state.error;
        if (error) { return <p>{error.message}</p> }
        return <p>Portfolio</p>;
    }
}

class TestApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // portfolios: [],
            portfolios: ["Portfolio 0", "Portfolio 1", "Portfolio 2"],
        };
    }

    render() {
        return (
            <div className="App">
                <h1>SPMS</h1>
                <Portfolio />
            </div>
        );
    }
}

export default TestApp;
