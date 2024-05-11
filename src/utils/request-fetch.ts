/* eslint-disable @typescript-eslint/no-explicit-any */
import {ClientOptions} from '@langchain/openai';
import {requestUrl} from 'obsidian';
import Logger from './logging';

export const requestFetch: ClientOptions['fetch'] = async (url, init) => {
	Logger.info(url, init);
	const headers = init?.headers as unknown as Record<string, string>;
	const body = JSON.stringify(JSON.parse(`${init?.body ?? {}}`));
	Logger.info('headers', headers);
	Logger.info('body', body);

	const response = await requestUrl({
		url: `${url}`,
		method: 'POST',
		// headers: init?.headers as any,
		headers: {
			'Content-Type': 'application/json',
			Authorization: headers['authorization'],
		},
		body,
		// body: `${init?.body}`,
		// body: JSON.stringify({
		// 	model: 'xionic-ko-llama-3-70b',
		// 	temperature: 1,
		// 	top_p: 1,
		// 	frequency_penalty: 0,
		// 	presence_penalty: 0,
		// 	n: 1,
		// 	stream: false,
		// 	messages: [],
		// }),
	});
	Logger.info('response', response.json);
	return response as unknown as Promise<Response>;
};
