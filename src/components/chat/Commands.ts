import {Notice, TFile} from 'obsidian';
import {MAXSettings, DEFAULT_SETTINGS, updateSettingsFromFrontMatter} from '../../main';
import {colorToHex} from '../../utils/ColorConverter';
import {filenameMessageHistoryJSON, messageHistory} from '../../view';
import MAXGPT from '../../main';
import {getAbortController} from '../FetchModelResponse';
import {fetchModelRenameTitle} from '../editor/FetchRenameNoteTitle';
import {displayCommandBotMessage} from './BotMessage';
import {addMessage} from './Message';

// Commands
export function executeCommand(input: string, settings: MAXSettings, plugin: MAXGPT) {
	const command = input.split(' ')[0]; // Get the first word from the input

	switch (command) {
		case '/h':
		case '/help':
		case '/man':
		case '/manual':
		case '/commands':
			commandHelp(plugin, settings);
			break;
		case '/m':
		case '/model':
		case '/models':
			return commandModel(input, settings, plugin);
		case '/p':
		case '/prof':
		case '/profile':
		case '/profiles':
			return commandProfile(input, settings, plugin);
		case '/prompt':
		case '/prompts':
			return commandPrompt(input, settings, plugin);
		case '/ref':
		case '/reference':
			commandReference(input, settings, plugin);
			break;
		case '/temp':
		case '/temperature':
			commandTemperature(input, settings, plugin);
			break;
		case '/maxtokens':
			commandMaxTokens(input, settings, plugin);
			break;
		// case '/system':
		//     commandSystem(input, settings, plugin);
		//     break;
		case '/append':
			commandAppend(plugin, settings);
			break;
		case '/save':
			commandSave(plugin, settings);
			break;
		case '/c':
		case '/clear':
			removeMessageThread(plugin, 0);
			break;
		case '/s':
		case '/stop':
			commandStop();
			break;
		default:
			commandFalse(settings, plugin);
	}
}

// Function to create and append a bot message
export function createBotMessage(settings: MAXSettings): HTMLDivElement {
	const messageContainer = document.querySelector('#messageContainer');
	const botMessage = document.createElement('div');
	botMessage.classList.add('botMessage');
	botMessage.style.backgroundColor = colorToHex(
		settings.appearance.botMessageBackgroundColor ||
			getComputedStyle(document.body).getPropertyValue(DEFAULT_SETTINGS.appearance.botMessageBackgroundColor).trim()
	);
	messageContainer?.appendChild(botMessage);

	const botNameSpan = document.createElement('span');
	botNameSpan.textContent = settings.appearance.chatbotName || DEFAULT_SETTINGS.appearance.chatbotName;
	botNameSpan.className = 'chatbotName';
	botMessage.appendChild(botNameSpan);

	const messageBlock = document.createElement('div');
	messageBlock.classList.add('messageBlock');
	botMessage.appendChild(messageBlock);

	return messageBlock;
}

export async function commandFalse(settings: MAXSettings, plugin: MAXGPT) {
	const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;
	const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, 'Command not recognized.');
	messageContainer.appendChild(botMessageDiv);
	await plugin.saveSettings();
}

// =================== COMMAND FUNCTIONS ===================

// `/help` for help commands
export function commandHelp(plugin: MAXGPT, settings: MAXSettings) {
	const commandBotMessage = `<h2>Commands</h2>
  <p><code>/model [MODEL-NAME] or [VALUE]</code> - List or change model.</p>
  <p><code>/profile [PROFILE-NAME] or [VALUE]</code> - List or change profile.</p>
  <p><code>/prompt [PROMPT-NAME] or [VALUE]</code> - List or change prompts.</p>
  <p><code>/prompt clear</code> - Clear prompt.</p>
  <p><code>/maxtokens [VALUE]</code> - Set max tokens.</p>
  <p><code>/temp [VALUE]</code> - Change temperature range from 0 to 2.</p>
  <p><code>/ref on | off</code> - Turn on or off "reference current note".</p>
  <p><code>/append</code> - Append current chat history to current active note.</p>
  <p><code>/save</code> - Save current chat history to a note.</p>
  <p><code>/clear</code> or <code>/c</code> - Clear chat history.</p>
  <p><code>/stop</code> or <code>/s</code> - [STREAMING MODELS ONLY]: Stop fetching response.</p>`;

	const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;
	const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
	messageContainer.appendChild(botMessageDiv);
}

// `/model "[VALUE]"` to change model.
export async function commandModel(input: string, settings: MAXSettings, plugin: MAXGPT) {
	const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;
	// Check if the user has not specified a model after the "/model" command
	if (!input.split(' ')[1]) {
		// Loop through allModels and create list items
		const modelListItems = settings.allModels.map(model => `<li>${model}</li>`).join('');

		let currentModel = settings.general.model;

		// Check if currentModel is empty, and set it to "Empty" if it is
		if (!currentModel) {
			currentModel = 'Empty';
		}

		const commandBotMessage = `<h2>Models</h2>
    <p><b>Current Model:</b> ${currentModel}</p>
    <ol>${modelListItems}</ol>`;

		const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
		messageContainer.appendChild(botMessageDiv);
	}

	// Check if the user has specified a model after the "/model" command
	if (input.split(' ')[1] !== undefined) {
		const inputModel = input.split(' ')[1].replace(/^"(.*)"$/, '$1');

		const modelAliases: {[key: string]: string} = {};

		for (let i = 1; i <= settings.allModels.length; i++) {
			const model = settings.allModels[i - 1];
			modelAliases[i] = model;
		}

		if (Object.entries(modelAliases).find(([key, val]) => key === inputModel)) {
			settings.general.model = modelAliases[inputModel];
			const commandBotMessage = `Updated Model to <b>${settings.general.model}</b>`;
			const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
			messageContainer.appendChild(botMessageDiv);
		} else if (Object.entries(modelAliases).find(([key, val]) => val === inputModel)) {
			settings.general.model = modelAliases[Object.keys(modelAliases).find(key => modelAliases[key] === inputModel) || ''];
			const commandBotMessage = `Updated Model to <b>${settings.general.model}</b>`;
			const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
			messageContainer.appendChild(botMessageDiv);
		} else {
			const commandBotMessage = `Model '${inputModel}' does not exist for this API key.`;
			const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
			messageContainer.appendChild(botMessageDiv);
			new Notice('Invalid model.');
		}

		await plugin.saveSettings();
		return settings;
	}
}

// `/profile "[VALUE]"` to change profile.
export async function commandProfile(input: string, settings: MAXSettings, plugin: MAXGPT) {
	const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;

	if (!settings.profiles.profileFolderPath) {
		new Notice('Profile folder path not set.');
		const commandBotMessage = '<p>Profile folder path not set.</p>';

		const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
		messageContainer.appendChild(botMessageDiv);
		return;
	}

	// Fetching files from the specified folder
	const files = plugin.app.vault.getFiles().filter(file => file.path.startsWith(plugin.settings.profiles.profileFolderPath));

	// Sorting the files array alphabetically by file name
	files.sort((a, b) => a.name.localeCompare(b.name));

	// Check if the user has not specified a profile
	if (!input.split(' ')[1]) {
		// Loop through files and create list items, removing the file extension
		const fileListItems = files
			.map(file => {
				const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, ''); // Removing the last dot and what follows
				return `<li>${fileNameWithoutExtension}</li>`;
			})
			.join('');

		let currentProfile = settings.profiles.profile.replace(/\.[^/.]+$/, ''); // Removing the file extension

		// Check if currentProfile is empty, and set it to "Empty" if it is
		if (!currentProfile) {
			currentProfile = 'Empty';
		}

		const commandBotMessage = `<h2>Profiles</h2>
      <p><b>Current profile:</b> ${currentProfile}</p>
      <ol>${fileListItems}</ol>`;

		const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
		messageContainer.appendChild(botMessageDiv);

		return;
	}

	// Check if the user has specified a profile
	if (input.startsWith('/p') || input.startsWith('/prof') || input.startsWith('/profile') || input.startsWith('/profiles')) {
		let inputValue = input.split(' ').slice(1).join(' ').trim();

		// Remove quotation marks if present
		if ((inputValue.startsWith('"') && inputValue.endsWith('"')) || (inputValue.startsWith("'") && inputValue.endsWith("'"))) {
			inputValue = inputValue.substring(1, inputValue.length - 1);
		}

		const profileAliases: {[key: string]: string} = {};

		// Create aliases for each file (profile)
		for (let i = 1; i <= files.length; i++) {
			const fileNameWithoutExtension = files[i - 1].name.replace(/\.[^/.]+$/, '');
			profileAliases[i.toString().toLowerCase()] = fileNameWithoutExtension;
		}

		if (profileAliases[inputValue]) {
			// If input matches a key in profileAliases
			plugin.settings.profiles.profile = `${profileAliases[inputValue]}.md`;
			const profileFilePath = `${plugin.settings.profiles.profileFolderPath}/${profileAliases[inputValue]}.md`;
			const currentProfile = plugin.app.vault.getAbstractFileByPath(profileFilePath) as TFile;
			plugin.activateView();
			await updateSettingsFromFrontMatter(plugin, currentProfile);
			await plugin.saveSettings();
		} else if (
			Object.values(profileAliases)
				.map(v => v.toLowerCase())
				.includes(inputValue.toLowerCase())
		) {
			// If input matches a value in profileAliases (case-insensitive)
			const matchedProfile = Object.entries(profileAliases).find(([key, value]) => value.toLowerCase() === inputValue.toLowerCase());
			if (matchedProfile) {
				plugin.settings.profiles.profile = `${matchedProfile[1]}.md`;
				const profileFilePath = `${plugin.settings.profiles.profileFolderPath}/${matchedProfile[1]}.md`;
				const currentProfile = plugin.app.vault.getAbstractFileByPath(profileFilePath) as TFile;
				plugin.activateView();
				await updateSettingsFromFrontMatter(plugin, currentProfile);
				await plugin.saveSettings();
			}
		} else {
			// If the input profile does not exist
			addMessage(plugin, input, 'userMessage', settings, messageHistory.length - 1);
			const commandBotMessage = `Profile '${inputValue}' does not exist.`;
			const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
			messageContainer.appendChild(botMessageDiv);
			const botMessages = messageContainer.querySelectorAll('.botMessage');
			const lastBotMessage = botMessages[botMessages.length - 1];
			lastBotMessage.scrollIntoView({behavior: 'smooth', block: 'start'});
			new Notice('Invalid profile.');
		}

		await plugin.saveSettings();
		return settings;
	}
}

// `/prompt "[VALUE]"` to change prompt.
export async function commandPrompt(input: string, settings: MAXSettings, plugin: MAXGPT) {
	const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;

	if (!settings.prompts.promptFolderPath) {
		new Notice('Prompt folder path not set.');
		const commandBotMessage = '<p>Prompt folder path not set.</p>';

		const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
		messageContainer.appendChild(botMessageDiv);
		return;
	}

	// Fetching files from the specified folder
	const files = plugin.app.vault.getFiles().filter(file => file.path.startsWith(plugin.settings.prompts.promptFolderPath));

	// Sorting the files array alphabetically by file name
	files.sort((a, b) => a.name.localeCompare(b.name));

	// Check if the user has not specified a prompt after the "/prompt" command
	if (!input.split(' ')[1]) {
		// Loop through files and create list items, removing the file extension
		const fileListItems = files
			.map(file => {
				const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, ''); // Removing the last dot and what follows
				return `<li>${fileNameWithoutExtension}</li>`;
			})
			.join('');

		let currentPrompt = settings.prompts.prompt;

		// Check if currentPrompt is empty, and set it to "Empty" if it is
		if (!currentPrompt) {
			currentPrompt = 'Empty';
		}

		const commandBotMessage = `<h2>Prompts</h2>
      <p><b>Current prompt:</b> ${currentPrompt.replace('.md', '')}</p>
      <ol>${fileListItems}</ol>`;

		const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
		messageContainer.appendChild(botMessageDiv);

		return;
	}

	// Check if the user has specified a prompt after the "/prompt" command
	if (input.startsWith('/prompt')) {
		let inputValue = input.split(' ').slice(1).join(' ').trim();

		// Remove quotation marks if present
		if ((inputValue.startsWith('"') && inputValue.endsWith('"')) || (inputValue.startsWith("'") && inputValue.endsWith("'"))) {
			inputValue = inputValue.substring(1, inputValue.length - 1);
		}

		// Set to default or empty if the input is 'clear' or 'c'
		if (inputValue === 'clear' || inputValue === 'c') {
			settings.prompts.prompt = ''; // Set to default or empty
			const commandBotMessage = 'Prompt cleared.';
			const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
			messageContainer.appendChild(botMessageDiv);

			await plugin.saveSettings();
			return settings;
		}

		const promptAliases: {[key: string]: string} = {};

		// Create aliases for each file (prompt)
		for (let i = 1; i <= files.length; i++) {
			const fileNameWithoutExtension = files[i - 1].name.replace(/\.[^/.]+$/, '');
			promptAliases[i.toString()] = fileNameWithoutExtension;
		}

		let currentModel;
		if (promptAliases[inputValue]) {
			// If input matches a key in promptAliases
			settings.prompts.prompt = `${promptAliases[inputValue]}.md`;
			currentModel = settings.prompts.prompt.replace(/\.[^/.]+$/, ''); // Removing the file extension
			const commandBotMessage = `<b>Updated Prompt to</b> '${currentModel}'`;
			const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
			messageContainer.appendChild(botMessageDiv);
		} else if (
			Object.values(promptAliases)
				.map(v => v.toLowerCase())
				.includes(inputValue.toLowerCase())
		) {
			// If input matches a value in profileAliases (case-insensitive)
			const matchedProfile = Object.entries(promptAliases).find(([key, value]) => value.toLowerCase() === inputValue.toLowerCase());
			if (matchedProfile) {
				settings.prompts.prompt = `${matchedProfile[1]}.md`;
				currentModel = settings.prompts.prompt.replace(/\.[^/.]+$/, ''); // Removing the file extension
				const commandBotMessage = `<b>Updated Prompt to</b> '${currentModel}'`;
				const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
				messageContainer.appendChild(botMessageDiv);
			}
		} else {
			// If the input prompt does not exist
			const commandBotMessage = `Prompt '${inputValue}' does not exist.`;
			const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
			messageContainer.appendChild(botMessageDiv);
			new Notice('Invalid prompt.');
		}

		await plugin.saveSettings();
		return settings;
	}
}

// `/ref` to turn on/off referenceCurrentNote.
export async function commandReference(input: string, settings: MAXSettings, plugin: MAXGPT) {
	let commandBotMessage = '';
	const referenceCurrentNoteElement = document.getElementById('referenceCurrentNote');
	const inputValue = input.split(' ')[1]?.toLowerCase();

	if (inputValue === 'true' || inputValue === 'on') {
		settings.general.allowReferenceCurrentNote = true;
		if (referenceCurrentNoteElement) {
			referenceCurrentNoteElement.style.display = 'block';
		}
		commandBotMessage += '<p><strong>Reference updated: on</strong></p>';
	} else if (inputValue === 'false' || inputValue === 'off') {
		settings.general.allowReferenceCurrentNote = false;
		if (referenceCurrentNoteElement) {
			referenceCurrentNoteElement.style.display = 'none';
		}
		commandBotMessage += '<p><strong>Reference updated: off</strong></p>';
	} else {
		commandBotMessage += '<p><strong>Type `/ref on` or `/ref off` to turn on/off reference current note.</strong></p>';
	}

	const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;
	const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
	messageContainer.appendChild(botMessageDiv);

	await plugin.saveSettings();
}

// `/temp "VALUE"` to change the temperature.
export async function commandTemperature(input: string, settings: MAXSettings, plugin: MAXGPT) {
	const inputValue = input.split(' ')[1];
	const floatValue = parseFloat(inputValue);
	let temperatureSettingMessage: string;

	if (settings && !isNaN(floatValue)) {
		if (floatValue < 0.0) {
			settings.general.temperature = '0.00';
		} else if (floatValue > 2.0) {
			settings.general.temperature = '2.00';
		} else {
			settings.general.temperature = floatValue.toFixed(2);
		}
		temperatureSettingMessage = `Temperature updated: ${settings.general.temperature}`;
	} else {
		temperatureSettingMessage = `Current temperature: ${settings.general.temperature}`;
	}

	const commandBotMessage = `<p><strong>${temperatureSettingMessage}</strong></p>`;

	const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;
	const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
	messageContainer.appendChild(botMessageDiv);

	await plugin.saveSettings();
}

// `/maxtokens` to change max_tokens.
export async function commandMaxTokens(input: string, settings: MAXSettings, plugin: MAXGPT) {
	let commandBotMessage = '';
	const commandParts = input.split(' ');
	const commandAction = commandParts[1] ? commandParts[1].toLowerCase() : '';
	let maxTokensSettingMessage: string;

	// Check for clear command first
	if (commandAction === 'c' || commandAction === 'clear') {
		settings.general.max_tokens = '';
		maxTokensSettingMessage = 'Max tokens cleared.';
	} else if (commandAction !== '') {
		const inputValue = parseInt(commandAction);

		if (!isNaN(inputValue) && inputValue >= 0) {
			// Update max_tokens with the valid integer value
			settings.general.max_tokens = inputValue.toString();
			maxTokensSettingMessage = `Max tokens updated: ${inputValue}`;
		} else {
			// Input is not a valid integer or is negative
			maxTokensSettingMessage = 'Max tokens update: invalid';
		}
	} else {
		// No action specified
		if (settings.general.max_tokens === '') {
			maxTokensSettingMessage = 'Current max tokens: Empty';
		} else {
			maxTokensSettingMessage = `Current max tokens: ${settings.general.max_tokens}`;
		}
	}

	commandBotMessage += `<p><strong>${maxTokensSettingMessage}</strong></p>`;
	const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;
	const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
	messageContainer.appendChild(botMessageDiv);

	await plugin.saveSettings();
}

// `/system "[VALUE]"` to change system prompt
// export async function commandSystem(input: string, settings: MAXSettings, plugin: MAXGPT) {
//   let commandBotMessage = '';
//   const commandParts = input.split(' ');
//   const commandAction = commandParts[1] ? commandParts[1].toLowerCase() : '';
//   let systemSettingMessage: string;

//   // Check for clear command first
//   if (commandAction === 'c' || commandAction === 'clear') {
//     settings.general.system_role = '';
//     systemSettingMessage = 'System cleared.';
//   } else if (commandAction !== '') {
//     const systemPromptValue = input.match(/['"]([^'"]+)['"]/) || [null, commandAction];

//     if (systemPromptValue[1] !== null) {
//       // Update system_role with the provided value
//       settings.general.system_role = systemPromptValue[1];
//       systemSettingMessage = `System updated: "${systemPromptValue[1]}"`;
//     } else {
//       // Handle case where no valid system value is provided
//       systemSettingMessage = `Current system: "${settings.general.system_role}"`;
//     }
//   } else {
//     // No action specified
//     systemSettingMessage = `Current system: "${settings.general.system_role}"`;
//   }

//   commandBotMessage += `<p><strong>${systemSettingMessage}</strong></p>`;
//   const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;
//   const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
//   messageContainer.appendChild(botMessageDiv);

//   await plugin.saveSettings();
// }

// `/append` to append current chat history to current active note.
export async function commandAppend(plugin: MAXGPT, settings: MAXSettings) {
	let markdownContent = '';

	const activeFile = plugin.app.workspace.getActiveFile();

	if (activeFile?.extension === 'md') {
		const existingContent = await plugin.app.vault.read(activeFile);

		// Retrieve user and chatbot names
		const userNames = document.querySelectorAll('.userName') as NodeListOf<HTMLHeadingElement>;

		let userNameText = 'USER';
		if (userNames.length > 0) {
			const userNameNode = userNames[0];
			Array.from(userNameNode.childNodes).forEach(node => {
				// Check if the node is a text node and its textContent is not null
				if (node.nodeType === Node.TEXT_NODE && node.textContent) {
					userNameText = node.textContent.trim().toUpperCase();
				}
			});
		}

		const chatbotNames = document.querySelectorAll('.chatbotName') as NodeListOf<HTMLHeadingElement>;
		const chatbotNameText = chatbotNames.length > 0 && chatbotNames[0].textContent ? chatbotNames[0].textContent.toUpperCase() : 'ASSISTANT';

		// Check and read the JSON file
		if (await this.app.vault.adapter.exists(filenameMessageHistoryJSON(plugin))) {
			try {
				const jsonContent = await this.app.vault.adapter.read(filenameMessageHistoryJSON(plugin));
				const messages = JSON.parse(jsonContent);

				// Filter out messages starting with '/', and the assistant's response immediately following it
				let skipNext = false;
				markdownContent += messages
					.filter((messageHistory: {role: string; content: string}, index: number, array: {role: string; content: string}[]) => {
						if (skipNext && messageHistory.role === 'assistant') {
							skipNext = false;
							return false;
						}
						if (messageHistory.content.startsWith('/') || messageHistory.content.includes('errorBotMessage')) {
							// Check if next message is also from user and starts with '/' or if current assistant message contains "displayErrorBotMessage"
							skipNext = (index + 1 < array.length && array[index + 1].role === 'assistant') || messageHistory.role === 'assistant';
							return false;
						}
						return true;
					})
					.map((message: {role: string; content: string}) => {
						let roleText = message.role.toUpperCase();
						roleText = roleText === 'USER' ? userNameText : roleText;
						roleText = roleText === 'ASSISTANT' ? chatbotNameText : roleText;
						return `###### ${roleText}\n${message.content}\n`;
					})
					.join('\n');

				const commandBotMessage = '<p><strong>Message history appended.</strong></p>';

				const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;
				const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
				messageContainer.appendChild(botMessageDiv);
			} catch (error) {
				const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;
				const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, error);
				messageContainer.appendChild(botMessageDiv);
				console.error('Error processing message history:', error);
			}
		}

		const updatedContent = `${existingContent}\n${markdownContent}`;

		// Save the updated content back to the active file
		await plugin.app.vault.modify(activeFile, updatedContent);
		new Notice('Appended conversation.');
	} else {
		new Notice('No active Markdown file detected.');
	}
}

// `/save` to save current chat history to a note.
export async function commandSave(plugin: MAXGPT, settings: MAXSettings) {
	let folderName = settings.chatHistory.chatHistoryPath;
	// Check if the folder exists, create it if not
	if (!(await plugin.app.vault.adapter.exists(folderName))) {
		await plugin.app.vault.createFolder(folderName);
	}
	const baseFileName = 'Chat History';
	const fileExtension = '.md';

	if (folderName && !folderName.endsWith('/')) {
		folderName += '/';
	}

	// Create a datetime string to append to the file name
	const now = new Date();
	const dateTimeStamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
		.getHours()
		.toString()
		.padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

	try {
		let markdownContent = '';
		const allFiles = plugin.app.vault.getFiles(); // Retrieve all files from the vault

		// Retrieve model name
		const modelNameElement = document.querySelector('#modelName') as HTMLHeadingElement;
		let modelName = 'Unknown'; // Default model name
		if (modelNameElement?.textContent) {
			modelName = modelNameElement.textContent.replace('Model: ', '').toLowerCase();
		}

		const templateFile = allFiles.find(file => file.path.toLowerCase() === settings.chatHistory.templateFilePath.toLowerCase());

		if (templateFile) {
			let fileContent = await plugin.app.vault.read(templateFile);

			// Check if the file content has YAML front matter
			if (/^---\s*[\s\S]*?---/.test(fileContent)) {
				// Insert model name into existing front matter
				fileContent = fileContent.replace(/^---/, `---\nmodel: ${modelName}`);
			} else {
				// Prepend new front matter
				fileContent =
					`---
  model: ${modelName}
---\n` + fileContent;
			}
			markdownContent += fileContent;
		} else {
			// YAML front matter
			markdownContent += `---
  model: ${modelName}
---\n`;
		}

		// Retrieve user and chatbot names
		const userNames = document.querySelectorAll('.userName') as NodeListOf<HTMLHeadingElement>;

		let userNameText = 'USER';
		if (userNames.length > 0) {
			const userNameNode = userNames[0];
			Array.from(userNameNode.childNodes).forEach(node => {
				// Check if the node is a text node and its textContent is not null
				if (node.nodeType === Node.TEXT_NODE && node.textContent) {
					userNameText = node.textContent.trim().toUpperCase();
				}
			});
		}

		const chatbotNames = document.querySelectorAll('.chatbotName') as NodeListOf<HTMLHeadingElement>;
		const chatbotNameText = chatbotNames.length > 0 && chatbotNames[0].textContent ? chatbotNames[0].textContent.toUpperCase() : 'ASSISTANT';

		// Check and read the JSON file
		if (await plugin.app.vault.adapter.exists(filenameMessageHistoryJSON(plugin))) {
			try {
				const jsonContent = await plugin.app.vault.adapter.read(filenameMessageHistoryJSON(plugin));
				const messages = JSON.parse(jsonContent);

				// Filter out messages starting with '/', and the assistant's response immediately following it
				let skipNext = false;
				markdownContent += messages
					.filter((messageHistory: {role: string; content: string}, index: number, array: {role: string; content: string}[]) => {
						if (skipNext && messageHistory.role === 'assistant') {
							skipNext = false;
							return false;
						}
						if (messageHistory.content.startsWith('/') || messageHistory.content.includes('errorBotMessage')) {
							// Check if next message is also from user and starts with '/' or if current assistant message contains "displayErrorBotMessage"
							skipNext = (index + 1 < array.length && array[index + 1].role === 'assistant') || messageHistory.role === 'assistant';
							return false;
						}
						return true;
					})
					.map((message: {role: string; content: string}) => {
						let roleText = message.role.toUpperCase();
						roleText = roleText === 'USER' ? userNameText : roleText;
						roleText = roleText === 'ASSISTANT' ? chatbotNameText : roleText;
						return `###### ${roleText}\n${message.content}\n`;
					})
					.join('\n');

				const commandBotMessage = '<p><strong>Message history saved.</strong></p>';

				const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;
				const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, commandBotMessage);
				messageContainer.appendChild(botMessageDiv);
			} catch (error) {
				const messageContainer = document.querySelector('#messageContainer') as HTMLDivElement;
				const botMessageDiv = displayCommandBotMessage(plugin, settings, messageHistory, error);
				messageContainer.appendChild(botMessageDiv);
				console.error('Error processing message history:', error);
			}
		}

		let fileName = '';

		if (settings.chatHistory.allowRenameNoteTitle) {
			let uniqueNameFound = false;
			let modelRenameTitle;

			// Function to check if a file name already exists
			const fileNameExists = (name: string | null) => {
				return allFiles.some(file => file.path === folderName + name + fileExtension);
			};

			while (!uniqueNameFound) {
				modelRenameTitle = await fetchModelRenameTitle(settings, markdownContent);

				if (!fileNameExists(modelRenameTitle)) {
					uniqueNameFound = true;
				}
			}

			fileName = folderName + modelRenameTitle + fileExtension;
		} else {
			fileName = `${folderName + baseFileName} ${dateTimeStamp}${fileExtension}`;
		}

		// Create the new note with formatted Markdown content
		const file = await plugin.app.vault.create(fileName, markdownContent);
		if (file) {
			new Notice('Saved conversation.');

			// Open the newly created note in a new pane
			plugin.app.workspace.openLinkText(fileName, '', true, {active: true});
		}
	} catch (error) {
		console.error('Failed to create note:', error);
	}
}

// `/stop` to stop fetching response
export function commandStop() {
	const controller = getAbortController();
	if (controller) {
		controller.abort();
	}
}

export async function removeMessageThread(plugin: MAXGPT, index: number) {
	const messageContainer = document.querySelector('#messageContainer');

	const divElements = messageContainer?.querySelectorAll('div.botMessage, div.userMessage');

	if (divElements && divElements.length > 0 && index >= 0 && index < divElements.length) {
		for (let i = index; i < divElements.length; i++) {
			messageContainer?.removeChild(divElements[i]);
		}
	}

	messageHistory.splice(index);
	const jsonString = JSON.stringify(messageHistory, null, 4);

	try {
		await plugin.app.vault.adapter.write(filenameMessageHistoryJSON(plugin), jsonString);
	} catch (error) {
		console.error('Error writing messageHistory.json', error);
	}
}
