import { useEffect, useState, useContext } from 'react';

const Connection = () => {
	const [statusAccessURL, setStatusAccessURL] = useState(false);
	const [online, setOnline] = useState(window.navigator.onLine);
	const [timer, setStatusTimer] = useState(0);
	const [message, setMessage] = useState('');
	const seconds = 60000; // un minuto
	const URL = 'http://localhost/auth/ping.php';

	useEffect(() => {
		pingConnection(1);
	}, []);

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => {
				if (window.navigator.onLine) {
					pingConnection(timer + 1);
					console.log(window.navigator.onLine)
					setOnline(true);
				} else {
					setOnline(false);
				}
			}, seconds);
			return () => clearInterval(interval);
		}
	}, [timer]);

	const pingConnection = (inicio) => {

		return fetch(URL, { })
			.then(({ ok, status }) => (status === 200 && ok ? true : false))
			.then(
				(acceso) => {
					setStatusAccessURL(acceso);
					setStatusTimer(inicio);
				},
				(error) => {
					setStatusAccessURL(false);
					setStatusTimer(inicio);
				}
			)
	};

	return (
		<>
			{online ? 'Online:: ' + (statusAccessURL ? 'Si tiene acceso a la URL' : 'NO tienes acceso a la URL') : 'Offline!'}
		</>
	);
};

export default Connection;
