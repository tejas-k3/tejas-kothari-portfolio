#!/usr/bin/env bash
# Regenerates public/Tejas_Kothari_Resume.pdf from the /resume page using headless Chrome (no email, no phone).
# Usage: bun run build && bun run preview --port 4321 &   then   bash scripts/make_resume_pdf.sh
set -euo pipefail
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
URL="${1:-http://localhost:4321/resume}"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="public/Tejas_Kothari_Resume.pdf" "$URL"
echo "wrote public/Tejas_Kothari_Resume.pdf"
