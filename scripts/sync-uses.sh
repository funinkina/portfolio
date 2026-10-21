#!/usr/bin/env bash
# Vendor the dotfiles that /uses is built from into assets/uses/.
# Re-run after changing the dotfiles repo, then commit the diff.
set -euo pipefail
repo=funinkina/dotfiles
out="$(dirname "$0")/../assets/uses"
mkdir -p "$out"
for f in snapshots/pkglist.txt snapshots/aurlist.txt snapshots/gnome-extensions.txt \
         fish/.config/fish/config.fish gnome-keybinds.sh; do
  gh api "repos/$repo/contents/$f" -H "Accept: application/vnd.github.raw" > "$out/$(basename "$f")"
done
gh api "repos/$repo/commits/HEAD" --jq '.sha[:7] + " " + .commit.committer.date[:10]' > "$out/REVISION"
echo "synced $repo@$(cat "$out/REVISION") -> $out"
