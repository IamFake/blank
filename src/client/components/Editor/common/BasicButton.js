import React from "react";

export default class BasicButton extends React.Component {
	toggle() {
		this.props.toggle(this.props.style);
	};

	render() {
		let className = 'editor__button';
		if (this.props.className) {
			className += ' ' + this.props.className;
		}
		if (this.props.active) {
			className += ' active';
		}

		return (
			<div className={className} onClick={::this.toggle} title={this.props.label}>
				<img src={this.props.icon} alt={this.props.label}/>
			</div>
		)
	}
}