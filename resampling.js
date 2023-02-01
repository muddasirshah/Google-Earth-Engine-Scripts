// Resampling a band and finding resolution of a band or image in Google Earth Engine
var image = ee.Image('COPERNICUS/S2_SR_HARMONIZED/20220304T055741_20220304T055736_T42RWV');
Map.addLayer(image,{min:0,max:8000, gamma:2, bands:['B4','B3','B2']},'Image');
Map.centerObject(image);

// Finding resolution of a band / image
var b8 = image.select('B8');
var resolution = b8.projection().nominalScale();
print(resolution,'B8 Resolution');

var b11 = image.select('B11');
var resolution = b11.projection().nominalScale();
print(resolution,'B11 Resolution');


// Resampling B8 to 20m/Pixel
var resampled_b8 = b8.resample('bilinear')
                  .reproject({
                    crs: b8.projection(),
                    scale:20
                  });

var resolution = resampled_b8.projection().nominalScale();
print(resolution,'B8 Resampled Resolution');                  

Map.addLayer(b8,{},'B8');
Map.addLayer(resampled_b8,{},'Resampled B8');           
