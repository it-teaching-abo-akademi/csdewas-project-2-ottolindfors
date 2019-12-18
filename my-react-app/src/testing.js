/*
A playground for testing arround in ordet to get the data from the API while keeping the App.js clean.
 */

import React from 'react';
import './App.css';

const TOKEN = 'Tpk_391653b184fb45f2a8e9b1270c0306e9';
const BASE_URL = 'https://sandbox.iexapis.com/stable/stock/market/batch?';
const TEST_URL = 'https://sandbox.iexapis.com/stable/stock/market/batch?symbols=aapl,fb,twtr&types=quote&range=5d&token=Tpk_391653b184fb45f2a8e9b1270c0306e9';

class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stockSymbols: [],
            quoteData: [],
            error: null,
        };
    }

    buildQuoteURL(symbolsArr, range, type) {
        /*
        Builds the url for fetching stock data from api.
        - symbolsArr is an array of stock symbols as strings.
        - range is the timespan as string that should be fetched (1d, 5d, 1m, ...).
        - type is 'quote' or 'chart'
         */
        let url = BASE_URL;
        let sym = 'symbols=';
        let typ = '&types=';
        let ran = '&range=';
        let tok = '&token=';

        // Append symbols to the url
        for (let i=0; i<symbolsArr.length; i++) {
            sym += symbolsArr[i];
            if (i < symbolsArr.length - 1) {
                // Append ',' after symbol except after last one
                sym += ',';
            }
        }
        url += sym;

        // Append types to the url
        url += typ + type;

        // Append range to the url
        url += ran + range;

        // Append token to the url
        url += tok + TOKEN;

        console.log(url);
    }

    componentDidMount() {
        // Fetch stock data for all stocks in portfolio
        fetch(TEST_URL)
            .then(response => {
                if (response.ok) { return response.json() }
                else { throw new Error("Error while fetching ...") }
            })
            .then(jsonData => {
                let stockSymbols = [];
                for (let key in jsonData) {
                    if (jsonData.hasOwnProperty(key)) { stockSymbols.push(key) }
                }

                let quoteData = [];
                for (let i=0; i<stockSymbols.length; i++) {
                    const stock = stockSymbols[i];
                    quoteData[stock] = jsonData[stock].quote;  // .quote is a key in the json that comes from the api
                    // Usage: console.log(quoteData[stock].latestPrice);
                }

                console.log(stockSymbols);
                console.log(quoteData);
            })
            .catch(error => this.setState({ error: error}))
    }

    render() {
        this.buildQuoteURL(['ett', 'tva', 'tre'], '5d', 'quote');
        const error = this.state.error;
        if (error) { return <p>{error.message}</p> }
        return <p>Portfolio</p>;
    }
}

class TestApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            portfolios: [],
        };
    }

    render() {
        return (
            <div className="App">
                <h1>Hello</h1>
                <Portfolio />
            </div>
        );
    }
}

export default TestApp;
