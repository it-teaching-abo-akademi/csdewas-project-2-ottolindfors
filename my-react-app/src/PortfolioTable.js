import React from "react";
import {PortfolioTableRow} from "./PortfolioTableRow";
import {RemoveSelectedBtn} from "./RemoveSelectedBtn";

export class PortfolioTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // *******************************************************
            // NOTE: This is a derived state and should not be used.
            // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
            // Atm i will continue with this and review it later.
            // Using double negation will convert undefined/null to
            // false and temporarily fix the problem of the state not
            // being set at the initial render when passing
            // checked={!!this.state.selectedRows[stock]} to the
            // component <PortfolioTableRow/>
            // *******************************************************
            selectedRows: [],  // [AAPL: true, FB: false, TWTR: true, ...]
        };
        this.handleRowCheckedChange = this.handleRowCheckedChange.bind(this);
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
        const checked = event.target.checked;

        // Update the state
        let selectedRows = this.state.selectedRows;
        selectedRows[stock] = checked;
        this.setState({ selectedRows: selectedRows });
    }

    render() {
        const stocks = this.props.stocks;
        const showInEuro = this.props.showInEuro;
        const euroPerUsd = this.props.euroPerUsd;

        let rows = [];
        for (let stock in stocks) {
            if (stocks.hasOwnProperty(stock)) {
                rows.push(
                    <PortfolioTableRow
                        key={stock}
                        stock={stock}
                        stockInfo={stocks[stock]}
                        showInEuro={showInEuro}
                        euroPerUsd={euroPerUsd}
                        checked={!!this.state.selectedRows[stock]}
                        onRowCheckedChange={this.handleRowCheckedChange}
                    />
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