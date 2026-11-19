"""Build and verify an index in a temporary directory after a Pages release."""
import argparse
import json
import re
from pathlib import Path
from tempfile import TemporaryDirectory

from batch_course_ingest import build, sha
from public_http import API, REPO, SITE, WEBSITE_SCOPE, PublicPagesTransport, strict_json, website_page


def deployment_identity(deployment, status):
    identity = deployment['id'], deployment['sha'], status['id']
    if (deployment['environment'] != 'github-pages' or deployment['ref'] != 'main'
            or status['state'] != 'success' or status['environment_url'] != SITE
            or not re.fullmatch('[0-9a-f]{40}', identity[1])
            or any(type(i) is not int or i <= 0 for i in (identity[0], identity[2]))):
        raise ValueError('ineligible_pages_event')
    return identity


def verify_latest(read, expected):
    deployments = strict_json(read(API + '/deployments?environment=github-pages&per_page=1'))
    if not isinstance(deployments, list) or len(deployments) != 1:
        raise ValueError('deployment_missing')
    deployment = deployments[0]
    app = deployment.get('performed_via_github_app') or {}
    if (app.get('id') != 34598 or app.get('slug') != 'github-pages'
            or (app.get('owner') or {}).get('login') != 'github'):
        raise ValueError('unexpected_pages_app')
    if (deployment['id'], deployment['sha']) != expected[:2]:
        raise ValueError('pages_event_superseded')
    statuses = strict_json(read(API + f'/deployments/{expected[0]}/statuses?per_page=1'))
    if (not isinstance(statuses, list) or len(statuses) != 1
            or deployment_identity(deployment, statuses[0]) != expected):
        raise ValueError('pages_event_superseded')


def build_event(event, read):
    if event['repository']['full_name'] != REPO:
        raise ValueError('ineligible_pages_event')
    identity = deployment_identity(event['deployment'], event['deployment_status'])
    verify_latest(read, identity)
    commit = identity[1]
    tree = strict_json(read(API + f'/git/trees/{commit}?recursive=1'))
    if tree.get('truncated') is not False or not isinstance(tree.get('tree'), list):
        raise ValueError('incomplete_tree')
    paths = []
    for entry in tree['tree']:
        if website_page(entry['path']):
            if entry.get('type') != 'blob' or entry.get('mode') not in ('100644', '100755'):
                raise ValueError('unsupported_source')
            paths.append(entry['path'])
    if not paths or len(set(p.casefold() for p in paths)) != len(paths) or 3 * len(paths) + 5 > 210:
        raise ValueError('invalid_inventory')

    with TemporaryDirectory() as temporary:
        source = Path(temporary) / 'source'
        output = Path(temporary) / 'index'
        # An approved directory can lose its last lesson in a new deployment.
        for directory in WEBSITE_SCOPE['publicLessonDirectories']:
            (source / directory).mkdir(parents=True)
        hashes = {}
        for path in sorted(paths):
            data = read(f'https://raw.githubusercontent.com/{REPO}/{commit}/{path}')
            if read(SITE + path) != data:
                raise ValueError('cdn_mismatch')
            file = source / path
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_bytes(data)
            hashes['/' + path] = sha(data)
        report = build(source, output, allowed=WEBSITE_SCOPE['publicLessonDirectories'],
                       structures=True, public_pages=WEBSITE_SCOPE['publicPages'])
        manifest_bytes = (output / 'manifest.json').read_bytes()
        manifest = strict_json(manifest_bytes)
        index_bytes = (output / 'index.json').read_bytes()
        if (report['failed'] or sha(manifest_bytes) != (output / 'READY').read_text().strip()
                or sha(index_bytes) != manifest['indexSha256']
                or {p['pageUrl']: p['sourceSha256'] for p in manifest['pages']} != hashes
                or any(row['pageUrl'] not in hashes or hashes[row['pageUrl']] != row['sourceSha256']
                       for row in strict_json(index_bytes))):
            raise ValueError('index_verification_failed')
        for path in paths:
            if sha(read(SITE + path)) != hashes['/' + path]:
                raise ValueError('cdn_mismatch')
        verify_latest(read, identity)
        return {'deploymentId': identity[0], 'commit': commit, 'statusId': identity[2],
                'pages': len(paths), 'chunks': report['chunks'], 'indexSha256': sha(index_bytes),
                'manifestSha256': sha(manifest_bytes)}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--event-file', required=True, type=Path)
    args = parser.parse_args()
    transport = PublicPagesTransport(enabled=True, website=True)
    result = build_event(strict_json(args.event_file.read_bytes()), lambda url: transport(url)['body'])
    print(json.dumps(result, sort_keys=True))
