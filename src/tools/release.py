#!/usr/bin/env python3
"""Writes the launcher's release feed into the site (V282).

    python3 tools/release.py <site dir> <version, e.g. V282>

<site>/launcher/version.json — what the launchers and the installed web app read to see whether there's an update:
  { "version": "V282", "build": 282, "date": "...", "notes": [...], "files": [{"path","size","sha256"}], "total": bytes }
Only the files a launcher needs to run the game are listed (the page, three.js, the icons and manifest, models, music);
a launcher downloads just the ones whose sha256 changed. Patch notes and news are copied from launcher/feed/ (notes.json:
the plain-words notes per version, newest first; news.json: the banner and links)."""
import sys, os, json, hashlib, shutil, datetime

site, ver = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
feed = os.path.join(here, '..', 'launcher', 'feed')
out = os.path.join(site, 'launcher'); os.makedirs(out, exist_ok=True)

def want(rel):
    if rel in ('index.html', 'three.min.js', 'manifest.webmanifest'): return True
    if '/' not in rel and rel.endswith('.png'): return True
    return rel.startswith('models/') or rel.startswith('music/') or (rel.startswith('games/') and not rel.endswith('.md'))

files, total = [], 0
for root, dirs, names in os.walk(site):
    dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ('src', 'launcher')]
    for n in names:
        full = os.path.join(root, n); rel = os.path.relpath(full, site).replace(os.sep, '/')
        if not want(rel): continue
        h = hashlib.sha256()
        with open(full, 'rb') as f:
            for chunk in iter(lambda: f.read(1 << 20), b''): h.update(chunk)
        size = os.path.getsize(full); total += size
        files.append({'path': rel, 'size': size, 'sha256': h.hexdigest()})
files.sort(key=lambda f: f['path'])

notes = json.load(open(os.path.join(feed, 'notes.json')))
cur = next((n for n in notes if n['v'] == ver), None)
build = int(''.join(c for c in ver if c.isdigit()) or 0)
doc = {'version': ver, 'build': build, 'date': datetime.date.today().isoformat(),
       'title': cur['title'] if cur else ver, 'notes': cur['notes'] if cur else [],
       'files': files, 'total': total}
json.dump(doc, open(os.path.join(out, 'version.json'), 'w'), separators=(',', ':'))
shutil.copy(os.path.join(feed, 'notes.json'), os.path.join(out, 'notes.json'))
shutil.copy(os.path.join(feed, 'news.json'), os.path.join(out, 'news.json'))
print(f'{ver}: {len(files)} files, {total/1e6:.1f} MB')
