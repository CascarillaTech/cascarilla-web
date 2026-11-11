#!/usr/bin/env bash
# Uso: video/render-ig.sh <dir-composición> <mp4-saída> [música.mp3]
# Vale para calquera formato (IG vertical ou LinkedIn apaisado). Renderiza en secuencial e antepón o último fotograma coma primeiro (portada IG).
set -e
cd "$1"
npx --yes hyperframes@0.8.40 render . --output promo.mp4 --quality looks --workers 1 --experimental-fast-capture=false
N=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 promo.mp4)
ffmpeg -v error -y -i promo.mp4 -vf "select=eq(n\,$((N-1)))" -frames:v 1 cover.png
ffmpeg -v error -y -loop 1 -framerate 30 -t 0.0334 -i cover.png -i promo.mp4 -i cover.png \
  -filter_complex "[0:v]format=yuv420p,setsar=1[c];[1:v]setsar=1[v];[c][v]concat=n=2:v=1[out]" \
  -map "[out]" -map 2:v -c:v:0 libx264 -crf 18 -pix_fmt yuv420p -r 30 -c:v:1 png -disposition:v:1 attached_pic \
  -movflags +faststart "$2"
# Opcional: música de fondo (3º argumento), con fundido de entrada/saída.
if [ -n "$3" ]; then
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$2")
  FO=$(awk "BEGIN{print $D-1.5}")
  ffmpeg -v error -y -i "$2" -i "$3" -map 0:v:0 -map 0:v:1 -map 1:a -c:v copy -disposition:v:1 attached_pic \
    -c:a aac -b:a 192k -af "afade=t=in:d=0.3,afade=t=out:st=$FO:d=1.5" -t "$D" -movflags +faststart "$2.tmp.mp4"
  mv "$2.tmp.mp4" "$2"
fi
