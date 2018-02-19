import React from 'react'

export default class Subscriber extends React.Component{
	subscribers = {};

	subscribe(event, fn) {
		if (!this.subscribers[event]) this.subscribers[event] = [];
		this.subscribers[event].push(fn);

		return () => this.unsubscribe(event, fn)
	}

	unsubscribe(event, fn) {
		if (!this.subscribers[event]) return;

		this.subscribers[event] = this.subscribers[event].filter((subscriber) => subscriber !== fn)
	}

	publish(event, ...rest) {
		if (!this.subscribers[event]) return;

		this.subscribers[event].forEach((client) => client(...rest))
	}
}