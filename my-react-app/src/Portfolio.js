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
        this.toggleShowAddStockModal = this.toggleShowAddStockModal.bind(this);
        this.handleAddStock = this.handleAddStock.bind(this);
    }
    toggleShowAddStockModal() {
        this.setState({ showAddStockModal: !this.state.showAddStockModal });
    }
    handleAddStock(stockSymbol, purchaseDate, purchasePrice, shares) {
        this.toggleShowAddStockModal();
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
                <button>
                    Refresh/Update
                </button>
                <div>
                    <EvolutionGraph stocks={stocks} graphRange={graphRange} showInEuro={showInEuro} euroPerUsd={euroPerUsd}/>
                    <select defaultValue={graphRange}>
                        {rangeOptions.map(entry => {
                            return <option key={entry.value} value={entry.value}>{entry.value}</option>
                        })}
                    </select>
                </div>
                <button
                    onClick={this.toggleShowAddStockModal}>
                    Add stock
                </button>
                <AddStockModal
                    show={this.state.showAddStockModal}
                    onCancel={this.toggleShowAddStockModal}
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