import {DEFAULT_SETTINGS} from '@/constants';
import {useSettings} from '@/hooks/useApp';
import {ChatbotContainer} from './components/chatbot-container';
import {ChatbotHeader} from './components/chatbot-header';
import {MessageContainer} from './components/message-container';
import {UserMessage} from './components/user-message';
import {BotMessage} from './components/bot-message';
import {ChatBox} from './components/chat-box';

export const ChatbotView: React.FC = () => {
	const settings = useSettings();
	const chatbotName = settings?.appearance?.chatbotName ?? DEFAULT_SETTINGS.appearance.chatbotName;
	const modelName = settings?.general.model || DEFAULT_SETTINGS.general.model;
	const username = settings?.appearance.userName || DEFAULT_SETTINGS.appearance.userName;
	const botName = settings?.appearance.chatbotName || DEFAULT_SETTINGS.appearance.chatbotName;

	return (
		<ChatbotContainer>
			<ChatbotHeader chatbotName={chatbotName} modelName={modelName} />
			<MessageContainer>
				<UserMessage username={username} message="test" />
				<BotMessage name={botName} message="test" />
			</MessageContainer>
			<ChatBox />
		</ChatbotContainer>
	);
};
