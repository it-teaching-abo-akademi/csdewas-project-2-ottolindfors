import React from "react";
import {PortfolioTableRow} from "./PortfolioTableRow";
import {EvolutionGraph} from "./EvolutionGraph";

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
                    <PortfolioTableRow key={key} stock={key} stockData={stocks[key]} showInEuro={showInEuro}/>
                );
            }
        }

        // For handling button press read https://reactjs.org/docs/handling-events.html

        return (
            <div>
                <h2>{name}</h2>
                <button>
                    {this.state.showInEuro ? "USD" : "EUR" }
                </button>
                <EvolutionGraph />
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