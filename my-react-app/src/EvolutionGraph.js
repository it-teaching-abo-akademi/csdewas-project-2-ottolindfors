import React from "react";
import {LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer} from "recharts";

export class EvolutionGraph extends React.PureComponent{
    render() {
        const data = [
            {
                name: 'STOCK A', uv: 4000, pv: 2400, amt: 2400,
            },
            {
                name: 'STOCK B', uv: 3000, pv: 1398, amt: 2210,
            },
            {
                name: 'STOCK C', uv: 2000, pv: 9800, amt: 2290,
            },
            {
                name: 'STOCK D', uv: 2780, pv: 3908, amt: 2000,
            },
            {
                name: 'STOCK E', uv: 1890, pv: 4800, amt: 2181,
            },
            {
                name: 'STOCK F', uv: 2390, pv: 3800, amt: 2500,
            },
            {
                name: 'STOCK G', uv: 6490, pv: 4300, amt: 2100,
            },
        ];

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
                        <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 6 }}/>
                        <Line type="monotone" dataKey="uv" stroke="#82ca9d" activeDot={{ r: 6 }}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )
    }
}