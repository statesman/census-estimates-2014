#/bin/sh
topojson -o ../../public/data/counties.topojson \
  --quantization 1e3 \
  --simplify-proportion 0.25 \
  --id-property NAME \
  tl_2014_us_county_texas.geojson
