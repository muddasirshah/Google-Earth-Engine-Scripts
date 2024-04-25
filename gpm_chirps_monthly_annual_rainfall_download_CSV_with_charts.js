//Script Link: https://code.earthengine.google.com/d4f350b6decf446284fef549f2f8fa07
var aoi = ee.FeatureCollection('projects/ee-muddasir-shah/assets/islamabad');
Map.centerObject(aoi);
Map.addLayer(aoi.style({color:'red',fillColor:'#FFFFFF00'}),{},'AOI');

// Filter the dataset by location and time
var dataset = ee.ImageCollection('NASA/GPM_L3/IMERG_V06')
var start = 2020;
var end = 2024;
// (Task 1) Reducing to Monthly Series by Year and Exporting (2020)
var years = ee.List.sequence({start:start, end:end, step:1})
print(years,'Years')

var precipitation = years.map(function(y){
  var y_start = ee.Date.fromYMD(y,1,1)
  var months_in_year = ee.List.sequence({start:1,end:12,step:1})
  var monthly_precp_reduced = months_in_year.map(function(m){
    var m_start = ee.Date.fromYMD(y,m,1);
    var m_end = m_start.advance(1, 'month').advance(-1, 'day'); 
    var monthly_precp_sum = dataset
                        .select('precipitationCal')
                        .filterBounds(aoi)
                        .filterDate(m_start, m_end)
                        .sum()
                        .rename('precipitationCal_sum');
    
    return ee.Image(monthly_precp_sum).set({      
        'month': m,
        'year': y,
        'bands':ee.Image(monthly_precp_sum).bandNames().size(),
        'y_m':ee.String(ee.Number(y).format('%d')).cat('-').cat(ee.Number(m).format('%02d'))
    });
    
  })
  return monthly_precp_reduced
})

var precipitation = ee.ImageCollection.fromImages(precipitation.flatten())
                    .filter(ee.Filter.neq('bands',0))
print(precipitation,'Monthly Precp. Collection')

var reduceforAOI = precipitation.map(function(img) {
  var precpSum = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: aoi,
    scale: 1000 
  }).get('precipitationCal_sum');
 
  return ee.Feature(null, {
    'year_month': img.get('y_m'),
    'sum_precp': precpSum
  });
});
print(reduceforAOI,'RR')

// Export Results
Export.table.toDrive({
  collection:reduceforAOI, 
  description:'GPM_Monthly', 
  folder:'Precp_GPM', 
  fileFormat:'csv', 
  selectors:['year_month','sum_precp']})

var chart = ui.Chart.feature.byFeature({
  features:reduceforAOI, 
  xProperty:'year_month', 
  yProperties:['sum_precp']})
  .setChartType('LineChart')
  .setOptions({
    title: 'Monthly Precipitation',
    hAxis: {title: 'Time (Month)'},
    vAxis: {title: 'Total Precipitation mm/month'}
  });
print(chart)








// Task 2 (reduce to yearly collections)
var start_year = 2020
var end_year = 2024
var years = ee.List.sequence({start:start_year, end:end_year, step:1})
var precipitation_yearly = years.map(function(y){
  var y_start = ee.Date.fromYMD(y,1,1);
  var y_end = ee.Date.fromYMD(y,12,31);
  var yearly_precp_sum = dataset.filterBounds(aoi)
  .select('precipitationCal')
  .filterDate(y_start,y_end)
  .sum()
  .rename('precipitationCal_sum')
  return yearly_precp_sum.set({
    'year': y,
  });
  
})
var precipitation_yearly = ee.ImageCollection.fromImages(precipitation_yearly);
print(precipitation_yearly,'Yearly Precp. Collection')

var reduceforAOI_yearly = precipitation_yearly.map(function(img) {
  var precpSum = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: aoi,
    scale: 1000 
  }).get('precipitationCal_sum');
  return ee.Feature(null, {
    'year': img.get('year'),
    'sum_precp': precpSum
  });
});
print(reduceforAOI_yearly,'Yearly TS')


Export.table.toDrive({
  collection:reduceforAOI_yearly, 
  description:'GPM_yrly', 
  folder:'Precp_GPM', 
  fileFormat:'csv', 
  selectors:['year','sum_precp']})

var chart = ui.Chart.feature.byFeature({
  features:reduceforAOI_yearly, 
  xProperty:'year', 
  yProperties:['sum_precp']})
  .setChartType('LineChart')
  .setOptions({
    title: 'Yearly Precipitation',
    hAxis: {title: 'Time (Year)'},
    vAxis: {title: 'Total Precipitation mm/year'}
  });
print(chart)
