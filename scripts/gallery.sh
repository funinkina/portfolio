#!/usr/bin/env bash
# Import photos into the /gallery page bundle: downscale to 2400px, re-encode as JPEG.
# The re-encode also rewrites EXIF in a form Hugo can decode (raw iPhone/Snapseed files fail).
# GPS is moved into the printed stub rounded to ~100 m and stripped from the file (public repo).
# Needs: sips (macOS), exiftool (brew install exiftool).
# Usage: scripts/gallery.sh ~/Downloads/gallery   then paste the printed stubs into resources: in content/gallery/index.md
set -euo pipefail
src="${1:?usage: $0 <photo-dir>}"
out="$(dirname "$0")/../content/gallery"
for f in "$src"/*.{jpg,jpeg,JPG,JPEG,heic,HEIC}; do
  [ -e "$f" ] || continue
  # "PXL_x.MP.jpeg" and "PXL_x (1).jpeg" both normalise to "PXL_x.jpg", so re-downloads dedupe.
  name=$(basename "${f%.*}" | sed -E 's/ \([0-9]+\)$//; s/\.MP$//').jpg
  [ -e "$out/$name" ] && { echo "skip  $(basename "$f") ($name exists)"; continue; }
  sips -Z 2400 -s format jpeg -s formatOptions 85 "$f" --out "$out/$name" >/dev/null
  read -r lat lng < <(exiftool -q -q -n -f -p '$GPSLatitude $GPSLongitude' "$out/$name")
  exiftool -q -gps:all= -overwrite_original "$out/$name"
  [ "$lat" = - ] && coords='lat: , lng: ' || coords=$(printf 'lat: %.3f, lng: %.3f' "$lat" "$lng")
  # Stub printed per file, so a later failure can't lose it. Build fails until alt is filled.
  printf '  - src: %s\n    params: { place: "", %s, alt: "" }\n' "$name" "$coords"
done
