import {Setting, SettingTab, setIcon} from 'obsidian';
import MAXPlugin from '@/main';
import {addDescriptionLink} from '@/utils/DescriptionLink';
import {DEFAULT_SETTINGS} from '@/constants';

export async function addEditorSettings(containerEl: HTMLElement, plugin: MAXPlugin, SettingTab: SettingTab) {
	const toggleSettingContainer = containerEl.createDiv({
		cls: 'toggleSettingContainer',
	});
	toggleSettingContainer.createEl('h2', {text: 'Editor'});

	const initialState = plugin.settings!.toggleEditorSettings;
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
			plugin.settings!.toggleEditorSettings = false;
		} else {
			setIcon(chevronIcon, 'chevron-down'); // Open state
			settingsContainer.style.display = 'block';
			plugin.settings!.toggleEditorSettings = true;
		}
		await plugin.saveSettings();
	});

	new Setting(settingsContainer)
		.setName('Prompt Select Generate System')
		.setDesc(
			addDescriptionLink(
				'System role for Prompt Select Generate.',
				'https://github.com/longy2k/obsidian-max-chatbot/wiki/Prompt---Select---Generate-Command',
				'',
				'[Instructions]'
			)
		)
		.addTextArea(text =>
			text
				.setPlaceholder('You are a helpful assistant.')
				.setValue(
					plugin.settings!.editor.prompt_select_generate_system_role !== undefined
						? plugin.settings!.editor.prompt_select_generate_system_role
						: DEFAULT_SETTINGS.editor.prompt_select_generate_system_role
				)
				.onChange(async value => {
					plugin.settings!.editor.prompt_select_generate_system_role =
						value !== undefined ? value : DEFAULT_SETTINGS.editor.prompt_select_generate_system_role;
					await plugin.saveSettings();
				})
		);
}
