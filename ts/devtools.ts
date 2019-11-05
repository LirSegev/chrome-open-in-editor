let timeoutId: any = undefined;

function onSelectionChanged(
	e: Partial<{
		endColumn: number;
		endLine: number;
		startColumn: number;
		startLine: number;
		url: string;
	}>
) {
	const { url, startLine: line, startColumn: column } = e;
	if (url) {
		const regexResults = url.match('/(?<=//.+/).*/');
		if (regexResults) {
			const filePath = regexResults[0];
			const callOpenFile = () => openFile(filePath, line, column);

			if (line === 0 && column === 0) {
				timeoutId = setTimeout(callOpenFile, 100);
			} else {
				clearTimeout(timeoutId);
				callOpenFile();
			}
		}
	}
}

function openFile(path: string, line?: number, column?: number) {
	console.log({
		path,
		line,
		column,
	});
	deactivate();
}

function deactivate() {
	console.log('deactivate');
	chrome.devtools.panels.sources.onSelectionChanged.removeListener(
		onSelectionChanged as () => void
	);
}

function activate() {
	console.log('activate');
	chrome.devtools.panels.sources.onSelectionChanged.addListener(
		onSelectionChanged as () => void
	);

	setTimeout(deactivate, 1.5 * 1000);
}

chrome.commands.onCommand.addListener(command => {
	switch (command) {
		case 'activate':
			activate();
			break;
	}
});
