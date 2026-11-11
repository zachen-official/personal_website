"""Minimal Liquid-ish renderer for a local static preview (no Ruby/Jekyll)."""
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "_preview"

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()

for name in ("css", "img", "docs", "js"):
    src = ROOT / name
    if src.exists():
        shutil.copytree(src, OUT / name)

layout_portfolio = (ROOT / "_layouts" / "portfolio.html").read_text(encoding="utf-8")
layout_default = (ROOT / "_layouts" / "default.html").read_text(encoding="utf-8")
head = ""
head_path = ROOT / "_includes" / "head.html"
if head_path.exists():
    head = head_path.read_text(encoding="utf-8")

site = {
    "name": "Zack Chen",
    "description": (
        "Portfolio of Zack Chen, firmware and telematics SDET focused on "
        "embedded systems, cellular connectivity, and release automation."
    ),
    "title": "Zack Chen | Firmware & Telematics",
}

FM = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)


def parse_front_matter(text):
    match = FM.match(text)
    if not match:
        return {}, text
    meta = {}
    for line in match.group(1).splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip()
    return meta, text[match.end() :]


def liquidish(s, page):
    s = re.sub(
        r"{{\s*['\"]([^'\"]+)['\"]\s*\|\s*relative_url\s*}}",
        r"\1",
        s,
    )
    s = re.sub(
        r"{{\s*page\.(\w+)\s*\|\s*default:\s*site\.(\w+)\s*\|\s*escape\s*}}",
        lambda m: page.get(m.group(1)) or site.get(m.group(2), ""),
        s,
    )
    s = re.sub(
        r"{{\s*page\.(\w+)\s*\|\s*escape\s*}}",
        lambda m: page.get(m.group(1), ""),
        s,
    )
    s = re.sub(
        r"{{\s*site\.(\w+)\s*\|\s*escape\s*}}",
        lambda m: site.get(m.group(1), ""),
        s,
    )
    s = re.sub(r"{{\s*site\.(\w+)\s*}}", lambda m: site.get(m.group(1), ""), s)
    s = re.sub(r"{{\s*page\.(\w+)\s*}}", lambda m: page.get(m.group(1), ""), s)

    # Prefer the {% else %} / content branch in default layout for non-home pages.
    if "{% if page.url == '/' %}" in s:
        else_match = re.search(
            r"{%\s*if page\.url == '/' %.*?{%\s*else\s*%}(.*?){%\s*endif\s*%}",
            s,
            re.S,
        )
        if else_match:
            s = s[: else_match.start()] + else_match.group(1) + s[else_match.end() :]

    s = re.sub(r"{%.*?%}", "", s, flags=re.S)
    return s


def render_page(src_path, dest_path):
    raw = src_path.read_text(encoding="utf-8")
    page, body = parse_front_matter(raw)
    layout_name = page.get("layout", "default")
    tpl = layout_portfolio if layout_name == "portfolio" else layout_default
    tpl = tpl.replace("{% include head.html %}", head)
    content = liquidish(body, page)
    html = tpl.replace("{{ content }}", content)
    html = liquidish(html, page)
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    dest_path.write_text(html, encoding="utf-8")
    print("wrote", dest_path.relative_to(OUT))


pages = [
    (ROOT / "index.html", OUT / "index.html"),
    (ROOT / "about" / "index.html", OUT / "about" / "index.html"),
    (ROOT / "cv" / "index.html", OUT / "cv" / "index.html"),
    (ROOT / "cv" / "embedded" / "index.html", OUT / "cv" / "embedded" / "index.html"),
    (ROOT / "cv" / "backend" / "index.html", OUT / "cv" / "backend" / "index.html"),
    (ROOT / "blog" / "index.html", OUT / "blog" / "index.html"),
]
for src, dest in pages:
    if src.exists():
        render_page(src, dest)

print("PREVIEW_READY", OUT)
