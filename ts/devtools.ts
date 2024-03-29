/**
 * Time in seconds for the listener to remain active after calling activate()
 */
const ACTIVE_TIME = 1.5;

/**
 * Default port used to communicate with editor extension
 */
const DEFAULT_PORT = 27182;

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
		const regexResults = url.match('(?<=//.+/).*');
		if (regexResults) {
			const filePath = regexResults[0];
			const callOpenFile = () => openFile(filePath, line, column);

			if (line === 0 && column === 0) {
				timeoutId = setTimeout(callOpenFile, 100);
			} else {
				clearTimeout(timeoutId);
				callOpenFile();
			}

			chrome.devtools.panels.openResource(url, 0, () => {});
		}
	}
}

function openFile(path: string, line?: number, column?: number) {
	const body: any = { path };
	// prettier-ignore
	if(line) {body.line = line;}
	// prettier-ignore
	if(column) {body.column = column;}

	fetch(`http://localhost:${DEFAULT_PORT}`, {
		method: 'POST',
		body: JSON.stringify(body),
	});
	deactivate();
}

function deactivate() {
	// console.log('deactivate');
	chrome.devtools.panels.sources.onSelectionChanged.removeListener(
		onSelectionChanged as () => void
	);
}

function activate() {
	// console.log('activate');
	chrome.devtools.panels.sources.onSelectionChanged.addListener(
		onSelectionChanged as () => void
	);

	setTimeout(deactivate, ACTIVE_TIME * 1000);
}

chrome.commands.onCommand.addListener(command => {
	switch (command) {
		case 'activate':
			activate();
			break;
	}
});
