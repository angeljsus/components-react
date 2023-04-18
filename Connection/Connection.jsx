import { useEffect, useState, useContext } from 'react';

const Connection = () => {
	const [statusAccessURL, setStatusAccessURL] = useState(false);
	const [online, setOnline] = useState(window.navigator.onLine);
	const [timer, setStatusTimer] = useState(0);
	const [message, setMessage] = useState('');
	const seconds = 60000; // un minuto
	const HOST = 'localhost';
	const PATH = ''; 

	useEffect(() => {
		pingConnection(1);
	}, []);

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => {
				if (window.navigator.onLine) {
					pingConnection(timer + 1);
					setOnline(true);
				} else {
					setOnline(false);
				}
			}, seconds);
			return () => clearInterval(interval);
		}
	}, [timer]);

	const pingConnection = (inicio) => {
		const sec = seconds / 1000;
		const minutes = sec / 60;
		timer > 0 ? console.log('Han pasado %s %s', sec < 60 ? sec : minutes, sec < 60 ? 'segundos' : 'minuto(s)') : null;
		window.Main.ping(HOST, PATH)
			.then((result) => {
				//  WATCH REQ NODE PROPERTIES
				// console.log(result)
				setStatusAccessURL( true);
				setStatusTimer(inicio);
			})
			.catch((err) => {
				// LOG ERROR HERE!
				// console.log(err)
				setStatusAccessURL(false);
				setStatusTimer(inicio);
			});
	};

	return (
		<>
			{online ? 'Online:: ' + (statusAccessURL ? 'Si tiene acceso a la URL' : 'NO tienes acceso a la URL') : 'Offline!'}
		</>
	);
};

export default Connection;
