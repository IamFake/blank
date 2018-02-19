import React from 'react';
import {Link} from 'react-router-dom';

export const Header = (props) => (
	<div className="header">
		<div className="header__wrap">
			<div className="header__logo">
				<Link to="/">The Proj</Link>
			</div>
			<div className="header__menu">
				{props.children}
			</div>
		</div>
	</div>
);

export default Header;
