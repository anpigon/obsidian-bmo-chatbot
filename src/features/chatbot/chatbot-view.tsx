import {DEFAULT_SETTINGS} from '@/constants';
import {useSettings} from '@/hooks/useApp';

export const ChatBotView: React.FC = () => {
	const settings = useSettings();
	const chatbotName = settings?.appearance?.chatbotName ?? DEFAULT_SETTINGS.appearance.chatbotName;

	return (
		<div>
			<h2>{chatbotName}</h2>
			<div>
				<textarea />
			</div>
		</div>
	);
};
