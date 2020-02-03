import React from 'react';
import './App.css';
import {urlBuilder, urlBuilderDate} from "./api";
import {dateToChartRange, loadFromLocalStorage, saveToLocalStorage} from "./myFunctions";
import {AddPortfolioModal} from './AddPortfolioModal'
import {Portfolio} from "./Portfolio";
import {minimizeData, minimizeDataStocksOnly} from "./dataFunctions";

// TODO: Reuse code segments

// Name of the JSON file that will be stored in the browser's local storage
const LOCALSTORAGE_APPDATA_NAME = 'appData';

// Default preferences for new portfolios
const DEFAULT_USER_PREFS = {showInEuro: false, graphRange: "6m"};


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            appData: {},  // All data the app uses
            showAddPortfolioModal: false,  // For toggling the visibility of AddPortfolioModal
            isUpdating: false,  // Used in Portfolio for changing button text.
            // TODO: isUpdating affect "update" buttons for all portfolios when used as a state for the whole App.
            //  Wanted result is to only affect individual Portfolios separately.
        };
        this.toggleShowAddPortfolioModal = this.toggleShowAddPortfolioModal.bind(this);
        this.handleAddPortfolio = this.handleAddPortfolio.bind(this);
        this.handleAddStock = this.handleAddStock.bind(this);
        this.handleOnUpdate = this.handleOnUpdate.bind(this);
        this.handleOnGraphRangeChange = this.handleOnGraphRangeChange.bind(this);
        this.handleToggleShowInEuro = this.handleToggleShowInEuro.bind(this);
        this.handleRemoveSelected = this.handleRemoveSelected.bind(this);
        this.handleOnRemovePortfolio = this.handleOnRemovePortfolio.bind(this);
    }

    // TODO: Move dataFetcher() and puchasePriceFetcher() to myFunctions.js
    /*
    Fetches latest specified types of data for all stockSymbols.
    Returns the fetched data object or throws an error.
     */
    dataFetcher(stockSymbols, type, chartRange) {
        // Get the URI
        const apiUrl = urlBuilder(stockSymbols, type, chartRange);
        // Fetch the stock data
        return fetch(apiUrl)
            .then(response => {
                // "Parse" the json
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("Error while fetching from api...")
                }
            })
            .then(jsonData => {
                // Return the json data object
                return jsonData;
            })
            .catch(error => this.setState({error: error}));
    }

    /*
    Fetch the closing price of some stock at a specific date. Used for fetching purchase prices.
    Returns the closing price or throws an error.
     */
    puchasePriceFetcher(stockSymbol, yyyymmdd) {
        // Get the URI
        const apiUrl = urlBuilderDate(stockSymbol, yyyymmdd);
        // Fetch the stock data (purchase price)
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
                // Returns the stock's closing price
                return jsonData[0].close;
            })
            .catch(error => this.setState({error: error}));
    }

    /*
    Tries to load appData from local storage when the page is refreshed. If there is nothing to load from local storage
    (meaning the user has not visited the site before, or has deleted local storage between visits) an error is printed
    to the console. This is part of the normal functionality and is not an indication of something malfunctioning.
     */
    componentDidMount() {
        // Output message in console (mostly for debugging purpose)
        console.log("==> componentDidLoad");
        // Try loading appData from local storage.
        try {
            const appData = loadFromLocalStorage(LOCALSTORAGE_APPDATA_NAME);  // Trows error if not found
            this.setState(
                { appData: appData },
                () => console.log("==> Loaded 'portfolios' and 'appData' from local storage")
            );
        }
        catch (error) {
            // No appData Output error to console
            console.log("==> No appData in local storage :", error);
        }
    }

    /*
    Toggle visibility of AddPortfolioModal.
     */
    toggleShowAddPortfolioModal() {
        this.setState({ showAddPortfolioModal: !this.state.showAddPortfolioModal });
    };

    /*
    Create a new portfolio and save to local storage.
     */
    handleAddPortfolio(newPortfolioName) {
        // Hide the modal
        this.toggleShowAddPortfolioModal();
        // copy the current state
        let appData = this.state.appData;
        // Add new empty portfolio with default user preferences
        appData[newPortfolioName] = {"userPrefs": DEFAULT_USER_PREFS};
        appData[newPortfolioName]["stocks"] = {};
        // Set state (save appData with the new portfolio)
        this.setState(
            {appData: appData},
            () => {
                console.log("==> Created new portfolio '" + newPortfolioName + "'");
                saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
            }
        );
    }

    /*
    Add a new stock to the portfolio (in state.appData), fetch quote and chart data (IEXCloud API), and save to local storage.
     */
    handleAddStock(portfolioName, stockSymbol, purchaseDate, purchasePrice, shares) {
        console.log("==> Adding stock to", portfolioName, stockSymbol, purchaseDate, purchasePrice, shares);

        // Calculate the needed chartRange from purchaseDate
        const chartRange = dateToChartRange(purchaseDate);

        // Fetch chart and quota data
        const type = 'quote,chart';  // quote for latest data, chart for historical data
        let dataFetcher = this.dataFetcher([stockSymbol], type, chartRange);
        dataFetcher.then(stockData => {
            // Copy appData from state
            let appData = this.state.appData;
            // Add new cleaned (minimized) stock data to appData
            appData = minimizeData(
                stockData,
                appData,
                portfolioName,
                purchaseDate,
                purchasePrice,
                shares
            );

            // Set state and save to local storage
            this.setState(
                { appData: appData },
                () => {
                    console.log("==> Stock data added to '" + portfolioName + "'");
                    saveToLocalStorage(this.state.appData, LOCALSTORAGE_APPDATA_NAME);
                }
            )
        });
    }

    /*
    Fetches latest (updates) stock data since purchase date for all stocks in a portfolio in state.appData.
    Using async/await is an ad-hoc solution and is used since dataFetcher() is asynchronous. The motivation for using
    await is that since dataFetcher() is inside a for-loop the loop would not otherwise "wait" for the dataFetcher to
    complete fetching the data and the dataFetcher.then() would never be executed.
     */
    async handleOnUpdate(portfolioName) {
        console.log("==> Updating '" + portfolioName + "'");

        // Change text inside the "update" button int the Portfolios
        this.setState({ isUpdating : true });

        // Copy appData
        let appData = this.state.appData;

        // Update one stock at a time
        let stocks = appData[portfolioName].stocks;
        for (let stock in stocks) {
            if (stocks.hasOwnProperty(stock)) {
                // Calculate the needed chartRange from purchase date
                const chartRange = dateToChartRange(stocks[stock].purchase.date);
                // Fetch chart and quota data
                const type = 'quote,chart';
                // Fetch the new stock data
                let dataFetcher = this.dataFetcher([stock], type, chartRange);
                // await is used so that the execution of the for-loop waits for the execution of .then()
                await dataFetcher.then(stockData => {
                    appData = minimizeDataStocksOnly(
                        stockData,
                        appData,
                        portfolioName
                    );
                })
            }
        }

        // Set state and save to local storage
        this.setState(
            { appData: appData, isUpdating: false},
            () => {
                console.log("==> Updated portfolio '" + portfolioName + "'");
                saveToLocalStorage(appData, LOCALSTORAGE_APPDATA_NAME);
            }
        )
    }

    /*
    Change the visible date range in the stock graph.
     */
    handleOnGraphRangeChange(portfolioName, selectedGraphRange) {
        // Copy state.appData
        let appData = this.state.appData;
        // Modify userPrefs for portfolio
        appData[portfolioName].userPrefs["graphRange"] = selectedGraphRange;
        // Set state and save to local storage
        this.setState(
            { appData: appData },
            () => saveToLocalStorage(appData, LOCALSTORAGE_APPDATA_NAME)
        )
    }

    /*
    Toggle shown currencies for a portfolio. Does not affect purchase price since historical changes in a currency's
    value would have to be considered.
     */
    handleToggleShowInEuro(event) {
        // Get portfolio name from the event (triggered by button in Portfolio)
        const portfolioName = event.target.name;
        // Copy state.appData
        let appData = this.state.appData;
        // Toggle currency
        appData[portfolioName].userPrefs["showInEuro"] = !appData[portfolioName].userPrefs["showInEuro"];
        // Set state and save to local storage
        this.setState(
            { appData: appData },
            () => saveToLocalStorage(appData, LOCALSTORAGE_APPDATA_NAME)
            );
    }

    /*
    Removes rows from a portfolio in state.appData.
    Takes as input the name of a portfolio, and an array of pairs consisting of stockSymbol and a boolean value telling
    whether the stock symbol is selected for removal or not.
     */
    handleRemoveSelected(portfolioName, selectedRows) {
        // Copy appData
        let appData = this.state.appData;
        // Check which rows are marked for deletion
        for (let [stockSymbol, booleanValue] of Object.entries(selectedRows)) {
            if (booleanValue) {
                // Delete stock entry
                delete appData[portfolioName].stocks[stockSymbol]
            }
        }
        this.setState(
            { appData: appData },
            () => {
                console.log("==> Deleted selected stocks from '" + portfolioName + "'");
                saveToLocalStorage(appData, LOCALSTORAGE_APPDATA_NAME);
            }
        )
    }

    /*
    Removes a portfolio.
     */
    handleOnRemovePortfolio(portfolioName) {
        // Copy state.appData for manipulation
        let appData = this.state.appData;
        // Delete the portfolio
        delete appData[portfolioName];
        // Set state and save to local storage
        this.setState(
            { appData: appData },
            () => {
                console.log("==> Deleted portfolio '" + portfolioName + "'");
                saveToLocalStorage(appData, LOCALSTORAGE_APPDATA_NAME);
            }
        )
    }

    /*
    Render the app.
     */
    render() {
        console.log("==> App render");

        // Get list of portfolios from state.appData
        const appData = this.state.appData;
        let portfolios = [];
        for (let portfolioName in appData) {
            if (appData.hasOwnProperty(portfolioName)) {
                portfolios.push(portfolioName);
            }
        }

        return (
            <div className="App">
                <h1>SPMS</h1>
                <p><a href="https://iexcloud.io">Data provided by IEX Cloud</a>. 15 minute delay in price.</p>
                <p>This app is a work in progress.</p>
                <p>Known issues: The graph does not update when a stock is added (manual refresh by user is needed).</p>

                <button
                    onClick={this.toggleShowAddPortfolioModal}>
                    Add portfolio
                </button>

                <AddPortfolioModal
                    show={this.state.showAddPortfolioModal}
                    onCancel={this.toggleShowAddPortfolioModal}
                    onAdd={this.handleAddPortfolio}
                    portfolios={portfolios}>
                </AddPortfolioModal>

                {portfolios.map(portfolioName =>
                    <Portfolio
                        key={portfolioName}
                        name={portfolioName}
                        portfolio={appData[portfolioName]}
                        isUpdating={this.state.isUpdating}
                        onToggleShowInEuro={this.handleToggleShowInEuro}
                        onUpdate={this.handleOnUpdate}
                        onGraphRangeChange={this.handleOnGraphRangeChange}
                        onAddStock={this.handleAddStock}
                        onRemoveSelected={this.handleRemoveSelected}
                        onRemovePortfolio={this.handleOnRemovePortfolio}
                    />
                )}
            </div>
        );
    }
}

export default App;
