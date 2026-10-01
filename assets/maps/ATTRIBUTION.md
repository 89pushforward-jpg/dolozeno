# Map data

Downloaded 2026-10-01. All runtime data is served locally; no external map provider or API key.

- Countries: Natural Earth, 1:110 million admin-0 countries. Public domain. https://www.naturalearthdata.com/about/terms-of-use/ ; GeoJSON https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson . Properties reduced to name and label position; geometry unchanged. Boundaries are a cartographic reference, not a determination of sovereignty.
- Stars, constellation lines and Czech names: https://github.com/ofrohn/d3-celestial , Olaf Frohn, BSD 3-Clause (full text in LICENSE-celestial.txt). Source stellar catalogue: XHIP, Anderson & Francis 2012, VizieR V/137D. Constellation reference: IAU; label positions and line modifications by Olaf Frohn. Coordinates transformed to J2000, RA expressed as GeoJSON longitude -180..180 degrees. The map uses these values as RA angles, not geographic longitude.
- Exoplanet directions: NASA Exoplanet Archive pscomppars table, TAP query pl_name/ra/dec; recorded in exoplanet-positions.json.
- Additional object directions: CDS Sesame / SIMBAD, ICRS/J2000. Response evidence saved in sesame-positions.json and sesame-extra.json.
- Earth locations: editorial assignment to named places or explicitly marked approximate areas from the existing article. content/map-locations.json retains an article source and precision note for each point. Broad or unidentified topics have no invented point.
- Solar system: schematic order and parent-body placement, no ephemerides and no linear distance scale. Small bodies and Voyager are contextual catalogue entries rather than current positions.
- Chandra article: M31 and M101 represent two named galaxies of six in the NASA source, not all 84 X-ray sources. https://science.nasa.gov/missions/chandra/nasas-chandra-unveils-mysterious-x-ray-objects/

New articles added through the existing admin remain publishable. Until an editor adds their location to content/map-locations.json, they appear in the map list without a fabricated point. Never infer coordinates from a title automatically.
