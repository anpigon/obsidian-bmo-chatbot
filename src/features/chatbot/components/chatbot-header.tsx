import {PropsWithChildren} from 'react';

interface ChatbotHeaderProps extends PropsWithChildren {
	chatbotName: string;
	modelName: string;
}

export const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({chatbotName, modelName}) => {
	return (
		<div className="py-4 px-0">
			<h2 className="text-[var(--interactive-accent)] text-center mt-0 mb-0 p-0 text-xl w-full">{chatbotName}</h2>
			<p className="my-0 text-center text-[var(--interactive-accent)] text-xs">{modelName}</p>
		</div>
	);
};
