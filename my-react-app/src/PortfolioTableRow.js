import React from "react";
export class PortfolioTableRow extends React.Component{
    render() {
        const stock = this.props.stock;
        const stockData = this.props.stockData;
        const latestPrice = stockData.quote.latestPrice;
        const shares = stockData.purchase.shares;
        const purchasePrice = stockData.purchase.price;
        return (
            <tr>
                <td>{stock}</td>
                <td>{latestPrice}</td>
                <td>{purchasePrice}</td>
                <td>{shares}</td>
                <td>{String((latestPrice * shares).toFixed(3))}</td>
                <td><input type="checkbox"/></td>
            </tr>
        );
    }
}