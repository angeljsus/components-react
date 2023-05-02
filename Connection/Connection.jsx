import React, { useEffect, useState } from 'react';
import ButtonOne from './../Elements/ButtonOne';

import axios from 'axios';

const Text = () => {
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
		// 3er parametro headers si es necesario
		window.Main.ping(HOST, PATH, {})
			.then((result) => {
				console.log(result)
				return new Promise((resolve, reject) => {
					// 403, 500, 'ECONNREFUSED', 'ENOTFOUND' are connection's errors
					result.statusCode === 200 || result.statusCode === 302 
						? resolve(result)
						: reject(result);
				})
			})
			.then(() => setStatusAccessURL( true))
			.then(() => setStatusTimer(inicio))
			.catch((err) => {
				console.log('Ocurrio un error al realizar la peticion: ', err);
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

export default Text;
