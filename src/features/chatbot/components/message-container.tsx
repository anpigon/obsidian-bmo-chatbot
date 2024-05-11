import {PropsWithChildren} from 'react';

export const MessageContainer: React.FC<PropsWithChildren> = ({children}) => {
	return <div className="max-h-screen md:max-h-[calc(100%-60px)]; mt-0 flex-grow overflow-y-auto select-text break-words">{children}</div>;
};
