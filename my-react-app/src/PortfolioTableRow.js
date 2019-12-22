import React from "react";
export class PortfolioTableRow extends React.Component{
    render() {
        const stock = this.props.stock;
        const stockData = this.props.stockInfo;
        const showInEuro = this.props.showInEuro;
        const latestPrice = stockData.quote.latestPrice;
        const shares = stockData.purchase.shares;
        const purchasePrice = stockData.purchase.price;
        const purchaseCurrency = stockData.purchase.currency;
        // See Thinking in react for handling the input button
        return (
            <tr>
                <td>{stock}</td>
                <td>{latestPrice} {showInEuro ? "EUR" : "USD"}</td>
                <td>{purchasePrice} {purchaseCurrency}</td>
                <td>{shares}</td>
                <td>{String((latestPrice * shares).toFixed(3))} {showInEuro ? "EUR" : "USD"}</td>
                <td><input type="checkbox"/></td>
            </tr>
        );
    }
}