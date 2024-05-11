import {DEFAULT_MODEL, DEFAULT_SETTINGS, XIONIC_API_KEY, XIONIC_REST_API_URL} from '@/constants';
import {useSettings} from '@/hooks/useApp';
import {MessageType} from '@langchain/core/messages';
import {Notice, RequestUrlParam, request, requestUrl} from 'obsidian';
import {useRef, useState, useTransition} from 'react';
import {BotMessage} from './components/bot-message';
import {ChatBox} from './components/chat-box';
import {ChatbotContainer} from './components/chatbot-container';
import {ChatbotHeader} from './components/chatbot-header';
import {MessageContainer} from './components/message-container';
import {UserMessage} from './components/user-message';
import {ChatOpenAI} from '@langchain/openai';
import {StringOutputParser} from '@langchain/core/output_parsers';
import {ChatOllama} from '@langchain/community/chat_models/ollama';
import {requestFetch} from '@/utils/request-fetch';

const parser = new StringOutputParser();

export const ChatbotView: React.FC = () => {
	const formRef = useRef<HTMLFormElement>(null);
	const chatBoxRef = useRef<HTMLTextAreaElement>(null);
	const messageContainerRef = useRef<HTMLDivElement>(null);
	const settings = useSettings();
	const chatbotName = settings?.appearance?.chatbotName ?? DEFAULT_SETTINGS.appearance.chatbotName;
	const modelName = settings?.general.model || DEFAULT_SETTINGS.general.model;
	const username = settings?.appearance.userName || DEFAULT_SETTINGS.appearance.userName;
	const botName = settings?.appearance.chatbotName || DEFAULT_SETTINGS.appearance.chatbotName;

	const [isPending, startTransition] = useTransition();
	const [messages, setMessages] = useState<Array<[MessageType, string]>>([]);

	const resetInputForm = () => {
		if (!formRef.current || !chatBoxRef.current) return;
		formRef.current.reset();
		chatBoxRef.current.style.height = '';
	};

	const handleKeyup: React.KeyboardEventHandler<HTMLTextAreaElement> = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (!event.shiftKey && event.key === 'Enter') {
			event.preventDefault();

			const e = event as unknown as React.ChangeEvent<HTMLTextAreaElement>;
			const message = e.target.value;
			if (!message?.trim()?.length) {
				return;
			}

			if (!settings?.general.model) {
				new Notice('No LLM model selected. Please select a model to proceed.');
				return;
			}

			resetInputForm();

			const chatHistories: [MessageType, string][] = [...messages, ['human', message]];

			// setMessages(prev => {
			// 	return [...prev, ['human', message]];
			// });
			setMessages(chatHistories);

			messageContainerRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'end',
			});

			if (settings.general.model.startsWith('ollama/')) {
				const ollamaRESTAPIURL = settings.OllamaConnection.RESTAPIURL;
				if (!ollamaRESTAPIURL) {
					return;
				}
				console.log('ollamaRESTAPIURL', ollamaRESTAPIURL);

				const ollama = new ChatOllama({
					baseUrl: ollamaRESTAPIURL,
					// model: settings.general.model,
					model: 'llama3',
				});
				ollama
					.pipe(parser)
					.invoke(chatHistories, {
						// configurable: ollamaParametersOptions(settings),
					})
					.then(response => {
						console.log('ollama', response);
					})
					.catch(error => {
						console.log('ollama', error);
					});
				return;
			} else if (settings.general.model === DEFAULT_MODEL) {
				const model = new ChatOpenAI({
					model: DEFAULT_MODEL,
					apiKey: XIONIC_API_KEY,
					maxRetries: 1,
					configuration: {
						baseURL: XIONIC_REST_API_URL,
						// dangerouslyAllowBrowser: true,
						// fetch: requestFetch,
					},
				});
				model
					.pipe(parser)
					.invoke(chatHistories)
					.then(output => {
						startTransition(() => {
							setMessages(prev => {
								return [...prev, ['ai', output]];
							});
						});
					});
			}
		}
	};

	const handleInput = () => {
		if (!chatBoxRef.current) return;
		chatBoxRef.current.style.height = '';
		chatBoxRef.current.style.height = `${chatBoxRef.current.scrollHeight}px`;
	};

	const handleBlur = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (!chatBoxRef.current) return;
		if (!event.target.value) {
			chatBoxRef.current.style.height = '';
		}
	};

	return (
		<ChatbotContainer>
			<ChatbotHeader chatbotName={chatbotName} modelName={modelName} />
			<MessageContainer ref={messageContainerRef}>
				{messages.map(([type, content], i) => {
					if (type === 'ai') {
						return <BotMessage key={i} name={botName} message={content} />;
					}
					if (type === 'human') {
						return <UserMessage key={i} username={username} message={content} />;
					}
					return;
				})}
			</MessageContainer>
			<form ref={formRef}>
				<ChatBox ref={chatBoxRef} onKeyUp={handleKeyup} onInput={handleInput} onBlur={handleBlur} />
			</form>
		</ChatbotContainer>
	);
};
