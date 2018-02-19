import React from "react";

export default class StatusBar extends React.Component {
	node = null;

	render() {
		return (
			<div ref={(ref) => {
				this.node = ref
			}}>
				{this.props.pluginStatusBarPipe.map((ToolbarComponent, idx) => (
					<ToolbarComponent internals={this.props.internals} key={idx}/>
				))}
			</div>
		)
	}
}