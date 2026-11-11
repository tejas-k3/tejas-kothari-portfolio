#!/usr/bin/env bash
# Creates a blog post from the standard template, so every post has the same frontmatter.
#
#   bun run new -- "Solo travel diary 1" --category travel --series "Solo travel" --part 2 --private
#
# Public posts go to src/content/blog/<slug>.md, private ones to private/<slug>.md (gitignored plaintext).
# New posts start with `draft: true`; flip it to false when you want the post to go out.
set -euo pipefail
cd "$(dirname "$0")/.."

usage() { echo 'usage: bun run new -- "Post title" [--private] [--category travel|tech|random] [--series "Name" --part N] [--slug my-slug]' >&2; exit 1; }
[ $# -ge 1 ] || usage

title="$1"; shift
category="random"; series=""; part=""; slug=""; private=0
while [ $# -gt 0 ]; do
  case "$1" in
    --private) private=1 ;;
    --category) category="${2:?--category needs a value}"; shift ;;
    --series) series="${2:?--series needs a value}"; shift ;;
    --part) part="${2:?--part needs a value}"; shift ;;
    --slug) slug="${2:?--slug needs a value}"; shift ;;
    *) usage ;;
  esac
  shift
done

[ -n "$slug" ] || slug="$(printf '%s' "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"
[ -n "$slug" ] || { echo "could not derive a slug from the title; pass --slug" >&2; exit 1; }
if [ -n "$part" ] && [ -z "$series" ]; then echo "--part needs --series" >&2; exit 1; fi

if [ "$private" = 1 ]; then dir="private"; else dir="src/content/blog"; fi
mkdir -p "$dir"
file="$dir/$slug.md"
for other in "src/content/blog/$slug.md" "private/$slug.md" "src/content/sealed/$slug.json"; do
  [ ! -e "$other" ] || { echo "already exists: $other" >&2; exit 1; }
done

{
  echo "---"
  echo "title: \"${title//\"/\\\"}\""
  echo "date: $(date +%Y-%m-%d)"
  echo "category: $category"
  [ -z "$series" ] || echo "series: \"$series\""
  [ -z "$part" ] || echo "part: $part"
  echo "tags: []"
  echo "summary: \"\"        # one line; shown on cards and as the subtitle"
  [ "$private" = 0 ] || echo "secretTitle: false  # true = title and summary stay hidden until unlocked"
  echo "draft: true         # set to false when it is ready to publish"
  echo "---"
  echo
  echo "Opening paragraph."
  echo
  echo "## Heading"
  echo
  echo "Body. **Bold**, *italic*, [links](https://example.com), > quotes, lists, \`code\` all work."
  if [ "$private" = 1 ]; then
    echo "<!-- Images: put the file in private/ and use ![alt](./pic.webp); it gets encrypted into the post. Delete this comment. -->"
  else
    echo "<!-- Images: put the file in public/blog/$slug/ and use ![alt](/blog/$slug/pic.webp). Delete this comment. -->"
  fi
} > "$file"

echo "created $file"
[ "$private" = 0 ] || echo "(private: plaintext stays in private/, which is gitignored. Back it up.)"
echo "Preview with: bun run dev  ->  /blog/$slug"
