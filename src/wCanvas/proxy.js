import https from 'https';
import wcLogger from './log.js';

const NAV_INTERCEPTOR_SCRIPT = `
<script>
  document.addEventListener('click', function(event) {
    let el = event.target;
    while(el && el.tagName !== 'A') el = el.parentElement;
    if(el && el.tagName === 'A' && el.href) {
      event.preventDefault();
      window.parent.postMessage({type: 'wcanvas-navigate', url: el.href}, '*');
    }
  });
</script>
`;

export async function fetchUrl(url, debug = false) {
    return new Promise((resolve, reject) => {
        try {
            const targetUrl = new URL(url);

            const options = {
                hostname: targetUrl.hostname,
                path: targetUrl.pathname + targetUrl.search,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                        'Chrome/115.0.0.0 Safari/537.36'
                }
            };

            wcLogger.info(`GET: ${url}`, "proxy", debug);

            https.get(options, (res) => {
                let data = '';

                res.on('data', chunk => {
                    data += chunk;
                });

                wcLogger.info(`Status: ${res.statusCode}`, "proxy", debug);
                wcLogger.info(`Stripping website...`, "proxy");
                res.on('end', () => {
                    try {
                        let cleaned = data.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

                        const baseHref = targetUrl.origin + '/';
                        cleaned = cleaned.replace(
                            /<head([^>]*)>/i,
                            `<head$1><base href="${baseHref}">`
                        );

                        cleaned = cleaned.replace(
                            /<\/body>/i,
                            `${NAV_INTERCEPTOR_SCRIPT}</body>`
                        );

                        wcLogger.info(`Done! Resolving...`, "proxy", debug);
                        resolve(cleaned);
                    } catch (err) {
                        reject(err);
                    }
                });

            }).on('error', (err) => {
                reject(err);
            });

        } catch (err) {
            reject(err);
        }
    });
}
