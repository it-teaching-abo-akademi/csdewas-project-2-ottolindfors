import React from "react";
import {urlBuilderDate} from "./api";

export class AddStockModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stockSymbol: "",
            purchaseDate: "",
            shares: "",
            hasErrors: false,
            errorMessage: "",
            loading: false,
        };
        this.handleOnsubmit = this.handleOnsubmit.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }
    handleOnsubmit(event) {
        event.preventDefault();

        const stockSymbol = this.state.stockSymbol;
        const purchaseDate = this.state.purchaseDate;
        const shares = this.state.shares;

        console.log("==> Adding stock '" + stockSymbol + "'");

        let purchasePrice = null;
        this.setState(
            { loading: true },
            () => {
                // Fetch purchase price from API
                let puchasePriceFetcher = this.puchasePriceFetcher(stockSymbol, purchaseDate);  // Returns a promise
                puchasePriceFetcher.then(fetchedPrice => {
                    if (!this.state.hasErrors) {
                        purchasePrice = fetchedPrice;
                        this.props.onAdd(stockSymbol, purchaseDate, purchasePrice, shares);
                    }
                    this.setState({
                        hasErrors: false,
                        loading: false,
                    });
                })
                // Errors are already caught in purchasePriceFetcher so no need to do it here
            }
        );

    }
    handleOnChange(event) {
        if (event.target.name === "stockSymbol") {
            this.setState({ stockSymbol: event.target.value.toUpperCase() });
        }
        if (event.target.name === "purchaseDate") {
            this.setState({ purchaseDate: event.target.value })
        }
        if (event.target.name === "shares") {
            this.setState({ shares: event.target.value })
        }
    }
    handleCancel() {
        // Reset state
        this.setState({
            stockSymbol: "",
            purchaseDate: "",
            stockError: "",
            dateError: "",
        });
        // Action
        this.props.onCancel();
    }
    render() {
        if (!this.props.show) {
            // TODO: Should render nothing in the future
            return <p>Modal hidden</p>
        }
        if (this.state.loading) {
            // Loading while fetching data
            return (
                <p>Loading ...</p>
            )
        }
        return (
            <div>
                <p>Modal visible</p>
                <form onSubmit={this.handleOnsubmit}>
                    <label>
                        Stock symbol
                        <input type="text" name="stockSymbol" value={this.state.stockSymbol} onChange={this.handleOnChange} required/>
                    </label>
                    <label>
                        Date of purchase
                        <input type="date" name="purchaseDate" value={this.state.purchaseDate} onChange={this.handleOnChange} required/>
                    </label>
                    <label>
                        Number of shares
                        <input type="number" min="1" name="shares" value={this.state.shares} onChange={this.handleOnChange} required/>
                    </label>
                    <input type="submit" value="Add"/>
                </form>
                <p>{this.state.errorMessage}</p>
                <button onClick={this.handleCancel}>Cancel</button>
            </div>
        )
    }
    puchasePriceFetcher(stockSymbol, isoDate) {
        // isoDate should be of format YYYY-MM-DD as returned by the <input type="date />
        const yyyymmdd = isoDate.replace(/-/g, "");
        const apiUrl = urlBuilderDate(stockSymbol, yyyymmdd);

        return fetch(apiUrl)
            .then(response => {
                // "Parse" json
                if (response.ok) {
                    // API returns an empty json if the stock symbol is valid but there is no available data.
                    return response.json()  // returns 'undefined' if json from api is empty
                }
                if (response.status === 404) {
                    // API throws 404 if stock symbol is unknown
                    throw new Error("Unknown stock symbol");
                }
                else {
                    // All other errors
                    throw new Error("Error while fetching from api ...");
                }
            })
            .then(jsonData => {
                // The API returns an empty json if the stock symbol is valid but there is no available data.
                if (jsonData.length > 0) {
                    return jsonData[0].close;
                }
                else {
                    throw new Error("No available stock data for that date. Either the exchange was closed that day (e.g. weekend) or the date is too far in the past.");
                }
            })
            .catch(error => {
                // Handle errors
                console.log("==>", error.message);
                this.setState({
                    hasErrors: true,
                    errorMessage : error.message
                });
            })
    }
}