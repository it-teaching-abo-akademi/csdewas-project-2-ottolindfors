import React from "react";
import {EvolutionGraph} from "./EvolutionGraph";
import {PortfolioTable} from "./PortfolioTable";
import {AddStockModal} from "./AddStockModal";

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
    constructor(props) {
        super(props);
        this.state = {
            showAddStockModal: false,
        };
        this.handleToggleShowInEuro = this.handleToggleShowInEuro.bind(this);
        this.handleOnUpdate = this.handleOnUpdate.bind(this);
        this.handleOnGraphRangeChange = this.handleOnGraphRangeChange.bind(this);
        this.handleToggleShowAddStockModal = this.handleToggleShowAddStockModal.bind(this);
        this.handleAddStock = this.handleAddStock.bind(this);
    }
    handleToggleShowInEuro(event) {
        this.props.onToggleShowInEuro(event);
    }
    handleOnUpdate(event) {
        // Send portfolio's name to the parent function
        this.props.onUpdate(event.target.name);
    }
    handleOnGraphRangeChange(event) {
        // Pas portfolio name and the selected range to the parent
        this.props.onGraphRangeChange(this.props.name, event.target.value);
    }
    handleToggleShowAddStockModal() {
        this.setState({ showAddStockModal: !this.state.showAddStockModal });
    }
    handleAddStock(stockSymbol, purchaseDate, purchasePrice, shares) {
        this.handleToggleShowAddStockModal();
        this.props.onAddStock(this.props.name, stockSymbol, purchaseDate, purchasePrice, shares);
    }
    render() {
        // Prevent errors when initial (and maybe also other asynchronous) render happen before userPrefs and name are set in appData.
        if (typeof this.props.name === 'undefined' ||
            typeof this.props.portfolio === 'undefined' ||
            typeof this.props.portfolio.userPrefs === 'undefined'
        ) {
            return <p>Loading ...</p>
        }
        // Props
        const name = this.props.name;
        const portfolio = this.props.portfolio;
        const isUpdating = this.props.isUpdating;
        // "Refined" props
        const stocks = portfolio.stocks;
        const showInEuro = portfolio.userPrefs.showInEuro;
        const graphRange = portfolio.userPrefs.graphRange;


        // For handling button press read https://reactjs.org/docs/handling-events.html

        return (
            <div>
                <h2>{name}</h2>
                <button
                    name={name}
                    onClick={this.handleToggleShowInEuro}>
                    {showInEuro ? "USD" : "EUR" }
                </button>
                <button
                    name={name}
                    onClick={this.handleOnUpdate}>
                    {isUpdating ? "Fetching ..." : "Update"}
                </button>
                <div>
                    <EvolutionGraph
                        stocks={stocks}
                        graphRange={graphRange}
                        showInEuro={showInEuro}
                        euroPerUsd={euroPerUsd}
                    />
                    <select defaultValue={graphRange} onChange={this.handleOnGraphRangeChange}>
                        {rangeOptions.map(entry => {
                            return <option
                                key={entry.value}
                                value={entry.value}>
                                {entry.value}
                            </option>
                        })}
                    </select>
                </div>
                <button
                    onClick={this.handleToggleShowAddStockModal}>
                    Add stock
                </button>
                <AddStockModal
                    show={this.state.showAddStockModal}
                    onCancel={this.handleToggleShowAddStockModal}
                    onAdd={this.handleAddStock}>
                    "I am a child of this modal"
                </AddStockModal>
                <PortfolioTable
                    stocks={stocks}
                    showInEuro={showInEuro}
                    euroPerUsd={euroPerUsd}
                />
                <button>
                    Remove portfolio
                </button>
            </div>
        );
    }
}