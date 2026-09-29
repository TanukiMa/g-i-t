#!/usr/bin/env bash
# Appends a dated entry to CHANGELOG.md describing the site changes
# committed as $1 (a commit sha created by `website-stalker run --all --commit`).
#
# CHANGELOG.md lives at the repo root (not in a subdirectory) on purpose:
# website-stalker's cleanup deletes any file inside a non-dot top-level
# directory that isn't one of its tracked site files, so a "report/" folder
# would get wiped out on the next run.
set -euo pipefail

sha="$1"
repo_root="$(git rev-parse --show-toplevel)"
report_file="$repo_root/CHANGELOG.md"

short_sha="${sha:0:7}"
timestamp="$(date -u +'%Y-%m-%d %H:%M UTC')"
repo_url="${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-}"
commit_url="${repo_url}/commit/${sha}"

urls="$(git log -1 --format=%B "$sha" | grep -E '^- ' || true)"

entry_file="$(mktemp)"
trap 'rm -f "$entry_file"' EXIT

if [ -n "$urls" ]; then
    count="$(printf '%s\n' "$urls" | wc -l)"
    {
        echo "## ${timestamp} — ${count} 件のサイトが変更"
        echo
        printf '%s\n' "$urls" | while IFS= read -r line; do
            url="${line#- }"
            echo "- [${url}](${url})"
        done
        echo
        echo "コミット: [\`${short_sha}\`](${commit_url})"
        echo
    } > "$entry_file"
else
    {
        echo "## ${timestamp} — メンテナンス"
        echo
        echo "_(サイト内容の変更なし。バックグラウンドのファイル整理のみ)_"
        echo
        echo "コミット: [\`${short_sha}\`](${commit_url})"
        echo
    } > "$entry_file"
fi

awk -v entry_file="$entry_file" '
    { print }
    /<!-- ENTRIES:START -->/ && !done {
        while ((getline line < entry_file) > 0) print line
        done = 1
    }
' "$report_file" > "$report_file.tmp"
mv "$report_file.tmp" "$report_file"
