import {Setting, SettingTab, TFile, TFolder, setIcon} from 'obsidian';
import MAXPlugin from '@/main';
import {DEFAULT_SETTINGS} from '@/constants';

// Prompt Settings
export function addPromptSettings(containerEl: HTMLElement, plugin: MAXPlugin, SettingTab: SettingTab) {
	const toggleSettingContainer = containerEl.createDiv({
		cls: 'toggleSettingContainer',
	});
	toggleSettingContainer.createEl('h2', {text: 'Prompts'});

	const initialState = plugin.settings!.togglePromptSettings;
	const chevronIcon = toggleSettingContainer.createEl('span', {
		cls: 'chevron-icon',
	});
	setIcon(chevronIcon, initialState ? 'chevron-down' : 'chevron-right');

	// Create the settings container to be toggled
	const settingsContainer = containerEl.createDiv({cls: 'settingsContainer'});
	settingsContainer.style.display = initialState ? 'block' : 'none';

	// Toggle visibility
	toggleSettingContainer.addEventListener('click', async () => {
		const isOpen = settingsContainer.style.display !== 'none';
		if (isOpen) {
			setIcon(chevronIcon, 'chevron-right'); // Close state
			settingsContainer.style.display = 'none';
			plugin.settings!.togglePromptSettings = false;
		} else {
			setIcon(chevronIcon, 'chevron-down'); // Open state
			settingsContainer.style.display = 'block';
			plugin.settings!.togglePromptSettings = true;
		}
		await plugin.saveSettings();
	});

	new Setting(settingsContainer)
		.setName('Prompt')
		.setDesc('Select a prompt to provide additional context to the system role.')
		.addDropdown(dropdown => {
			dropdown.addOption('', '--EMPTY--');

			if (plugin.settings!.prompts.promptFolderPath !== '') {
				// Fetching files from the specified folder
				const files = plugin.app.vault.getFiles().filter(file => file.path.startsWith(plugin.settings!.prompts.promptFolderPath));

				// Sorting the files array alphabetically by file name
				files.sort((a, b) => a.name.localeCompare(b.name));

				files.forEach(file => {
					if (file instanceof TFile) {
						const fileName = file.basename;

						// Adding the file name as a dropdown option
						dropdown.addOption(file.name, fileName);
					}
				});
			}

			// Set the default option to the empty one
			dropdown.setValue('');

			dropdown.setValue(plugin.settings!.prompts.prompt || DEFAULT_SETTINGS.prompts.prompt).onChange(async value => {
				plugin.settings!.prompts.prompt = value ? value : DEFAULT_SETTINGS.prompts.prompt;
				await plugin.saveSettings();
			});
		});

	new Setting(settingsContainer)
		.setName('Prompt Folder Path')
		.setDesc('Select a prompt from a specified folder.')
		.addText(text =>
			text
				.setPlaceholder('MAX/Prompts')
				.setValue(plugin.settings!.prompts.promptFolderPath || DEFAULT_SETTINGS.prompts.promptFolderPath)
				.onChange(async value => {
					plugin.settings!.prompts.promptFolderPath = value ? value : DEFAULT_SETTINGS.prompts.promptFolderPath;
					if (value) {
						let folderPath = plugin.settings!.prompts.promptFolderPath.trim() || DEFAULT_SETTINGS.prompts.promptFolderPath;

						// Remove trailing '/' if it exists
						while (folderPath.endsWith('/')) {
							folderPath = folderPath.substring(0, folderPath.length - 1);
							plugin.settings!.prompts.promptFolderPath = folderPath;
						}

						const folder = plugin.app.vault.getAbstractFileByPath(folderPath);

						if (folder && folder instanceof TFolder) {
							text.inputEl.style.borderColor = '';
						} else {
							text.inputEl.style.borderColor = 'red';
						}
					}
					await plugin.saveSettings();
				})
				.inputEl.addEventListener('focusout', async () => {
					SettingTab.display();
				})
		);
}
