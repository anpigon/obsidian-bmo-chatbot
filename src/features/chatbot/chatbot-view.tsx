import {DEFAULT_SETTINGS} from '@/constants';
import {useSettings} from '@/hooks/useApp';
import {ChatbotContainer} from './components/chatbot-container';
import {ChatbotHeader} from './components/chatbot-header';
import {MessageContainer} from './components/message-container';
import {UserMessage} from './components/user-message';
import {BotMessage} from './components/bot-message';
import {ChatBox} from './components/chat-box';
import {useRef} from 'react';

export const ChatbotView: React.FC = () => {
	const chatBoxRef = useRef<HTMLTextAreaElement>(null);
	const settings = useSettings();
	const chatbotName = settings?.appearance?.chatbotName ?? DEFAULT_SETTINGS.appearance.chatbotName;
	const modelName = settings?.general.model || DEFAULT_SETTINGS.general.model;
	const username = settings?.appearance.userName || DEFAULT_SETTINGS.appearance.userName;
	const botName = settings?.appearance.chatbotName || DEFAULT_SETTINGS.appearance.chatbotName;

	const handleKeyup: React.KeyboardEventHandler<HTMLTextAreaElement> = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (!event.shiftKey && event.key === 'Enter') {
			// how to get value
			const e = event as unknown as React.ChangeEvent<HTMLTextAreaElement>;
			console.log('handleKeyup', e.target.value);
			// lastBotMessage.scrollIntoView({
			// 	behavior: 'smooth',
			// 	block: 'start',
			// });
		}
	};

	const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (!chatBoxRef.current) return;
		chatBoxRef.current.style.height = '';
		if (parseInt(chatBoxRef.current.style.height) >= chatBoxRef.current.scrollHeight) return;
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
			<MessageContainer>
				<UserMessage username={username} message="test" />
				<BotMessage name={botName} message="test" />
			</MessageContainer>
			<ChatBox ref={chatBoxRef} onKeyUp={handleKeyup} onInput={handleInput} onBlur={handleBlur} />
		</ChatbotContainer>
	);
};
