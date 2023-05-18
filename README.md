# backbone-ridge

Converting observation table to points:


Calculate unique key (or nearly unique) for each observation point:

"Township" || '-' || "Lot" || "Starting Corner" || '-' || "Direction" || "Chains" || if ("Links" > 0, '.' || "Links", '')



Reproject corners to ESRI:102716 - NAD_1983_StatePlane_New_York_Central_FIPS_3102_Feet

x = 

with_variable('g', geometry(get_feature('Reprojected', 'corner_id', ("Township" || '-' || "Lot" || '-' || "Starting Corner"))),
with_variable('d', "Chains" * 66 + "Links" * 66/100,
with_variable('a', 2.5 / 180 * pi(),
x(@g)
+ if("Direction"='E', 1, 0) * @d * cos(@a)
+ if("Direction"='W', -1, 0) * @d * cos(@a)
+ if("Direction"='N', -1, 0) * @d * sin(@a)
+ if("Direction"='S', 1, 0) * @d * sin(@a)
)))



y = 

with_variable('g', geometry(get_feature('Reprojected', 'corner_id', ("Township" || '-' || "Lot" || '-' || "Starting Corner"))),
with_variable('d', "Chains" * 66 + "Links" * 66/100,
with_variable('a', 2.5 / 180 * pi(),
y(@g)
+ if("Direction"='E', 1, 0) * @d * sin(@a)
+ if("Direction"='W', -1, 0) * @d * sin(@a)
+ if("Direction"='N', 1, 0) * @d * cos(@a)
+ if("Direction"='S', -1, 0) * @d * cos(@a)
)))

with_variable('d', "Chains" * 66 + "Links" * 66/100,
y(
  geometry(
    get_feature('Reprojected', 'corner_id',
      ("Township" || '-' || "Lot" || '-' || "Starting Corner")
	)
  )
)
+ if("Direction"='N', 1, 0) * @d
+ if("Direction"='S', -1, 0) * @d
)

x,y columns are calculated as above.

Points were snapped to the lot bounds so that the observation points fall on the bounds.  However, sometimes it snapped to the wrong bound, especially near corners.  I've been working through a manual review, and adjusting the locations so that they are on the correct bound, and do not overshoot the end corner.  Generally, I've set the points around 20-30 feet shy of reaching the corner (approaching in the direction noted in the journals).

Sort by azimuth ascending, and I stopped at row 600.

The snapped coords are in x2,y2.  After manual adjustments, store coords as x3,y3?

There are a couple transcription/journal errors, for example Ovid-35-SE at 94 and 98 chains.  This is said to be for the S bounds, heading N, which makes no sense.

There are also some duplicates -- need to check if those are transcription errors, or actually dupl in the journal.

Also some rows lack chains/links or x/y



QUESTIONS:

What does "With an allowance of 50 links..." mean?

