#!/usr/bin/env python3
"""Runs on a GitHub Actions runner. Downloads every URL in
fetch-manifest.json to fetched/<out> and writes fetched/_report.json.

Manifest format: [{"url": "...", "out": "relative/path.ext"}, ...]
Existing fetched/<out> files are skipped, so rounds are incremental.
"""
import json, os, time, sys
import requests

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36')
HEADERS = {'User-Agent': UA, 'Accept': '*/*', 'Accept-Language': 'en-US,en;q=0.9'}
MAX_BYTES = 40 * 1024 * 1024

def main():
    jobs = json.load(open('fetch-manifest.json'))
    os.makedirs('fetched', exist_ok=True)
    report = []
    last_host_hit = {}
    sess = requests.Session()
    sess.headers.update(HEADERS)
    for job in jobs:
        url, out = job['url'], job['out']
        dest = os.path.join('fetched', out)
        if os.path.exists(dest):
            report.append({'out': out, 'url': url, 'status': 'skipped-exists'})
            continue
        host = url.split('/')[2]
        gap = 6.0 if 'wikimedia' in host or 'wikipedia' in host else 0.6
        wait = last_host_hit.get(host, 0) + gap - time.time()
        if wait > 0:
            time.sleep(wait)
        rec = {'out': out, 'url': url}
        try:
            hdrs = {}
            if 'wikimedia' in host:  # WMF API policy wants a descriptive UA
                hdrs['User-Agent'] = 'camera-size-comparison-asset-fetch/1.0 (github.com/Nikparra/Claude_projects)'
            r = sess.get(url, timeout=45, allow_redirects=True, headers=hdrs)
            last_host_hit[host] = time.time()
            rec['http'] = r.status_code
            rec['final_url'] = r.url
            rec['content_type'] = r.headers.get('content-type', '')
            if r.ok and len(r.content) <= MAX_BYTES:
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                with open(dest, 'wb') as f:
                    f.write(r.content)
                rec['bytes'] = len(r.content)
                rec['status'] = 'ok'
            else:
                rec['status'] = 'http-error' if not r.ok else 'too-large'
        except Exception as e:
            rec['status'] = 'exception'
            rec['error'] = f'{type(e).__name__}: {e}'
        report.append(rec)
        print(rec, flush=True)
    with open('fetched/_report.json', 'w') as f:
        json.dump(report, f, indent=1)
    ok = sum(1 for r in report if r['status'] == 'ok')
    print(f'{ok}/{len(jobs)} fetched ok', file=sys.stderr)

if __name__ == '__main__':
    main()
