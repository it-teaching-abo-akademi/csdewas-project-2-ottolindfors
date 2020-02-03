import React from "react";
export class PortfolioTableRow extends React.Component{
    constructor(props) {
        super(props);
        this.handleCheckedChange = this.handleCheckedChange.bind(this);
    }

    handleCheckedChange(event) {
        this.props.onRowCheckedChange(event);  // e.target.checked, e.target.name checked = true/false, name = AAPL , FB,...
    }

    render() {
        // Props
        const stock = this.props.stock;
        const stockData = this.props.stockInfo;
        const showInEuro = this.props.showInEuro;
        const euroPerUsd = this.props.euroPerUsd;
        const isChecked = this.props.isChecked;

        const latestPrice = stockData.quote.latestPrice;
        const shares = stockData.purchase.shares;
        const purchasePrice = stockData.purchase.price;
        const purchaseCurrency = stockData.purchase.currency;

        // See Thinking in react for handling the input button
        return (
            <tr>
                <td>{stock}</td>
                <td>{showInEuro ? (latestPrice * euroPerUsd).toFixed(2) + " EUR" : latestPrice + " USD"}</td>
                <td>{purchasePrice} {purchaseCurrency}</td>
                <td>{shares}</td>
                <td>{showInEuro ? (latestPrice * shares * euroPerUsd).toFixed(2) + " EUR" : (latestPrice * shares).toFixed(2) + " USD"}</td>
                <td><input name={stock} type="checkbox" checked={isChecked} onChange={this.handleCheckedChange}/></td>
            </tr>
        );
    }
}