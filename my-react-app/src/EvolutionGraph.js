import React from "react";
import {LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer} from "recharts";

export class EvolutionGraph extends React.PureComponent{

    generateHslColor() {
        // Generate random hsl color. Ensures the color is visible on the chart
        const hue = (Math.random() * 360).toFixed(0).toString();
        const saturation = "40%";
        const lightness = "70%";
        return "hsl(" + hue + "," + saturation + "," + lightness + ")";
    }

    graphRangeToDate(graphRange) {
        // graphRange options are 5d, 1m, 3m, 6m, ytd, 1y, 2y, 5y, max
        if (graphRange.includes("d")) {
            const days = graphRange.replace("d", "");
            const dateToday = new Date();
            // Set the date to 'days' number of days in the past and return the new date
            return new Date(new Date().setDate(dateToday.getDate() - days));
        }
        if (graphRange.includes("m")) {
            const months = graphRange.replace("m", "");  // 1m, 3m, 6m
            const dateToday = new Date();
            // Set the date to 'months' number of months in the past and return the new date
            return new Date(new Date().setMonth(dateToday.getMonth() - months));
        }
        if (graphRange.includes('ytd')) {
            // Return a Date object set to 1 Jan of the current year
            return new Date(new Date().toISOString().slice(0,4));  // new Date("2019") returns 1 Jan 2019
        }
        if (graphRange.includes("y")) {
            const years = graphRange.replace("y", "");
            const dateToday = new Date();
            // Set the date to 'years' number of years in the past and return the new date
            return new Date(new Date().setFullYear(dateToday.getFullYear() - years));
        }
        if (graphRange.includes('max')) {
            const years = 500;
            const dateToday = new Date();
            // Set the date 500 years in the past and return the new date
            return new Date(new Date().setFullYear(dateToday.getFullYear() - years));
        }
    }

    render() {
        const stocks = this.props.stocks;
        const graphRange = this.props.graphRange;
        const showInEuro = this.props.showInEuro;
        const euroPerUsd = this.props.euroPerUsd;

        const data = [];
        let stockNames = [];

        // Translate 'graphRange' to number of days
        const graphRangeLimitDate = this.graphRangeToDate(graphRange);

        // Populate 'data' and 'stockNames' with data in the correct format for the LineChart component
        for (let stock in stocks) {  // stock = aapl, fb, ...
            if (stocks.hasOwnProperty(stock)) {
                stockNames.push(stock);

                const chart = stocks[stock].chart;
                let dataKey = 0;
                for (let chartKey in chart) {  // key = 0, 1, 2, ...
                    if (chart.hasOwnProperty(chartKey)) {
                        const date = chart[chartKey].date;
                        let close = 0;
                        if (showInEuro) {
                            close = Number((chart[chartKey].close * euroPerUsd).toFixed(2));  // .toFixed(2) without casting to Number causes the chart to scale incorrectly (if there are problems in the future).
                        }
                        else {
                            close = chart[chartKey].close
                        }


                        // Filter the dates for the graph (LineChart)
                        if (new Date(date) >= graphRangeLimitDate) {
                            if (dataKey in data) {
                                // Add another stock's close value to existing entry (created in previous iterations)
                                const dataEntry = data[dataKey];
                                dataEntry[stock] = close;  // { name: "2019-12-16", FB: 205.12, AAPL: 123.45 }
                                data[dataKey] = dataEntry;
                            }
                            else {
                                // Create new entry. Add first stock's close value
                                const dataEntry = {};
                                dataEntry["name"] = date;
                                dataEntry[stock] = close;  // { name: "2019-12-16", FB: 205.12 }
                                data.push(dataEntry);  // [{ name: "2019-12-16", FB: 205.12 }, { name: "2019-12-16", FB: 205.12 }, ...]
                            }
                            dataKey++;
                        }
                    }
                }
            }
        }

        return (
            // Responsive container makes the chart adapt to the sise of the parent container
            <div>
                <ResponsiveContainer aspect={1.7} width={500}>
                    <LineChart width="100%" height="100%" data={data} margin={{top:5, right: 30, left: 20, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        {stockNames.map(stockName =>
                            <Line
                                key={stockName}
                                type="monotone"
                                dataKey={stockName}
                                stroke={this.generateHslColor()}
                                activeDot={{ r: 4 }}
                                dot={false}
                            />
                            )
                        }
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )
    }
}