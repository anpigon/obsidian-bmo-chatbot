import {MAXSettings} from './types';

export const DEFAULT_MODEL = 'xionic-ko-llama-3-70b';

export const XIONIC_REST_API_URL = 'http://sionic.chat:8001/v1';
export const XIONIC_API_KEY = '934c4bbc-c384-4bea-af82-1450d7f8128d';

export const OLLAMA_REST_API_URL = 'http://localhost:11434';

export const DEFAULT_SETTINGS: MAXSettings = {
	profiles: {
		profile: 'MAX.md',
		profileFolderPath: 'MAX/Profiles',
	},
	general: {
		model: DEFAULT_MODEL,
		system_role: 'You are a helpful assistant.',
		max_tokens: '',
		temperature: '1.00',
		allowReferenceCurrentNote: false,
	},
	appearance: {
		userName: 'USER',
		chatbotName: 'MAX',
		chatbotContainerBackgroundColor: '--background-secondary',
		messageContainerBackgroundColor: '--background-secondary',
		userMessageFontColor: '--text-normal',
		userMessageBackgroundColor: '--background-primary',
		botMessageFontColor: '--text-normal',
		botMessageBackgroundColor: '--background-secondary',
		chatBoxFontColor: '--text-normal',
		chatBoxBackgroundColor: '--interactive-accent',
		allowHeader: true,
	},
	prompts: {
		prompt: '',
		promptFolderPath: 'MAX/Prompts',
	},
	editor: {
		prompt_select_generate_system_role: 'Output user request.',
	},
	chatHistory: {
		chatHistoryPath: 'MAX/History',
		templateFilePath: '',
		allowRenameNoteTitle: false,
	},
	OllamaConnection: {
		RESTAPIURL: OLLAMA_REST_API_URL,
		allowStream: false,
		ollamaParameters: {
			keep_alive: '',
			mirostat: '0',
			mirostat_eta: '0.10',
			mirostat_tau: '5.00',
			num_ctx: '2048',
			num_gqa: '',
			num_thread: '',
			repeat_last_n: '64',
			repeat_penalty: '1.10',
			seed: '',
			stop: [],
			tfs_z: '1.00',
			top_k: '40',
			top_p: '0.90',
		},
		ollamaModels: [],
	},
	RESTAPIURLConnection: {
		APIKey: '',
		RESTAPIURL: '',
		allowStream: false,
		RESTAPIURLModels: [],
	},
	APIConnections: {
		anthropic: {
			APIKey: '',
			anthropicModels: [],
		},
		googleGemini: {
			APIKey: '',
			geminiModels: [],
		},
		mistral: {
			APIKey: '',
			allowStream: false,
			mistralModels: [],
		},
		openAI: {
			APIKey: '',
			openAIBaseUrl: 'https://api.openai.com/v1',
			allowStream: true,
			openAIBaseModels: [],
		},
		openRouter: {
			APIKey: '',
			allowStream: false,
			openRouterModels: [],
		},
	},
	toggleGeneralSettings: true,
	toggleAppearanceSettings: false,
	togglePromptSettings: false,
	toggleEditorSettings: false,
	toggleChatHistorySettings: false,
	toggleProfileSettings: false,
	toggleAPIConnectionSettings: true,
	toggleOpenAISettings: false,
	toggleMistralSettings: false,
	toggleGoogleGeminiSettings: false,
	toggleAnthropicSettings: false,
	toggleRESTAPIURLSettings: true,
	toggleOpenRouterSettings: false,
	toggleOllamaSettings: true,
	toggleAdvancedSettings: false,
	allModels: [],
	isVerbose: false,
};
