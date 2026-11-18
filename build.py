#!/usr/bin/env python3
"""Build X Society: src/ -> dist/ (Wix) and preview/ (local, mocked Wix modules)."""
import re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).parent
SRC, DIST, PREVIEW = ROOT / "src", ROOT / "dist", ROOT / "preview"

IMG = {
    "poster": "2b4523_d6c1a19d00ad4fd8941b5b3c0b56f22f~mv2.jpg",
    "rooftop": "2b4523_b69c85db70f941f69d28c78d9ea94e11~mv2.jpg",
    "popup": "2b4523_d86107de03c6455791c05f71ccd4e9b6~mv2.jpg",
    "bts": "2b4523_ea2fa8f7da0544739d56d825c863638f~mv2.jpg",
    "selfie": "2b4523_6ec837738f324e4ebeab3373f68f076a~mv2.jpg",
    "dance": "2b4523_c74fb5db36ac449c93b402299978a067~mv2.jpg",
    "party": "2b4523_569b14ce82864adfb6bf5e1fbebe6868~mv2.jpg",
    "interview": "2b4523_79e75acccac746f98921b54df31d04c1~mv2.jpg",
    "food": "2b4523_22b0649432784aaa9d5c7d0e782f256d~mv2.jpg",
    "inf-atl": "2b4523_bd8a5200aaa9432b881c0a1543f1abba~mv2.jpg",
    "inf-chi": "2b4523_5c9293be7eae4b5cb910c9c55edac34e~mv2.jpg",
    "inf-bk": "2b4523_5a7983ce998749aeaa041f65bb0c7efb~mv2.jpg",
    "inf-lou": "2b4523_95843405e9844ffc82ec03f9c769a6a1~mv2.jpg",
    "inf-atx": "2b4523_3b950ae6207a4918a13b0907b3798448~mv2.jpg",
    "inf-chi2": "2b4523_f1fa652c305b44f7a79d6e5ef68af1a5~mv2.jpg",
}
LOCAL_IMG = {"poster": "hero-poster"}
VID = {
    "desktop": "https://video.wixstatic.com/video/2b4523_cd062de002dc467394c76742c51fe6e3/720p/mp4/file.mp4",
    "mobile": "https://video.wixstatic.com/video/2b4523_4ca6aee46ec4494b87799fab802c3e31/480p/mp4/file.mp4",
}
LOCAL_VID = {"desktop": "/media/hero-web.mp4", "mobile": "/media/hero-mobile.mp4"}

FAVICON = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#c8ff3d"/><path d="M18 16h9l5 9 5-9h9L36.5 32 46 48h-9l-5-9-5 9h-9l9.5-16z" fill="#0a0a0b"/></svg>"""


def render(text, local):
    partials = {p.stem: p.read_text() for p in (SRC / "partials").glob("*.html")}

    def inc(m):
        name, arg = m.group(1), (m.group(2) or "").strip()
        body = partials[name]
        for key in ("home", "roster", "contact"):
            body = body.replace("{{cur:%s}}" % key, ' aria-current="page"' if key == arg else "")
        return body

    text = re.sub(r"\{\{> (\w+)(?: (\w+))?\}\}", inc, text)

    def img(m):
        key, w, h = m.group(1), m.group(2), m.group(3)
        if local:
            return "/media/%s.jpg" % LOCAL_IMG.get(key, key)
        fid = IMG[key]
        return "https://static.wixstatic.com/media/%s/v1/fill/w_%s,h_%s,al_c,q_80,enc_auto/%s.jpg" % (fid, w, h, key)

    text = re.sub(r"\{\{img:([\w-]+):(\d+)x(\d+)\}\}", img, text)
    text = re.sub(r"\{\{vid:(\w+)\}\}", lambda m: (LOCAL_VID if local else VID)[m.group(1)], text)
    left = re.findall(r"\{\{[^}]*\}\}", text)
    if left:
        sys.exit("unresolved tokens: %s" % left)
    return text


def build(out, local):
    if out.exists():
        shutil.rmtree(out)
    out.mkdir()
    for p in SRC.rglob("*"):
        if p.is_dir() or "partials" in p.parts:
            continue
        dest = out / p.relative_to(SRC)
        dest.parent.mkdir(parents=True, exist_ok=True)
        if p.suffix == ".html":
            dest.write_text(render(p.read_text(), local))
        else:
            shutil.copy(p, dest)
    (out / "fonts").mkdir(exist_ok=True)
    shutil.copy(ROOT / "site" / "fonts" / "moka.woff", out / "fonts" / "moka.woff")
    (out / "favicon.svg").write_text(FAVICON)
    if local:
        shutil.copytree(ROOT / "mock", out / "js" / "wix")
        (out / "media").symlink_to(ROOT / "media")


build(DIST, False)
if (ROOT / "mock").exists():
    build(PREVIEW, True)
print("built", sorted(str(p.relative_to(DIST)) for p in DIST.rglob("*") if p.is_file()))
