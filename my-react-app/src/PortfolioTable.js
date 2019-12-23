import React from "react";
import {PortfolioTableRow} from "./PortfolioTableRow";
import {RemoveSelectedBtn} from "./RemoveSelectedBtn";

export class PortfolioTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selections: null,
        }
    }
    render() {
        const stocks = this.props.stocks;
        const showInEuro = this.props.showInEuro;
        const euroPerUsd = this.props.euroPerUsd;

        let rows = [];
        for (let key in stocks) {
            if (stocks.hasOwnProperty(key)) {
                rows.push(
                    <PortfolioTableRow key={key} stock={key} stockInfo={stocks[key]} showInEuro={showInEuro} euroPerUsd={euroPerUsd}/>
                );
            }
        }
        return (
            <div>
                <RemoveSelectedBtn selections={this.state.selections} />
                <table>
                    <thead>
                    <tr>
                        <th>Stock</th>
                        <th>Latest Price</th>
                        <th>Purchase Price</th>
                        <th>Shares</th>
                        <th>Total</th>
                        <th>Select</th>
                    </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
            </div>
    )
    }
}