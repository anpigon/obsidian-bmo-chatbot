import {AppContext} from '@/context';
import MAXPlugin from '@/main';
import {MAXSettings} from '@/types';
import {App} from 'obsidian';
import {useContext} from 'react';

export const usePlugin = (): MAXPlugin | undefined => {
	return useContext(AppContext);
};

export const useApp = (): App | undefined => {
	const plugin = useContext(AppContext);
	return plugin?.app;
};

export const useSettings = (): MAXSettings | undefined => {
	const plugin = useContext(AppContext);
	return plugin?.settings;
};
