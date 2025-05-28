import wcLogger from './log.js';
import { fetchUrl } from './proxy.js';

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
        wcLogger.info('++ Starting wCanvas...', "main", debug);
        wcLogger.info('Parsing HTML...', "main", debug);

        const tagRegex = /<wCanvas\s+([^>]*?)\/>/gs;
        let result = content;
        let match;

        while ((match = tagRegex.exec(content)) !== null) {
            const fullMatch = match[0];
            const attrString = match[1];

            const attrs = this.parseAttributes(attrString);

            if (!attrs.url) {
                wcLogger.warn('Missing "url" attribute in <wCanvas /> tag.');
                continue;
            }

            wcLogger.info(`Injecting wCanvas from ${attrs.url}`, "main", debug);

            try {
                const html = await fetchUrl(attrs.url, debug);
                const injected = WEBVIEW_CODE
                    .replace('@wc_count', INJECTED_VIEWS_COUNT)
                    .replace('@wc_content', html.replace(/'/g, "\\'"));

                result = result.replace(fullMatch, `<!-- Webview injected by wCanvas -->\n${injected}`);
                INJECTED_VIEWS_COUNT++;
            } catch (err) {
                wcLogger.warn(`Failed to fetch URL: ${attrs.url}`, "main");
                wcLogger.warn(err.message, "main");
            }
        }

        return result;
    }

    parseAttributes(attrString) {
        const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
        const attrs = {};
        let match;
        while ((match = attrRegex.exec(attrString)) !== null) {
            attrs[match[1]] = match[2];
        }
        return attrs;
    }
}

export default new wCanvas();
