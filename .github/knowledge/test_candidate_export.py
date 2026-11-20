import json
import tempfile
import unittest
from hashlib import sha256
from pathlib import Path

from pages_event_build import API, REPO, SITE, build_event


class CandidateExportTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.destination = Path(self.temp.name) / 'candidate'
        self.lesson = 'learn/algorithms/lessons/example.html'
        self.page = b'<h1>Examples</h1><p>The marker is amber.</p>'
        self.deployment = dict(id=1, sha='a' * 40, environment='github-pages', ref='main',
                               performed_via_github_app=dict(id=34598, slug='github-pages',
                                                             owner=dict(login='github')))
        self.status = dict(id=2, state='success', environment_url=SITE)
        self.event = dict(repository=dict(full_name=REPO), deployment=self.deployment.copy(),
                          deployment_status=self.status.copy())

    def read(self, url):
        commit = self.deployment['sha']
        if url == API + '/deployments?environment=github-pages&per_page=1':
            return json.dumps([self.deployment]).encode()
        if url == API + '/deployments/1/statuses?per_page=1':
            return json.dumps([self.status]).encode()
        if url == API + '/git/trees/' + commit + '?recursive=1':
            tree = [dict(mode='100644', type='blob', path=name)
                    for name in (self.lesson, 'unlisted.html')]
            return json.dumps(dict(truncated=False, tree=tree)).encode()
        if url in (SITE + self.lesson, f'https://raw.githubusercontent.com/{REPO}/{commit}/{self.lesson}'):
            return self.page
        self.fail('unexpected resource requested')

    def test_exports_only_verified_index_with_matching_receipt(self):
        summary = build_event(self.event, self.read, bundle_out=self.destination)
        self.assertEqual({p.name for p in self.destination.iterdir()},
                         {'index.json', 'manifest.json', 'receipt.json', 'READY'})
        self.assertEqual(json.loads((self.destination/'receipt.json').read_bytes()), summary)
        self.assertEqual((summary['deploymentId'], summary['commit'], summary['statusId']),
                         (1, self.deployment['sha'], 2))
        for name, key in [('manifest.json', 'manifestSha256'), ('index.json', 'indexSha256')]:
            self.assertEqual(sha256((self.destination/name).read_bytes()).hexdigest(), summary[key])
        self.assertEqual((self.destination/'READY').read_text().strip(), summary['manifestSha256'])
        index = json.loads((self.destination/'index.json').read_bytes())
        self.assertEqual({row['pageUrl'] for row in index}, {'/' + self.lesson})
        self.assertTrue(any('amber' in row['text'] for row in index))
        self.assertEqual(summary, build_event(self.event, self.read))

    def test_existing_candidate_is_preserved(self):
        build_event(self.event, self.read, bundle_out=self.destination)
        before = {p.name:p.read_bytes() for p in self.destination.iterdir()}
        self.page = self.page.replace(b'amber', b'violet')
        with self.assertRaises(FileExistsError):
            build_event(self.event, self.read, bundle_out=self.destination)
        self.assertEqual(before, {p.name:p.read_bytes() for p in self.destination.iterdir()})

    def test_late_cdn_or_status_change_emits_no_bundle(self):
        for changed in ('cdn', 'status'):
            calls = {}
            def read(url):
                calls[url] = calls.get(url, 0) + 1
                if calls[url] == 2 and changed == 'cdn' and url == SITE + self.lesson:
                    return b'changed'
                if calls[url] == 2 and changed == 'status' and '/statuses?' in url:
                    return json.dumps([{**self.status, 'id':3}]).encode()
                return self.read(url)
            with self.subTest(changed=changed), self.assertRaisesRegex(
                    ValueError, 'cdn_mismatch|pages_event_superseded'):
                build_event(self.event, read, bundle_out=self.destination)
            self.assertFalse(self.destination.exists())
