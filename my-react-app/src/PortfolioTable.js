import React from "react";
import {PortfolioTableRow} from "./PortfolioTableRow";

export class PortfolioTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // *******************************************************
            // NOTE: This is a derived state and should not be used.
            // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
            // Atm i will continue with this and review it later.
            //
            // Checking the number of keys in the object in selectedRows
            // when rendering temporarily fixes the problem of the state not
            // being set at the initial render.
            // *******************************************************
            selectedRows: [],  // [AAPL: true, FB: false, TWTR: true, ...]
        };
        this.handleRowCheckedChange = this.handleRowCheckedChange.bind(this);
        this.handleOnClick = this.handleOnClick.bind(this);
    }

    componentDidMount() {
        // Populate initial state after component mount. Set all rows not checked.
        const stocks = this.props.stocks;
        let selectedRows = [];
        for (let stock in stocks) {
            if (stocks.hasOwnProperty(stock)) {
                selectedRows[stock] = false;
            }
        }
        this.setState({ selectedRows: selectedRows });
    }

    handleRowCheckedChange(event) {
        // Extract stock name and whether the <input ... /> is checked
        const stock = event.target.name;  // event.target is the <input ... /> element in PortfolioTableRow
        const isChecked = event.target.checked;

        // Update the state
        let selectedRows = this.state.selectedRows;
        selectedRows[stock] = isChecked;
        this.setState({ selectedRows: selectedRows });
    }
    handleOnClick() {
        this.props.onRemoveSelected(this.state.selectedRows);
    }

    render() {
        // Props
        const stocks = this.props.stocks;
        const showInEuro = this.props.showInEuro;
        const euroPerUsd = this.props.euroPerUsd;

        // TODO: Do not use derived states
        // Derived state
        const selectedRows = this.state.selectedRows;

        let rows = [];
        for (let stockSymbol in stocks) {
            if (stocks.hasOwnProperty(stockSymbol)) {
                rows.push(
                    <PortfolioTableRow
                        key={stockSymbol}
                        stock={stockSymbol}
                        stockInfo={stocks[stockSymbol]}
                        showInEuro={showInEuro}
                        euroPerUsd={euroPerUsd}
                        isChecked={Object.keys(selectedRows).length === 0 ? false : selectedRows[stockSymbol]}
                        onRowCheckedChange={this.handleRowCheckedChange}
                    />
                );
            }
        }

        return (
            <div>
                <button
                    onClick={this.handleOnClick}>
                    Remove selected
                </button>
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