import wcLogger from './log.js';
import { fetchUrl } from './proxy.js';
import { JSDOM } from 'jsdom';

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

        const dom = new JSDOM(content);
        const document = dom.window.document;
        const nodes = document.querySelectorAll("wCanvas");

        for (const node of nodes) {
            const url = node.getAttribute("url");
            if (!url) {
                wcLogger.warn('Missing "url" attribute in <wCanvas> tag.');
                continue;
            }

            wcLogger.info(`Injecting wCanvas from ${url}`, "main", debug);

            try {
                const html = await fetchUrl(url, debug);
                const injected = WEBVIEW_CODE
                    .replace('@wc_count', INJECTED_VIEWS_COUNT)
                    .replace('@wc_content', html.replace(/'/g, "\\'"));

                const comment = document.createComment("Webview injected by wCanvas");
                const wrapper = document.createElement("div");
                wrapper.innerHTML = injected;

                node.replaceWith(comment, ...wrapper.childNodes);
                INJECTED_VIEWS_COUNT++;
            } catch (err) {
                wcLogger.warn(`Failed to fetch URL: ${url}`, "main");
                wcLogger.warn(err.message, "main");
            }
        }

        return dom.serialize();
    }
}

export default new wCanvas();
