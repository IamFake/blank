import React from 'react';

export default class SelectOption extends React.Component {
	render() {
		return (
			<div className="Select-value" title={this.props.value.title}>
				<span className="Select-value-label"
					  style={this.props.value.valueStyle ? this.props.value.itemStyle : ''}>
					{this.props.children}
				</span>
			</div>
		);
	}
}