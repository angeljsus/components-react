import { useState } from 'react';
import './WebView.css';

const WebView = () => {
	const [params, setParams] = useState('');
	const host = 'https://github.com/';

	const changeParams = () => {
		const toSet = params ? '' : 'angeljsus';
		setParams(toSet);
	};

	return (
		<>
			<webview className="web-view" src={host + params}></webview>
			<button className="web-view-button" onClick={changeParams}>
				Change Params
			</button>
		</>
	);
};

export default WebView;
