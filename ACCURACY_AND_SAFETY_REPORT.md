# VerdantRisk Accuracy And Safety Report

## Benchmark Findings

PictureThis positions its paid product around accurate instant plant ID, disease diagnosis, care tips, toxic plant warnings, weed ID, reminders, plant collections, and expert gardening consultation. Its App Store listing advertises identification across 400,000+ plant species and 98% accuracy.

PictureThis does not appear to provide a tree fall hazard report, public safety context scoring, or a PDF risk report focused on people, property, roads, sidewalks, parking, play areas, or power lines.

## Accuracy Strategy

The app should not identify a tree from one generic photo when better inputs are available. The guided scan should ask for several optional photos and explain why they matter:

- Full subject photo: growth habit, size, canopy shape, lean, public exposure.
- Leaf or needle detail: strongest plant ID signal for many species.
- Bark or stem photo: important for tree ID and decay signs.
- Base, roots, and soil: root plate movement, trunk flare damage, girdling roots, soil heaving.
- Canopy and branches: deadwood, broken limbs, weak attachments, canopy dieback.
- Damage or decay close-up: cracks, cavities, fungal bodies, pest damage, included bark.

For production, the best free-first path is to connect a specialized plant ID engine such as Pl@ntNet API for plant/species candidates, then combine that with a separate safety assessment model. Pl@ntNet supports 1 to 5 same-plant images per identification request and returns ranked species candidates with confidence scores.

## Report Logic

VerdantRisk should separate the report into:

- Identification: likely plant/tree name, plain-language category, and uncertainty disclaimer.
- Assessment Quality: Limited, Fair, or Strong, based on photo count and whether key angles were included.
- Risk Level: Low, Moderate, High, or Critical.
- Observed Visual Indicators: lean, cracks, cavities, fungi, dead limbs, canopy dieback, pest damage, root lift, soil movement.
- Location/Public Safety Factors: home, road, sidewalk, parking, play/school area, power lines, open area.
- Other Hazard Flags: toxicity, thorns, allergens, invasive behavior, root damage, obstruction risk.
- Recommended Next Step: monitor, add more photos, restrict access, or confirm with a licensed arborist or qualified professional.

## Current Prototype Limitation

The current browser prototype does not run real image recognition yet. It now avoids falsely naming a species from uploaded photos and instead shows a report flow that is ready for a production AI plant ID engine and visual hazard assessment.

## Sources

- PictureThis App Store listing: https://apps.apple.com/us/app/picturethis-plant-identifier/id1252497129
- PictureThis website: https://www.picturethisai.com/app
- Pl@ntNet API documentation: https://my.plantnet.org/doc/api/identify
- Purdue Extension tree defect guidance: https://www.purdue.edu/fnr/extension/how-to-identify-tree-defects-and-what-to-do-about-it/
