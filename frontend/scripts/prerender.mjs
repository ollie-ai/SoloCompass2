import fs from 'fs/promises';
import path from 'path';

const distPath = path.resolve(process.cwd(), 'dist');
const htmlPath = path.join(distPath, 'index.html');

const routes = [
  { route: '/', title: 'SoloCompass — Your AI Solo Travel Companion', description: 'Plan safer, smarter, and more immersive solo trips with AI-powered itineraries and real-time safety data.' },
  { route: '/features', title: 'Features - SoloCompass', description: 'Discover SoloCompass features by plan, safety tooling, and AI trip planning capabilities.' },
  { route: '/help', title: 'Help Center - SoloCompass', description: 'Find support articles, FAQs, and guidance for getting the most from SoloCompass.' }
];

const baseHtml = await fs.readFile(htmlPath, 'utf8');

for (const { route, title, description } of routes) {
  const routeDir = path.join(distPath, route === '/' ? '' : route.slice(1));
  await fs.mkdir(routeDir, { recursive: true });

  const withMeta = baseHtml
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
    .replace('<div id="root"></div>', `<div id="root"><h1 style="position:absolute;left:-9999px;">${title}</h1></div>`);

  await fs.writeFile(path.join(routeDir, 'index.html'), withMeta, 'utf8');
}

console.log('Prerender complete for', routes.map(r => r.route).join(', '));
