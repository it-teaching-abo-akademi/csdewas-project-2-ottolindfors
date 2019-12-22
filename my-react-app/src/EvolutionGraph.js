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

    render() {
        const data = [];
        const stocks = this.props.stocks;

        for (let stock in stocks) {  // stock = aapl, fb, ...
            // Extract data
            if (stocks.hasOwnProperty(stock)) {
                const chart = stocks[stock].chart;

                for (let key in chart) {  // key = 0, 1, 2, ...
                    if (chart.hasOwnProperty(key)) {
                        const date = chart[key].date;
                        const close = chart[key].close;

                        if (key in data) {
                            // Update existing entry
                            const dataEntry = data[key];
                            dataEntry[stock] = close;  // { name: "2019-12-16", FB: 205.12 }
                            data[key] = dataEntry;
                        }
                        else {
                            // Create new entry
                            const dataEntry = {};
                            dataEntry["name"] = date;
                            dataEntry[stock] = close;  // { name: "2019-12-16", FB: 205.12 }
                            data.push(dataEntry);  // [{ name: "2019-12-16", FB: 205.12 }, { name: "2019-12-16", FB: 205.12 }, ...]
                        }

                    }
                }

            }
        }

        let stockNames = [];
        for (let stockName in stocks) {
            if (stocks.hasOwnProperty(stockName)) {
                stockNames.push(stockName);
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