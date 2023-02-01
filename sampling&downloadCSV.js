var MODIS_Collection = ee.ImageCollection("MODIS/061/MOD13Q1");

// Study Area
// Draw your study_area polygon to filter images for. Draw using the grometry tools on Map.

// Sample Points
// Draw you sample points my_points using the geometry tools

var image = MODIS_Collection.filterBounds(study_area)
            .filterDate('2022-05-01','2022-05-20').first().select('NDVI').multiply(0.0001);
Map.addLayer(image,{min:0, max:1, palette:['yellow','orange','green']},'MODIS NDVI Image');

var sampled = image.sampleRegions({
  collection:my_points,
  scale:250,
});

print(sampled)



Export.table.toDrive({
  collection: sampled, 
  description:'MODIS_250_data_ndvi'})
