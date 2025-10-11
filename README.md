# backbone-ridge



## Creating lot boundaries

- Georeference historical map, using road intersections
- Digitize lot corners using historical map as a reference
    - Adjust point locations based on modern intersections
- Digitize lot boundaries, snapping to corners, and always starting at NW corner and going clockwise (this will help when labelling the corners later)
- Adjust nodes that are not at modern intersections by trying to follow field and tree lines, and when there is no reference to follow, try to keep things relatively straight and square, and align to official town boundaries
- Extract vertices from lot boundaries, call it "corners"
    - Delete corners where vertex_index = 0 (since it is the same as the last point in the polygon)
    - Label vertex_index=1 as 'NE', 2 as 'SE' etc. which will be correct for most lots
    - Fix the corner labels of any irregular lots (more than 4 vertices)

## Converting observation table to points:

Create new column of the original sort order as found in the journals

Sort by Starting Corner, Direction, and double-check Bounds values for any discrepancies.

Calculate unique key (or nearly unique) for each observation point:

```
"Township" || '-' || "Lot" || "Starting Corner" || 
if ("Chains">0, '-' || "Direction" || "Chains" || if ("Links" > 0, '.' || "Links", ''), '')
```

Reproject corners to ESRI:102716 - NAD_1983_StatePlane_New_York_Central_FIPS_3102_Feet

Calculate x,y in the observations table as follows:

```
x =
with_variable('g', geometry(get_feature('Reprojected', 'corner_id', ("Township" || '-' || "Lot" || '-' || "Starting Corner"))),
with_variable('d', "Chains" * 66 + coalesce("Links",0) * 66/100,
with_variable('a', 2.5 / 180 * pi(),
x(@g)
+ if("Direction"='E', 1, 0) * @d * cos(@a)
+ if("Direction"='W', -1, 0) * @d * cos(@a)
+ if("Direction"='N', -1, 0) * @d * sin(@a)
+ if("Direction"='S', 1, 0) * @d * sin(@a)
)))
```

```
y = 
with_variable('g', geometry(get_feature('Reprojected', 'corner_id', ("Township" || '-' || "Lot" || '-' || "Starting Corner"))),
with_variable('d', "Chains" * 66 + coalesce("Links",0) * 66/100,
with_variable('a', 2.5 / 180 * pi(),
y(@g)
+ if("Direction"='E', 1, 0) * @d * sin(@a)
+ if("Direction"='W', -1, 0) * @d * sin(@a)
+ if("Direction"='N', 1, 0) * @d * cos(@a)
+ if("Direction"='S', -1, 0) * @d * cos(@a)
)))
```

Create points layer from table, using CRS ESRI:102716

Snap geometries to layer (points from table, snapped to reprojected lots ESRI:102716)

Points were snapped to the lot bounds so that the observation points fall on the bounds.  However, sometimes it snapped to the wrong bound, especially near corners.  I've been working through a manual review, and adjusting the locations so that they are on the correct bound, and do not overshoot the end corner.  Generally, I've set the points around 25-50 feet shy of reaching the corner (approaching in the direction noted in the journals).  To help keep this distance consistent, set the corners point size to x meters at scale.


Too help with the manual review:

Label the points with:
```
id || if(@map_scale < 5000, '\n' || "Observation" || '\npage ' || "Page", '')
```

Color code by direction:
```
CASE
WHEN "Chains"=0 AND "Links"=0 THEN '#ffffff'
WHEN "Direction"='E' THEN '#8888ff'
WHEN "Direction"='W' THEN '#00ff00'
WHEN "Direction"='N' THEN '#ff8888'
WHEN "Direction"='S' THEN '#ff8800'
END
```

QUESTIONS:

What does "With an allowance of 50 links..." mean?



# Processing transcripts

* copy table contents from .docx
* paste with ALT-SHIFT-V (using "Excel to Markdown table" plugin for VSCode)
* s/\s+/ /g
* manually add extra line between each row, make sure each group is four cells
* s/\|\n\|/|/g
* edit md to generate tables (use Markdown Preview)
  * add |-|-|-|-| after the header row

* search for 5 cells in a row


# TODO

* normalize _ and - in HTML

* review N-S bounds in Ovid

* search for multiple passes of the same bounds in Hector

* look for duplicate observations







# NEXT STEPS

- ask about ulysses observation spreadsheet
- ask about lot data (soldier_granted, regiment, patent_to)

- merge all lots (hector, ovid, enfield, ulysses)
- merge all observations (hector, ovid, enfield)
- update website with those layers

- convert enfield .docx to .md
- convert ulysses .docx to .md
- generate ulysses observation points
