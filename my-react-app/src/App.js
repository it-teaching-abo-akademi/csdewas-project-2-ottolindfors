import React from 'react';
import './App.css';
import {urlBuilder, urlBuilderDate} from "./api";
import {dateToChartRange, loadFromLocalStorage, saveToLocalStorage} from "./myFunctions";
import {AddPortfolioModal} from './AddPortfolioModal'
import {Portfolio} from "./Portfolio";
import {minimizeData, minimizeDataStocksOnly} from "./dataFunctions";

// TODO: Reuse code segments

const LOCALSTORAGE_APPDATA_NAME = 'appData';
const DEFAULT_USER_PREFS = {showInEuro: false, graphRange: "6m"};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appData: {},  // All data
            showAddPortfolioModal: false,
            loading: false,
            isUpdating: false,
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

    // Move these two functions to myFunctions.js
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
                () => console.log("==> Loaded 'portfolios' and 'appData' from local storage")
            );
        }
        catch (error) {
            // Silently fail
            console.log("==>", error);
        }
    }

    toggleShowAddPortfolioModal() {
        this.setState({ showAddPortfolioModal: !this.state.showAddPortfolioModal });
    };
    handleAddPortfolio(newPortfolioName) {
        // Hide the modal
        this.toggleShowAddPortfolioModal();
        // Create new portfolio with no stocks default user preferences.
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
        // Fetch chart and quota data
        const type = 'quote,chart';

        let dataFetcher = this.dataFetcher([stockSymbol], type, chartRange);
        dataFetcher.then(stockData => {
            let appData = this.state.appData;
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
    async handleOnUpdate(portfolioName) {
        // Ad-hoc solution to use async-await here.
        // The dataFetcher is asynchronous and therefore needs await.
        // Since dataFetcher is inside a for loop the loop would not otherwise "wait" in the results (.then)

        // Basically the same as handleAddStock
        console.log("==> Updating '" + portfolioName + "'");
        this.setState({ isUpdating : true });

        let appData = this.state.appData;

        // Update one stock at a time since the purchase dates may wildly vary
        let stocks = appData[portfolioName].stocks;
        for (let stock in stocks) {
            if (stocks.hasOwnProperty(stock)) {
                // Calculate the needed chartRange
                const chartRange = dateToChartRange(stocks[stock].purchase.date);
                // Fetch chart and quota data
                const type = 'quote,chart';

                // Fetch the new stock data
                let dataFetcher = this.dataFetcher([stock], type, chartRange);
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
    handleOnGraphRangeChange(portfolioName, selectedGraphRange) {
        let appData = this.state.appData;
        appData[portfolioName].userPrefs["graphRange"] = selectedGraphRange;
        this.setState(
            { appData: appData },
            () => saveToLocalStorage(appData, LOCALSTORAGE_APPDATA_NAME)
        )
    }
    handleToggleShowInEuro(event) {
        const portfolioName = event.target.name;
        let appData = this.state.appData;
        appData[portfolioName].userPrefs["showInEuro"] = !appData[portfolioName].userPrefs["showInEuro"];
        this.setState(
            { appData: appData },
            () => saveToLocalStorage(appData, LOCALSTORAGE_APPDATA_NAME)
            );
    }
    handleRemoveSelected(portfolioName, selectedRows) {
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
    handleOnRemovePortfolio(portfolioName) {
        // Delete the portfolio
        let appData = this.state.appData;
        delete appData[portfolioName];
        this.setState(
            { appData: appData },
            () => {
                console.log("==> Deleted portfolio '" + portfolioName + "'");
                saveToLocalStorage(appData, LOCALSTORAGE_APPDATA_NAME);
            }
        )
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
                <p><a href="https://iexcloud.io">Data provided by IEX Cloud</a>. 15 minute delay in price.</p>
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
