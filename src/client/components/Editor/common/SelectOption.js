import React from 'react';
import PropTypes from 'prop-types';
// import Select from 'react-select';

export default class SelectOption extends React.Component {
	propTypes: {
		children: PropTypes.node,
		className: PropTypes.string,
		isDisabled: PropTypes.bool,
		isFocused: PropTypes.bool,
		isSelected: PropTypes.bool,
		onFocus: PropTypes.func,
		onSelect: PropTypes.func,
		option: PropTypes.object.isRequired,
	};

	handleMouseDown(event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onSelect(this.props.option, event);
	}

	handleMouseEnter(event) {
		this.props.onFocus(this.props.option, event);
	}

	handleMouseMove(event) {
		if (this.props.isFocused) return;
		this.props.onFocus(this.props.option, event);
	}

	render() {
		return (
			<div className={this.props.className}
				 onMouseDown={::this.handleMouseDown}
				 onMouseEnter={::this.handleMouseEnter}
				 onMouseMove={::this.handleMouseMove}
				 title={this.props.option.title}
				 style={this.props.option.itemStyle}>
				{this.props.children}
			</div>
		);
	}
}