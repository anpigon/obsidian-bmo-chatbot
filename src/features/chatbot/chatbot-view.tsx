import {DEFAULT_SETTINGS} from '@/constants';
import {useSettings} from '@/hooks/useApp';

export const ChatbotView: React.FC = () => {
	const settings = useSettings();
	const chatbotName = settings?.appearance?.chatbotName ?? DEFAULT_SETTINGS.appearance.chatbotName;

	console.log('chatbotName', chatbotName);

	return (
		<div>
			<h2>{chatbotName}</h2>
			<div>
				<textarea />
			</div>
		</div>
	);
};
