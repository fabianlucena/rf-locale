import { loadJson } from './load_json.js';
import http from 'http';
import fs from 'fs';
import url from 'url';
import path from 'path';
import open from 'open';

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
let server;

export async function htmlEditTranslationsFile(options) {
  options ??= {};

  server = http.createServer(requestListener(options));
  const hostname = options.hostname ?? 'localhost';
  const port = options.port ?? 3501;

  server.listen(port, hostname, function () {
    const url = `http://${hostname}:${port}/`;
    console.log(`Server running at ${url}`);
    open(url);
  });
}

function requestListener(options) {
  return (req, res) => {
    if (req.method === 'GET') {
      switch (req.url) {
      case '/': return sendIndex(req, res);
      case '/favicon.ico': return sendFavIcon(req, res);
      case '/style.css': return sendStyle(req, res);
      case '/script.js': return sendScript(req, res);
      case '/translations.json': return sendTranslations(req, res, options);
      }
    } else if (req.method === 'POST') {
      switch (req.url) {
      case '/update-translations': return updateTranslationsResponse(req, res, options);
      case '/finish': return finish(req, res);
      }
    } else {
      res.writeHead(405);
      res.end(`Method ${req.method} is not allowed.`);    
    }

    res.writeHead(404);
    res.end(`URL ${req.url} does not exist.`);
  };
}

function sendFavIcon(req, res) {
  sendFile(req, res, 'favicon.ico');
}

function sendIndex(req, res) {
  sendFile(req, res, 'index.html');
}

function sendStyle(req, res) {
  sendFile(req, res, 'style.css');
}

function sendScript(req, res) {
  sendFile(req, res, 'script.js');
}

function sendFile(req, res, fileName) {
  const fullFileName = dirname + './../public_html/' + fileName;

  if (!fs.existsSync(fullFileName)) {
    res.writeHead(404);
    res.end(`File ${fullFileName} does not exist`);
    return;
  }
        
  try {
    const content = fs.readFileSync(fullFileName, 'utf8');

    if (fileName.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    } else if (fileName.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    } else if (fileName.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (fileName.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
        
    res.writeHead(200);
    res.end(content);
  } catch(err) {
    res.writeHead(500);
    res.end(err.error);
    return;
  }
}

function sendTranslations(req, res, options) {
  const content = fs.readFileSync(options.translationsFilename, 'utf8');

  res.setHeader('Content-Type', 'application/json');    
  res.writeHead(200);
  res.end(content);
}

function updateTranslationsResponse(req, res, options) {
  let body = '';

  req.on('data', data => body += data);
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      updateTranslations(data, options);
      res.writeHead(204);
      res.end();
    } catch(err) {
      res.setHeader('Content-Type', 'application/json');    
      res.writeHead(500);
      res.end(err.error);
    }
  });
}

async function updateTranslations(data, options) {
  let translations = await loadJson(options.translationsFilename, { emptyIfNotExists: true });
  if (!translations) {
    throw new Error('No transactions in the file.');
  }

  for (const newTranslation of data) {
    const translation = translations.find(translation => 
      translation
            && translation.source == newTranslation.source
            && translation.isJson == newTranslation.isJson
            && translation.domain == newTranslation.domain
            && translation.context == newTranslation.context
    );

    if (!translation) {
      throw new Error(`Translation not found for source: ${newTranslation.source}, is JSON: ${newTranslation.isJson}, domain: ${newTranslation.domian}, context: ${newTranslation.context}`);
    }

    translation.translation = newTranslation.translation;
    translation.isDraft = newTranslation.isDraft;
  }

  const json = JSON.stringify(translations, null, 4);
  fs.writeFileSync(options.translationsFilename, json);
}

function finish(req, res) {
  res.writeHead(204);
  res.end();
    
  server.close();
}