import React from "react";

export class RemoveSelectedBtn extends React.Component {
    render() {
        const selections = this.props.selections;
        return (
            <button>Remove selected stocks</button>
        )
    }
}