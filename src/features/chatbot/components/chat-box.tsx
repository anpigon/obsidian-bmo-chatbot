import {forwardRef} from 'react';

export const ChatBox = forwardRef<HTMLTextAreaElement, React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>>(
	(props, ref) => {
		return (
			<div className="items-center justify-center mx-3 my-3 p-1">
				<textarea
					ref={ref}
					className="w-full h-8 max-h-40 resize-none text-base overflow-y-auto text-[var(--text-normal)] placeholder:text-sm"
					contentEditable
					placeholder="What can I help you with?"
					{...props}
				/>
			</div>
		);
	}
);
