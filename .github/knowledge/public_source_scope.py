"""Enumerate only explicitly selected public HTML files."""
import re


def validate_pages(pages):
    if not isinstance(pages, dict):
        raise ValueError('invalid_public_pages')
    for file, sections in pages.items():
        if not re.fullmatch(r'(?:[a-z0-9-]+/)*[a-z0-9-]+\.html', file):
            raise ValueError('invalid_public_page')
        if not isinstance(sections, list) or any(
            not isinstance(section, str) or not re.fullmatch(r'[a-z][a-z0-9-]*', section)
            for section in sections
        ) or len(sections) != len(set(sections)):
            raise ValueError('invalid_public_sections')
        if not sections and not file.startswith('learn/'):
            raise ValueError('personal_page_sections_required')
    return pages


def no_links(file):
    for entry in [file, *file.parents]:
        if entry.is_symlink() or getattr(entry, 'is_junction', lambda: False)():
            raise ValueError('links_refused')


def source_files(root, directories, pages):
    files = set()
    for directory in directories:
        folder = root / directory
        no_links(folder)
        if not folder.is_dir():
            raise ValueError('scope_missing')
        files.update(folder.rglob('*.html'))
    # An individually selected page may be removed from the site.
    for name in pages:
        file = root / name
        no_links(file)
        if file.exists():
            files.add(file)
    for file in files:
        no_links(file)
        if root not in file.resolve().parents or not file.is_file() or file.stat().st_nlink != 1:
            raise ValueError('source_file_refused')
    return sorted(files)
