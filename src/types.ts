export interface MAXSettings {
	profiles: {
		profile: string;
		profileFolderPath: string;
	};
	general: {
		model: string;
		system_role: string;
		max_tokens: string;
		temperature: string;
		allowReferenceCurrentNote: boolean;
	};
	appearance: {
		userName: string;
		chatbotName: string;
		chatbotContainerBackgroundColor: string;
		messageContainerBackgroundColor: string;
		userMessageFontColor: string;
		userMessageBackgroundColor: string;
		botMessageFontColor: string;
		botMessageBackgroundColor: string;
		chatBoxFontColor: string;
		chatBoxBackgroundColor: string;
		allowHeader: boolean;
	};
	prompts: {
		prompt: string;
		promptFolderPath: string;
	};
	editor: {
		prompt_select_generate_system_role: string;
	};
	chatHistory: {
		chatHistoryPath: string;
		templateFilePath: string;
		allowRenameNoteTitle: boolean;
	};
	OllamaConnection: {
		RESTAPIURL: string;
		allowStream: boolean;
		ollamaParameters: {
			mirostat: string;
			mirostat_eta: string;
			mirostat_tau: string;
			num_ctx: string;
			num_gqa: string;
			num_thread: string;
			repeat_last_n: string;
			repeat_penalty: string;
			seed: string;
			stop: string[];
			tfs_z: string;
			top_k: string;
			top_p: string;
			keep_alive: string;
		};
		ollamaModels: string[];
	};
	RESTAPIURLConnection: {
		APIKey: string;
		RESTAPIURL: string;
		allowStream: boolean;
		RESTAPIURLModels: string[];
	};
	APIConnections: {
		anthropic: {
			APIKey: string;
			anthropicModels: string[];
		};
		googleGemini: {
			APIKey: string;
			geminiModels: string[];
		};
		mistral: {
			APIKey: string;
			allowStream: boolean;
			mistralModels: string[];
		};
		openAI: {
			APIKey: string;
			openAIBaseUrl: string;
			allowStream: boolean;
			openAIBaseModels: string[];
		};
		openRouter: {
			APIKey: string;
			allowStream: boolean;
			openRouterModels: string[];
		};
	};
	toggleGeneralSettings: boolean;
	toggleAppearanceSettings: boolean;
	togglePromptSettings: boolean;
	toggleEditorSettings: boolean;
	toggleChatHistorySettings: boolean;
	toggleProfileSettings: boolean;
	toggleAPIConnectionSettings: boolean;
	toggleOpenAISettings: boolean;
	toggleMistralSettings: boolean;
	toggleGoogleGeminiSettings: boolean;
	toggleAnthropicSettings: boolean;
	toggleRESTAPIURLSettings: boolean;
	toggleOpenRouterSettings: boolean;
	toggleOllamaSettings: boolean;
	toggleAdvancedSettings: boolean;
	allModels: string[];
	isVerbose: boolean;
}
