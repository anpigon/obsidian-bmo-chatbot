import { Plugin } from 'obsidian';
import { BMOView, VIEW_TYPE_CHATBOT, filenameMessageHistoryJSON, clearMessageHistory } from "./view";
import { BMOSettingTab } from './settings';

export interface BMOSettings {
	models: any;
	apiKey: string;
	max_tokens: string;
	model: string;
	system_role: string;
	temperature: number;
	userName: string;
	chatbotName: string;
	chatbotContainerBackgroundColor: string;
	userMessageBackgroundColor: string;
	botMessageBackgroundColor: string;
	chatHistoryPath: string;
	templateFilePath: string;
	openAIBaseUrl: string;
	restAPIUrl: string;
	referenceCurrentNote: boolean;
	allowRenameNoteTitle: boolean;
}

export const DEFAULT_SETTINGS: BMOSettings = {
	apiKey: '',
	max_tokens: '',
	model: 'gpt-3.5-turbo',
	system_role: '',
	temperature: 1.00,
	userName: 'USER',
	chatbotName: 'BMO',
	chatbotContainerBackgroundColor: '--background-secondary',
	userMessageBackgroundColor: '--background-primary',
	botMessageBackgroundColor: '--background-secondary',
	chatHistoryPath: 'BMO/',
	templateFilePath: '',
	openAIBaseUrl: 'https://api.openai.com/v1',
	restAPIUrl: '',
	models: undefined,
	referenceCurrentNote: false,
	allowRenameNoteTitle: false,
}


export default class BMOGPT extends Plugin {
	settings: BMOSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_CHATBOT,
			(leaf) => new BMOView(leaf, this.settings, this)
		);

		this.addRibbonIcon("bot", "Chatbot (Clear Conversation)", () => {
			this.activateView();
			this.app.vault.adapter.write(filenameMessageHistoryJSON, '');
			clearMessageHistory();

		});

		this.addCommand({
            id: 'open-bmo-chatbot',
            name: 'Open BMO Chatbot',
            callback: () => {
                this.activateView();
            },
            hotkeys: [
				{
					modifiers: ['Mod'],
					key: '0',
				},
            ],
        });

		this.addSettingTab(new BMOSettingTab(this.app, this));
	}

	async onunload() {
		this.app.workspace.getLeavesOfType(VIEW_TYPE_CHATBOT).forEach((leaf) => {
			const bmoView = leaf.view as BMOView;
	
			if (bmoView) {
				this.saveSettings();
				bmoView.cleanup();
			} 
		});
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_CHATBOT);
	
		const rightLeaf = this.app.workspace.getRightLeaf(false);
		await rightLeaf.setViewState({
			type: VIEW_TYPE_CHATBOT,
			active: true,
		});
	
		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_CHATBOT)[0]
		);
	
		const messageContainer = document.querySelector("#messageContainer");
		if (messageContainer) {
			messageContainer.scroll({
				top: messageContainer.scrollHeight, 
				behavior: 'smooth' 
			});
		}
	}
	

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}