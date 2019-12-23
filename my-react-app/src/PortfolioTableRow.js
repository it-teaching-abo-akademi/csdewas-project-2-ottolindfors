import React from "react";
export class PortfolioTableRow extends React.Component{
    render() {
        const stock = this.props.stock;
        const stockData = this.props.stockInfo;
        const showInEuro = this.props.showInEuro;
        const euroPerUsd = this.props.euroPerUsd;

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
                <td><input type="checkbox"/></td>
            </tr>
        );
    }
}