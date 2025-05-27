import wcLogger from './log.js';
import {fetchUrl} from './proxy.js';

const WEBVIEW_STYLE = `"width: 600px; height: 338px; border: 1px solid #ccc; background: white; overflow: auto;"`;
const WEBVIEW_CODE = `<iframe 
    class="wcanvas webview-@wc_count"
    style=${WEBVIEW_STYLE}
    srcdoc='@wc_content'
    sandbox="allow-same-origin allow-scripts allow-forms">
</iframe>\n`;

let INJECTED_VIEWS_COUNT = 0;

class wCanvas {
    async inject(content, debug = false) {
        console.log();
        console.log('--- wCanvas Debug Mode ---');
        wcLogger.info('++ Starting wCanvas...', "main", debug);
        wcLogger.info('Parsing HTML...', "main", debug);

        const lines = content.split('\n');
        let injectedContent = '';

        for(let rawLine of lines) {
            const line = rawLine.trim();

            if(!line.startsWith('<!-- @wCanvas')) {
                injectedContent += rawLine + '\n';
                continue;
            }

            wcLogger.info('Found command...', "main", debug);

            const cleanCommand = line
                .replace('<!-- @wCanvas [', '')
                .replace('] -->', '')
                .trim();

            const command = cleanCommand.split(' ');
            const commandName = command[0];
            const commandArgs = command.slice(1);

            switch(commandName) {
                case 'inject': {
                    if(commandArgs[0] !== 'url' || commandArgs.length < 2) {
                        wcLogger.warn('Missing or invalid "url" argument.');
                        break;
                    }

                    const url = commandArgs[1];
                    wcLogger.info('Injecting wCanvas...', "main", debug);
                    injectedContent += `<!-- Webview injected by wCanvas -->\n`;
                    injectedContent += WEBVIEW_CODE
                        .replace('@wc_count', INJECTED_VIEWS_COUNT)
                        .replace('@wc_content', await fetchUrl(url, debug));

                    INJECTED_VIEWS_COUNT += 1;
                    wcLogger.info('wCanvas injected!', "main", debug);

                    break;
                }

                default: {
                    wcLogger.warn(`Unknown command: ${commandName}`);
                    break;
                }
            }
        }

        return injectedContent;
    }
}

export default new wCanvas();
