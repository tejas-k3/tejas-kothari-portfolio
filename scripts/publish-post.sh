#!/usr/bin/env bash
# Seals private posts (password from .env.local: BLOG_PASSWORD) and commits the blog changes.
#
#   bun run publish-post            seal + commit all blog changes
#   bun run publish-post -- --push  also push the current branch
#
# Commits ONLY: src/content/sealed, src/content/blog, public/blog. Nothing else, and never private/.
# Posts still marked `draft: true` are not sealed (and public drafts stay hidden in production).
set -euo pipefail
cd "$(dirname "$0")/.."

push=0
[ "${1:-}" != "--push" ] || push=1

ENV_FILE=".env.local"
if [ -z "${BLOG_PASSWORD:-}" ]; then
  [ -f "$ENV_FILE" ] || { echo "No BLOG_PASSWORD set and $ENV_FILE not found. Add a line: BLOG_PASSWORD=your long passphrase" >&2; exit 1; }
  # Read the value as text (never sourced/evaluated), strip optional surrounding quotes.
  BLOG_PASSWORD="$(grep -E '^[[:space:]]*(export[[:space:]]+)?BLOG_PASSWORD=' "$ENV_FILE" | tail -n1 | sed -E 's/^[^=]*=//; s/^"(.*)"$/\1/; s/^'"'"'(.*)'"'"'$/\1/')"
  [ -n "$BLOG_PASSWORD" ] || { echo "BLOG_PASSWORD is empty in $ENV_FILE" >&2; exit 1; }
fi
export BLOG_PASSWORD

# Safety: plaintext must never be tracked.
if [ -n "$(git ls-files private)" ]; then echo "private/ has tracked files. Run: git rm -r --cached private" >&2; exit 1; fi

if ls private/*.md >/dev/null 2>&1; then node scripts/seal.mjs; else echo "(no private posts to seal)"; fi

paths=(src/content/sealed src/content/blog public/blog)
existing=(); for p in "${paths[@]}"; do [ -e "$p" ] && existing+=("$p"); done
changes="$(git status --porcelain -uall -- "${existing[@]}")"
[ -n "$changes" ] || { echo "Nothing to commit."; exit 0; }

# Belt and braces: refuse to commit a public post that is marked encrypted.
if grep -lE '^encrypted:[[:space:]]*true' src/content/blog/*.md 2>/dev/null; then echo "Above file(s) are marked encrypted but not sealed. Aborting." >&2; exit 1; fi

# Commit message from the touched post files.
names="$(printf '%s\n' "$changes" | awk '{print $NF}' | grep -E '\.(md|json)$' | sed -E 's#.*/##; s#\.(md|json)$##' | sort -u | paste -sd, - | sed 's/,/, /g' || true)"
[ -n "$names" ] || names="posts"
git add -- "${existing[@]}"
# Only blog files may be staged; anything else you had staged stays out of this commit.
outside="$(git diff --cached --name-only | grep -vE '^(src/content/(sealed|blog)|public/blog)/' || true)"
[ -z "$outside" ] || { echo "Other files are already staged; unstage them first (git restore --staged .):" >&2; echo "$outside" >&2; exit 1; }
git commit -m "Blog: ${names}"
echo "Committed. Plaintext in private/ was not touched or staged."
if [ "$push" = 1 ]; then git push; else echo "Review, then: git push"; fi
