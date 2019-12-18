import React from 'react';
import './App.css';

const BASE_URL = 'https://sandbox.iexapis.com/stable/stock/';
const TOKEN = 'Tpk_391653b184fb45f2a8e9b1270c0306e9';
const TEST_URL = 'https://sandbox.iexapis.com/stable/stock/market/batch?symbols=aapl,fb,twtr&types=quote&range=5d&token=Tpk_391653b184fb45f2a8e9b1270c0306e9'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loaded: false,
        };
    }

    componentDidMount() {
        fetch(TEST_URL)
            .then(response => response.json())
            .then(data => {
                console.log("\ncomponentDidMount: ");
                console.log(data);
                console.log(data.AAPL);
                console.log(data.AAPL.quote);
                console.log(data.AAPL.quote.symbol);
                // Todo: Create a data structure similar to the föli data
                let arr = [];
                arr.push(data);
                this.setState({data: arr, loaded: true})
            })
    }

    render() {
        console.log("\nrender:");

        const d = this.state.data;
        const loaded = this.state.loaded;

        if (!loaded) {
            return <p>Loading ...</p>;
        }

        console.log("element:");
        d.map(element => console.log(element));
        console.log(d);

        console.log("loaded " + loaded);
        let stocks = [];
        for (let [stock, value] of Object.entries(d)) {
            if (d.hasOwnProperty(stock)) {
                console.log(value);
                stocks.push(stock);

                for (let [quote, value2] of Object.entries(value)) {

                }

            }
        }
        console.log(stocks);
        return (
            <div className="App">
                <h1>Hello</h1>
                {stocks.map(symbol =>
                    <li key={symbol}>
                        <p>{symbol}</p>
                    </li>
                )}
            </div>
        );
    }
}

export default App;
