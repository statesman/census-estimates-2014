#/bin/sh
topojson -o ../../public/data/counties.topojson \
  --quantization 1e3 \
  --external-properties CO-EST2014-alldata.csv \
  --simplify-proportion 0.25 \
  --properties p2010=+POPESTIMATE2010,p2011=+POPESTIMATE2011,p2012=+POPESTIMATE2012,p2013=+POPESTIMATE2013,p2014=+POPESTIMATE2014 \
  --id-property NAMELSAD \
  tl_2014_us_county_texas.geojson
