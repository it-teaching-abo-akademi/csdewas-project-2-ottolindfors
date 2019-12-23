import React from "react";
import {PortfolioTableRow} from "./PortfolioTableRow";
import {EvolutionGraph} from "./EvolutionGraph";
import {PortfolioTable} from "./PortfolioTable";

const rangeOptions = [
    {value: "5d", text: "5 days",},
    {value: "1m", text: "1 month"},
    {value: "3m", text: "3 months"},
    {value: "6m", text: "6 months"},
    {value: "ytd", text: "This year"},
    {value: "1y", text: "1 year"},
    {value: "2y", text: "2 years"},
    {value: "5y", text: "5 years"},
    {value: "max", text: "Maximum available"}
];

const euroPerUsd = 0.90;  // Later change this to API call

export class Portfolio extends React.Component {
    render() {
        // Props
        const name = this.props.name;
        const stocks = this.props.portfolio.stocks;
        const showInEuro = this.props.portfolio.userPrefs.showInEuro;
        const graphRange = this.props.portfolio.userPrefs.graphRange;

        // For handling button press read https://reactjs.org/docs/handling-events.html

        return (
            <div>
                <h2>{name}</h2>
                <button>
                    {showInEuro ? "USD" : "EUR" }
                </button>
                <div>
                    <EvolutionGraph stocks={stocks} graphRange={graphRange}/>
                    <select defaultValue={graphRange}>
                        {rangeOptions.map(entry => {
                            return <option key={entry.value} value={entry.value}>{entry.value}</option>
                        })}
                    </select>
                </div>
                <button>Add stock</button>
                <PortfolioTable stocks={stocks} showInEuro={showInEuro}/>
                <button>Remove portfolio</button>
            </div>
        );
    }
}