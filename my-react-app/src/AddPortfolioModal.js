import React from "react";

export class AddPortfolioModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newPortfolioName: "",
            inputError: "",
            submitError: "",
        };
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleOnCancel = this.handleOnCancel.bind(this);
    }
    handleOnSubmit(event) {
        event.preventDefault();
        // Validate that the name is unique set state and submit
        const portfolios = this.props.portfolios;
        const newPortfolioName = this.state.newPortfolioName;
        if (portfolios.includes(newPortfolioName)) {
            this.setState({ submitError: "Pick another name for your portfolio" })
        }
        else {
            // Reset state
            this.setState({
                newPortfolioName: "",
                submitError: ""
            });
            // Pass newPortfolioName to parent
            this.props.onAdd(newPortfolioName);
        }
    }
    handleOnChange(event) {
        // Validate that the name is unique and set state
        const portfolios = this.props.portfolios;
        const newPortfolioName = event.target.value;
        if (portfolios.includes(newPortfolioName)) {
            this.setState({
                newPortfolioName: event.target.value,
                inputError: "You have another portfolio with this name"
            })
        }
        else {
            this.setState({
                newPortfolioName: event.target.value,
                inputError: "",
                submitError: ""
            })
        }
    }
    handleOnCancel() {
        this.props.onCancel();
    }
    render() {
        if (!this.props.show) {
            // Render nothing
            return <p>Modal hidden</p>;
        }
        return (
            <div>
                <p>Modal visible</p>
                {this.props.children}
                <form onSubmit={this.handleOnSubmit}>
                    <label>
                        Portfolio name
                        <input type="text" value={this.state.newPortfolioName} onChange={this.handleOnChange}/>
                    </label>
                    <p>{this.state.inputError}</p>
                    <p>{this.state.submitError}</p>
                    <input type="submit" value="Add" />
                    <button onClick={this.handleOnCancel}>Cancel</button>
                </form>
            </div>
        );
    }
}