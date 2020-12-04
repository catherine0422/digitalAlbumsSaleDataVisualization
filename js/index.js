var ctx = { 
  dataFile: "digitalAlbumSales.csv",
  singerFilter : '',
  selectedYear: 'all',
  scaleType : 'log',
  scaleType2: 'linear',
  w:800,
  h:600,
  h1:100,
  w1:50,
  MIN_YEAR: 2014,
  MAX_PRICE: 30,
  MIN_SALES: 100,
  GRAY:"#636363",
  PLATFORM_COLORS: ['#cab2d6', '#fdbf6f', '#b2df8a', '#386cb0','#bf5b17']
}

/* initialization of all the graphics */
var createViz = function(){
    vega.scheme("platformColors", ctx.PLATFORM_COLORS);
    createAlbumScatterPlot('log', '', 'all');
    createSalesBoxPlot('linear');
};

/* create the scatter plot of all the albums */
var createAlbumScatterPlot = function(scaleType, singerFilter, selectedYear){
    /* scatterplot: sales vs. price
    showing release date using color,
    showing the gender of singer using shape,
    sync'ed with 3 bars on left, bottom and right (brushing and clicking) */
    var vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
        "data": {
            "url": ctx.dataFile,
        },
        "transform": [
            {"filter": {"field": "releaseDate", "type": "temporal",
            "timeUnit": "year", "gte": ctx.MIN_YEAR}},
            {"filter": {"field": "price", "lte": ctx.MAX_PRICE}},
            {"filter": {"field": "sales", "gte": ctx.MIN_SALES}},
        ],
        "spacing": 60,
        "hconcat": [
            {
                "hconcat":[
                    {
                        "height": ctx.h,
                        "width":ctx.w1,
                        "selection": {"salesBrush": {"encodings":["y"],"type": "interval"}},
                        "mark":{
                            "type":"tick",
                            "orient":"vertical"
                        },
                        "encoding": {
                            "y": {
                                "field": "sales",
                                "type": "quantitative",
                                "axis":{"title": null},
                                "scale": {"type": scaleType}
                            },
                            "color":{
                                "condition":{
                                    "selection":"salesBrush",
                                    "field": "price",
                                    "type": "quantitative",
                                    "scale": {
                                        "scheme": {"name":"reds","extent": [0.3,1.3]},
                                    },
                                    "legend": null,
                                },
                                "value":ctx.GRAY
                            }
                        }
                    },
                    {   
                        "vconcat":[
                            {
                                "transform": [
                                    {"filter": {"selection": "timeBrush"}},
                                    {"filter": {"selection": "salesBrush"}}
                                ],
                                "width":ctx.w - 1,
                                "height": ctx.h,
                                "layer":[
                                    {  
                                        "title": {
                                            "text": "Number of albums:",
                                            "anchor": "start",
                                            "color":{"value":"#ad494a"},
                                            "dx":ctx.w - 100,
                                            "dy":ctx.h + 57,
                                            "fontSize":16
                                        },
                                        "mark":{
                                            "type":"text",
                                            "xOffset":ctx.w/2 - 30,
                                            "yOffset":ctx.h/2 + 40,
                                            "align": "left",
                                            "fontWeight":"bold",
                                            "fontSize":16
                                        },
                                        "encoding":{
                                            "text":{
                                                "aggregate":"count"
                                            },
                                            "color":{"value":"#ad494a"}
                                        }
                                    },{
                                        "mark": "point",
                                        "selection": {
                                            "albumBrush": {"type": "single"},
                                            "albumHover": {
                                                "type": "multi",
                                                "on": "mouseover", "empty": "none"
                                            }
                                        },
                                        "encoding": {
                                            "x": {
                                                "field": "releaseDate",
                                                "type": "temporal",
                                                "timeUnit": "yearmonthdate",
                                                "axis":{"title": "Release Date", "format":"%b %Y"}
                                            },
                                            "y": {
                                                "field": "sales",
                                                "type": "quantitative",
                                                "axis":{"title": "Sales (CNY)"},
                                                "scale": {"type": scaleType}
                                            },
                                            "size": {
                                                "condition":{
                                                    "selection":"albumHover","value":200
                                                },
                                                "value": 30
                                            },
                                            "shape": {"type": "nominal", "field": "singerGender",
                                                      "scale": {
                                                        "domain":["male","female"],
                                                        "range":["square","circle"],
                                                      },
                                                      "legend": {
                                                          "title": "Singer Gender",
                                                          "orient":"none",
                                                          "legendX":985
                                                      }
                                                    },
                                            "color": {
                                                "condition":{
                                                    "selection":"albumBrush",
                                                    "field": "price",
                                                    "type": "quantitative",
                                                    "scale": {
                                                        "scheme": {"name":"reds","extent": [0.3,1.3]},
                                                    },
                                                    "legend": {
                                                        "title": "Price",
                                                        "orient":"none",
                                                        "legendX":825,
                                                        "legendY": 60,
                                                        "tickCount":4,
                                                        "gradientLength":200
                                                    },
                                                },
                                                "value": "lightgray"
                                            },
                                            "tooltip": [
                                                {"field": "album", "type": "nominal", "title":"Album"},
                                                {"field": "singer", "type": "nominal", "title":"Singer"},
                                                {"field": "sales", "type": "nominal", "title":"Sales (CNY)"},
                                                {"field": "releaseDate", "type":"temporal", "timeUnit": "yearmonthdate","title":"Release Date"}
                                            ]
                                        },
                                    }
                                ],
                            },
                            {
                                "height":ctx.h1,
                                "width":ctx.w,
                                "transform": [
                                            {"sort": [{"field": "releaseDate"}],
                                            "window": [{"field": "sales", "op": "sum", "as": "cumulative_sales"}],
                                            "frame": [null, 0]}],
                                "encoding": {
                                    "x": {
                                      "timeUnit": "yearmonthdate", 
                                      "field": "releaseDate",
                                      "type": "temporal",
                                      "axis":{"title": null, "format":"%b %Y"}
                                    }
                                },
                                "layer":[
                                    {
                                        "mark":"area",
                                        "selection": {"timeBrush": {"encodings":["x"],"type": "interval"}},
                                        "encoding":{
                                            "y": {
                                                "field": "cumulative_sales",
                                                "type":"quantitative",
                                                "axis":{"title": "Cumulative Sales"}
                                              },
                                              "color":{
                                                  "value":ctx.GRAY
                                              }
                                        }
                                    },
                                    {
                                        "mark":"line",
                                        "transform":[{"fold":["QQ","WYY","KUWO","KUGOU","MIGU"],
                                                     "as":["platform","platformSales"]},
                                                    {"sort": [{"field": "releaseDate"}],
                                                     "window": [{"field": "platformSales", "op": "sum", "as": "plateformCumulativeSales"}],
                                                     "groupby":["platform"],
                                                     "frame": [null, 0]}],
                                        "encoding":{
                                            "y":{
                                                "field":"plateformCumulativeSales",
                                                "type":"quantitative"
                                            },
                                            "color":{
                                                "field":"platform",
                                                "type": "nominal",
                                                "scale": {"scheme": "platformColors"},
                                                "legend":null
                                            },
                                        }
                                    }
                                ]
                            },
                        ]
                    }
                ]
            }
            ,
            {
                "width":200,
                "height":ctx.h,
                "title": {
                    "text": "Proportion of sales in different music platforms",
                    "anchor": "start"
                },
                "transform":[
                    {"filter": {"selection": "timeBrush"}},
                    {"filter": {"selection": "salesBrush"}},
                    {"filter": {"selection": "albumBrush"}},
                    {"fold":["QQ","WYY","KUWO","KUGOU","MIGU"],
                    "as":["platform","platformSales"]}
                ],
                "encoding": {
                    "x": {
                    "field": "platform",
                    "axis":{
                        "title": "Music Platform",
                        "labelAngle":0
                        }
                    },
                    "y": {
                    "field":"platformSales",
                    "aggregate":"sum",
                    "axis":{"title": "Sales of one platform"}
                    },
                    "tooltip": [
                        {"field": "platform", "type": "nominal", "title":"Music Platform"}
                    ]
                },
                "layer":[
                    {
                        "mark":"bar",
                        "encoding":{
                            "color":{
                                "field":"platform",
                                "type": "nominal",
                                "scale": {"scheme": "platformColors"},
                                "legend":{"title":"Platform"}
                            },
                        }
                    },
                    {
                        "mark":{
                            "type":"text",
                            "dy":- 8
                        },
                        "encoding": {
                            "text": {
                                "aggregate": "sum",
                                "field":"platformSales",
                                "type": "quantitative",
                            },
                        }
                    }
                ]
            }
        ]
    };
    console.log(singerFilter)
    if (singerFilter != ""){
        vlSpec.transform.push({"filter": {"field": "singer", "oneOf": singerFilter.split(",")}});
    }
    if (selectedYear != "all"){
        var year = parseInt(selectedYear);
        vlSpec.transform.push({"filter": {"field": "releaseDate", "timeUnit": "year", "equal": year}});
    }
    var vlOpts = {actions:false};
    vegaEmbed("#albumScat", vlSpec, vlOpts);
};

/* create the box plot of the annual sales */
var createSalesBoxPlot = function(scaleType){
    vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
        "data": {
            "url": ctx.dataFile,
        },
        "transform": [
            {"filter": {"field": "releaseDate", "type": "temporal",
            "timeUnit": "year", "gte": ctx.MIN_YEAR}},
            {"filter": {"field": "price", "lte": ctx.MAX_PRICE}},
            {"filter": {"field": "sales", "gte": ctx.MIN_SALES}},
            {"timeUnit": "year", "field": "releaseDate", "as": "year"},
            {"joinaggregate": [{
                "op": "count",
                "as": "albumCount"
              }],
              "groupby":["year"]
            }
        ],
        "mark": "boxplot",
        "encoding": {
            "x": {
                "field": "releaseDate",
                "type": "temporal",
                "timeUnit":"year",
                "axis": {
                    "title": "Release Year",
                }
            },
            "y": {
                "field": "sales",
                "type": "quantitative",
                "scale": {"type": scaleType,"zero": false}
            },
            "color":{
                "field":"albumCount",
                "type":"quantitative",
                "legend":{
                    "title":"Number of albums"
                }
            }
        }
    };
    vlOpts = {width:600,height:400,actions:false};
    vegaEmbed("#salesBoxPlot", vlSpec, vlOpts);
};

/* handle the key event for singer filtering */
var handleKeyEvent = function(e){
    if (e.keyCode === 13){
        // enter
        e.preventDefault();
        filterSinger();
    }
};

/* fiter the data by singer */
var filterSinger = function(){
    var singer = document.querySelector('#filter').value;
    ctx.singerFilter = singer;
    updateScatterPlot();
};

/* set the scale of the scatter plot */
var setScale = function(){
    ctx.scaleType = document.querySelector('#scaleSel').value;
    updateScatterPlot();
};

/* select the year of the scatter plot */
var setYear = function(){
    ctx.selectedYear = document.querySelector('#yearSel').value;
    updateScatterPlot();
};

/* update the scatter plot when we made some changes */
var updateScatterPlot = function(){
    createAlbumScatterPlot(ctx.scaleType, ctx.singerFilter, ctx.selectedYear);
    console.log('Update scatter plot, scale type:' + ctx.scaleType + ', singer:' + ctx.singerFilter + ', year:' + ctx.selectedYear);
};

/* set the scale of the box plot */
var setScale2 = function(){
    ctx.scaleType2 = document.querySelector('#scaleSel2').value;
    createSalesBoxPlot(ctx.scaleType2);
};

