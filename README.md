# wCanvas

A webview for the web 😎

## Installing
```shell
npm install @thoq/wcanvas
```

## Usage
```js
import express from 'express';
import {wCanvas} from 'wCanvas';

const port = 9595;
const host = "0.0.0.0";
const html = `
<html>
<head>
    <title>wCanvas Demo</title>

    <style>
        body {
            font-family: sans-serif;
            background-color: #101010;
            color: #ffffff;
        }
        
        .wcanvas {
            width: 800px !important;
            height: 600px !important;
        }
    </style>
</head>

<body>
    <h1>Hello, World!</h1>
    
    <!-- vvvvv This tells wCanvas to inject a webview -->
    <!-- @wCanvas [inject url https://www.google.com] -->
</body>
</html>`
let app = express();

app.get('/', async(req, res) => {
    let content = await wCanvas.inject(html, true);
    res.send(content);
});

console.log(`Listening on ${host}:${port}`);
app.listen(port, host);
```
