import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Converts the supplied design prototype to deployable static site source.
// The prototype is input data: placeholder downloads and its replacement
// drawing of the app logo are deliberately not published.
const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/import-reference.mjs <design.html>');
const source = readFileSync(resolve(input), 'utf8');
const root = resolve('source');
const css = source.match(/<style>([\s\S]*?)<\/style>/)?.[1];
const scripts = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const behavior = scripts.at(-1)?.[1];
if (!css || !behavior || !behavior.includes('triggerDownload')) {
  throw new Error('Unrecognized design prototype');
}

let html = source
  .replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, '')
  .replace(/<script>\s*tailwind\.config\s*=[\s\S]*?<\/script>/, '')
  .replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="/styles.css">')
  .replace(/<script>[\s\S]*?function handleHeroParallax\(e\)[\s\S]*?<\/script>/, '<script src="/site.js" defer></script>');
if (html.includes('cdn.tailwindcss.com') || html.includes('new Blob([')) {
  throw new Error('Prototype scripts remained in generated HTML');
}

html = html.replace(/<title>[^<]*<\/title>/, '<title>FlickDock — 一甩即存，跨端随行</title>\n  <meta name="description" content="FlickDock 是 Windows 和 macOS 文件搁架，支持拖入文件、图片与文字、云同步和局域网互传。">\n  <link rel="icon" type="image/svg+xml" href="/assets/flickdock.svg">');

// Keep the original app mark, not the hand-drawn mark in the concept HTML.
html = html.replace(
  /<div class="w-8 h-8 rounded-xl bg-gradient-to-br from-hig-blue to-hig-steel[\s\S]*?<\/div>(\s*<span class="font-bold text-\[15px\] tracking-tight text-white">FlickDock<\/span>)/,
  '<img src="/assets/flickdock.svg" alt="" width="32" height="32" class="w-8 h-8 shrink-0">$1',
);

const win = 'https://gitee.com/rooogerluo/flick-dock-windows-releases/releases/download/v1.8.14/FlickDock-Setup-1.8.14.exe';
const arm = 'https://gitee.com/rooogerluo/flick-dock-macos-releases-3/releases/download/v1.8.14/FlickDock-1.8.14-macOS-arm64.dmg';
const intel = 'https://gitee.com/rooogerluo/flick-dock-macos-releases-3/releases/download/v1.8.14/FlickDock-1.8.14-macOS-x86_64.dmg';

// Preserve the reference buttons. macOS leads to the explicit chip choices.
html = html.replaceAll("onclick=\"triggerDownload('Windows')\"", `onclick="triggerDownload('Windows')"`);
html = html.replaceAll("onclick=\"triggerDownload('macOS')\"", `onclick="triggerDownload('macOS')"`);
const tray = `
        <div class="flex flex-wrap justify-center gap-2.5 pt-2" aria-label="选择安装包">
          <a class="btn-press px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs text-zinc-200 transition" href="${win}" data-installer="windows">Windows x64 · 1.8.14 ↗</a>
          <a class="btn-press px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs text-zinc-200 transition" href="${arm}" data-installer="mac-arm">Mac Apple 芯片 · 1.8.14 ↗</a>
          <a class="btn-press px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs text-zinc-200 transition" href="${intel}" data-installer="mac-intel">Mac Intel · 1.8.14 ↗</a>
        </div>`;
html = html.replace(/(<p class="text-xs text-zinc-500">支持 Windows 10 \/ 11)/,
                    `${tray}\n        $1`);
html = html.replace('macOS 13.0+', 'macOS 14.4+');
html = html.replace('Windows 10 / 11 (64-bit)', 'Windows 10 (1809+) / Windows 11 x64');

// Retiehe forbids inline event handlers. Keep the supplied elements and behavior,
// and connect their original functions from the external script instead.
const actions = new Map([
  ["setTheme('dark')", 'theme-dark'],
  ["setTheme('light')", 'theme-light'],
  ["triggerDownload('Windows')", 'download-windows'],
  ["triggerDownload('macOS')", 'download-macos'],
  ['switchScene(0)', 'scene-0'],
  ['switchScene(1)', 'scene-1'],
  ['switchScene(2)', 'scene-2'],
]);
html = html.replace(/onclick="([^"]+)"/g, (_match, expression) => {
  const action = actions.get(expression);
  if (!action) throw new Error(`Unrecognized inline action: ${expression}`);
  return `data-ui-action="${action}"`;
});
html = html.replace('onmousemove="handleHeroParallax(event)"', 'data-parallax="hero"')
  .replace(/\s*onmouseleave="resetHeroParallax\(\)"/, '');

let js = behavior;
js = js.replace(/function triggerDownload\(osName\) \{[\s\S]*?\n    \}/, `function triggerDownload(osName) {
      if (osName === 'Windows') {
        const link = document.querySelector('[data-installer="windows"]');
        showToast('正在打开 Windows 安装包下载');
        window.location.assign(link.href);
      } else {
        document.getElementById('download').scrollIntoView({ behavior: 'smooth' });
        showToast('请选择 Apple 芯片或 Intel 安装包');
      }
    }`);
if (js.includes('FlickDock Installer') || js.includes('new Blob([')) {
  throw new Error('Placeholder download code remained');
}
js += `\nconst actions = {\n  'theme-dark': () => setTheme('dark'),\n  'theme-light': () => setTheme('light'),\n  'download-windows': () => triggerDownload('Windows'),\n  'download-macos': () => triggerDownload('macOS'),\n  'scene-0': () => switchScene(0),\n  'scene-1': () => switchScene(1),\n  'scene-2': () => switchScene(2),\n};\ndocument.querySelectorAll('[data-ui-action]').forEach(element => {\n  element.addEventListener('click', actions[element.dataset.uiAction]);\n});\nconst parallax = document.querySelector('[data-parallax="hero"]');\nparallax.addEventListener('mousemove', handleHeroParallax);\nparallax.addEventListener('mouseleave', resetHeroParallax);\n`;
const tidy = text => `${text.replace(/[ \t]+$/gm, '').trimEnd()}\n`;
writeFileSync(join(root, 'public', 'index.html'), tidy(html), 'utf8');
writeFileSync(join(root, 'public', 'site.js'), tidy(js), 'utf8');
writeFileSync(join(root, 'tailwind.input.css'), tidy(`@tailwind base;\n@tailwind components;\n@tailwind utilities;\n${css}\n`), 'utf8');
console.log('Imported reference layout, preserved original logo and real download links.');
