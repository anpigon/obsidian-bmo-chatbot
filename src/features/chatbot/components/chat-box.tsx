export const ChatBox: React.FC<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>> = props => {
	return (
		<div className="items-center justify-center mx-3 my-3 p-1">
			<textarea className="w-full h-full" contentEditable placeholder="What can I help you with?" {...props} />
		</div>
	);
};
