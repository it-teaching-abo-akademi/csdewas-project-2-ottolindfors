import React from "react";
import {PortfolioTableRow} from "./PortfolioTableRow";
import {EvolutionGraph} from "./EvolutionGraph";

const rangeOptions = [
    {value: "5d", text: "5 days"},
    {value: "1m", text: "1 month"},
    {value: "3m", text: "3 months"},
    {value: "6m", text: "6 months"},
    {value: "ytd", text: "This year"},
    {value: "1y", text: "1 year"},
    {value: "2y", text: "2 years"},
    {value: "5y", text: "5 years"},
    {value: "max", text: "Maximum available"}
];

export class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // chartRange: null,  // Input from select menu
            chartRange: '5d',
        };
    }

    render() {
        // Props
        const name = this.props.name;
        const stocks = this.props.portfolio.stocks;
        const showInEuro = this.props.portfolio.userPrefs.showInEuro;

        // Rows in the table
        let rows = [];
        for (let key in stocks) {
            if (stocks.hasOwnProperty(key)) {
                rows.push(
                    <PortfolioTableRow key={key} stock={key} stockInfo={stocks[key]} showInEuro={showInEuro}/>
                );
            }
        }

        // For handling button press read https://reactjs.org/docs/handling-events.html
        //<SelectRangeButton />

        return (
            <div>
                <h2>{name}</h2>
                <button>
                    {this.state.showInEuro ? "USD" : "EUR" }
                </button>
                <div>
                    <EvolutionGraph stocks={stocks} />
                    <select>
                        {rangeOptions.map(entry => {
                            return <option key={entry.value} value={entry.value}>{entry.text}</option>
                        })}
                    </select>
                </div>
                <button>Add stock</button>
                <button>Remove selected stocks</button>
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
                <button>Remove portfolio</button>
            </div>
        );
    }
}