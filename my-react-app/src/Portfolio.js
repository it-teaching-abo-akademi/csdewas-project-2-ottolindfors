import React from "react";
import {PortfolioTableRow} from "./PortfolioTableRow";

export class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // stockSymbols: [],  // Input from 'add' button
            stockSymbols: ['AAPL', 'FB', 'TWTR'],
            data: {},
            // chartRange: null,  // Input from select menu
            chartRange: '5d',
            error: null,
            loading: false,
        };
    }

    render() {
        console.log("==> Portfolio render");

        const name = this.props.name;
        const portfolioData = this.props.portfolioData;
        let rows = [];
        for (let key in portfolioData) {
            if (portfolioData.hasOwnProperty(key)) {
                rows.push(
                    <PortfolioTableRow key={key} stock={key} stockData={portfolioData[key]}/>
                );
            }
        }

        // Render error if any
        const error = this.state.error;
        if (error) { return <p>{error.message}</p> }

        // Render indicator if loading
        if (this.state.loading) { return <p>Loading ...</p> }

        // Render normally if no error
        return (
            <div>
                <h2>{name}</h2>
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
        );
    }
}