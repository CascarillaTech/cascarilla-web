#!/usr/bin/env python3
"""Xera unha versión autocontida (CSS, JS, fontes e imaxes embebidos) dunha
presentación HTML con rutas relativas (p.ex. public/events/one-ai-day/keynote).
Uso: python tools/inline-deck.py <dir-presentación> <saída.html>"""
import base64, mimetypes, os, re, sys

src_dir, out = sys.argv[1], sys.argv[2]
MIME = {'.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml'}

def data_uri(rel):
    p = os.path.join(src_dir, rel)
    if not os.path.isfile(p):
        return None
    ext = os.path.splitext(p)[1].lower()
    mime = MIME.get(ext) or mimetypes.guess_type(p)[0] or 'application/octet-stream'
    return f"data:{mime};base64,{base64.b64encode(open(p, 'rb').read()).decode()}"

ASSET = r'(?:\./)?(?:assets/)[^"\')\s]+'

def inline_assets(text):
    def rep(m):
        uri = data_uri(m.group(0).lstrip('./') if m.group(0).startswith('./') else m.group(0))
        return uri or m.group(0)
    return re.sub(ASSET, rep, text)

html = open(os.path.join(src_dir, 'index.html'), encoding='utf-8').read()
def css_rep(m):
    css = open(os.path.join(src_dir, m.group(1)), encoding='utf-8').read()
    return '<style>' + inline_assets(css) + '</style>'
html = re.sub(r'<link[^>]*rel="stylesheet"[^>]*href="([^"/:][^"]*\.css)"[^>]*>', css_rep, html)
def js_rep(m):
    js = open(os.path.join(src_dir, m.group(1)), encoding='utf-8').read()
    return '<script>' + inline_assets(js).replace('</script', r'<\/script') + '</script>'
html = re.sub(r'<script[^>]*src="([^"/:][^"]*\.js)"[^>]*></script>', js_rep, html)
html = inline_assets(html)
open(out, 'w', encoding='utf-8', newline='').write(html)
left = re.findall(ASSET, html)
print(f'{out}: {os.path.getsize(out)//1024} KB; rutas sen embeber: {len(left)}')
