"""
Makes a 1200x630 link-preview card (public/og/projects/<slug>.jpg) for every project in src/data/projects.ts.
Run after adding or renaming a project:   npm run og:cards
Needs Python 3 with Pillow (pip install pillow). Projects without a card fall back to the site's og-image.jpg.
"""
import colorsys
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "og", "projects")
W, H = 1200, 630


def hsl(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return (round(r * 255), round(g * 255), round(b * 255))


# Same values as the dark theme in src/index.css
BG, PRIMARY, ACCENT, FG, MUTED = hsl(240, 10, 4), hsl(187, 94, 48), hsl(280, 85, 65), hsl(0, 0, 98), (165, 170, 180)


def font(names, size):
    for name in names:
        for folder in ("C:/Windows/Fonts", "/usr/share/fonts/truetype/dejavu", "/Library/Fonts"):
            path = os.path.join(folder, name)
            if os.path.exists(path):
                return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


BOLD = ["segoeuib.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf"]
SEMI = ["seguisb.ttf", "DejaVuSans-Bold.ttf", "Arial.ttf"]
REG = ["segoeui.ttf", "DejaVuSans.ttf", "Arial.ttf"]


def wrap(draw, text, fnt, width, max_lines):
    words, lines, line = text.split(), [], ""
    for word in words:
        test = f"{line} {word}".strip()
        if draw.textlength(test, font=fnt) <= width:
            line = test
        else:
            lines.append(line)
            line = word
    lines.append(line)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        while draw.textlength(lines[-1] + "…", font=fnt) > width:
            lines[-1] = lines[-1][:-1]
        lines[-1] += "…"
    return lines


def card(project, site_host):
    img = Image.new("RGB", (W, H), BG)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse((-220, -260, 500, 420), fill=PRIMARY + (70,))
    g.ellipse((760, 300, 1400, 900), fill=ACCENT + (55,))
    img.paste(glow.filter(ImageFilter.GaussianBlur(120)), (0, 0), glow.filter(ImageFilter.GaussianBlur(120)))

    text_w = 620
    shot = project.get("image")
    if shot:
        src = Image.open(os.path.join(ROOT, "public", shot.lstrip("/"))).convert("RGB")
        box_w, box_h = 470, 470
        scale = max(box_w / src.width, box_h / src.height)
        src = src.resize((round(src.width * scale), round(src.height * scale)), Image.LANCZOS)
        fx = 0.5
        focus = (project.get("imageFocus") or "").split()
        if focus and focus[0].endswith("%"):
            fx = float(focus[0][:-1]) / 100
        left = round((src.width - box_w) * fx)
        top = 0 if "top" in focus else round((src.height - box_h) / 2)
        src = src.crop((left, top, left + box_w, top + box_h))
        mask = Image.new("L", (box_w, box_h), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, box_w, box_h), radius=28, fill=255)
        x, y = W - box_w - 60, (H - box_h) // 2
        border = Image.new("RGB", (box_w + 4, box_h + 4), (60, 64, 72))
        bmask = Image.new("L", border.size, 0)
        ImageDraw.Draw(bmask).rounded_rectangle((0, 0, *border.size), radius=30, fill=255)
        img.paste(border, (x - 2, y - 2), bmask)
        img.paste(src, (x, y), mask)
    else:
        text_w = W - 144

    d = ImageDraw.Draw(img)
    x = 72
    label = (project.get("category") or ("Featured Project" if project.get("featured") else "Project")).upper()
    d.text((x, 92), label, font=font(SEMI, 22), fill=PRIMARY)

    title_font = font(BOLD, 64 if len(project["title"]) < 28 else 52)
    y = 136
    for line in wrap(d, project["title"], title_font, text_w, 3):
        d.text((x, y), line, font=title_font, fill=FG)
        y += title_font.size + 10

    tags = " · ".join(project["tags"][:5])
    y += 18
    for line in wrap(d, tags, font(REG, 26), text_w, 2):
        d.text((x, y), line, font=font(REG, 26), fill=MUTED)
        y += 36

    d.text((x, H - 112), "Olanrewaju Illias", font=font(SEMI, 28), fill=FG)
    d.text((x, H - 72), f"{site_host}/projects/{project['slug']}", font=font(REG, 22), fill=PRIMARY)
    return img


def main():
    sys.stdin.reconfigure(encoding="utf-8")  # Windows pipes default to the ANSI code page
    data = json.load(sys.stdin)
    os.makedirs(OUT, exist_ok=True)
    for project in data["projects"]:
        path = os.path.join(OUT, f"{project['slug']}.jpg")
        card(project, data["host"]).save(path, quality=85, optimize=True, progressive=True)
        print(f"{os.path.relpath(path, ROOT)}  {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    main()
