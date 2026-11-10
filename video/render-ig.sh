#!/usr/bin/env bash
# Uso: video/render-ig.sh <dir-composición> <mp4-saída>
# Renderiza en secuencial e antepón o último fotograma coma primeiro (portada IG).
set -e
cd "$1"
npx --yes hyperframes@0.8.40 render . --output promo.mp4 --quality looks --workers 1 --experimental-fast-capture=false
N=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 promo.mp4)
ffmpeg -v error -y -i promo.mp4 -vf "select=eq(n\,$((N-1)))" -frames:v 1 cover.png
ffmpeg -v error -y -loop 1 -framerate 30 -t 0.0334 -i cover.png -i promo.mp4 -i cover.png \
  -filter_complex "[0:v]scale=1080:1920,format=yuv420p,setsar=1[c];[1:v]setsar=1[v];[c][v]concat=n=2:v=1[out]" \
  -map "[out]" -map 2:v -c:v:0 libx264 -crf 18 -pix_fmt yuv420p -r 30 -c:v:1 png -disposition:v:1 attached_pic \
  -movflags +faststart "$2"
