var ctx = { 
  dataFile: "digitalAlbumSales.csv",
  singerFilter : '',
  scaleType : 'log',
  w:800,
  h:700,
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
    createAlbumScatterPlot('log', '');
    createSalesBoxPlot();
};

/* create the scatter plot of all the albums */
var createAlbumScatterPlot = function(scaleType, singerFilter){
    /* scatterplot: sales vs. price
    showing release date using color,
    showing the gender of singer using shape,
    sync'ed with 3 line bars chart at right (brushing and linking) */
    var vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
        "data": {
            "url": ctx.dataFile,
        },
        "transform": [
            {"filter": {"field": "releaseDate", "type": "temporal",
            "timeUnit": "year", "gte": ctx.MIN_YEAR}},
            {"filter": {"field": "price", "lte": ctx.MAX_PRICE}},
            {"filter": {"field": "totalSales", "gte": ctx.MIN_SALES}},
        ],
        "spacing": 100,
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
                                "field": "totalSales",
                                "type": "quantitative",
                                "axis":{"title": null},
                                "scale": {"type": scaleType}
                            },
                            "color":{
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
                                "mark": "point",
                                "width":ctx.w - 1,
                                "height": ctx.h,
                                "selection": {"albumBrush": {"type": "single"}},
                                "encoding": {
                                    "x": {
                                        "field": "releaseDate",
                                        "type": "temporal",
                                        "timeUnit": "yearmonthdate",
                                        "axis":{"title": "Release Date"}
                                    },
                                    "y": {
                                        "field": "totalSales",
                                        "type": "quantitative",
                                        "axis":{"title": "Sales (CNY)"},
                                        "scale": {"type": scaleType}
                                    },
                                    "stroke": {"value": null},
                                    "size": {"value": 30},
                                    "shape": {"type": "nominal", "field": "singerGender",
                                              "scale": {
                                                "domain":["male","female"],
                                                "range":["square","circle"],
                                              },
                                              "legend": {
                                                  "title": "Singer Gender",
                                                  "orient":"none",
                                                  "legendX":1000
                                              }
                                            },
                                    "fill": {
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
                                                "legendX":1000,
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
                                        {"field": "totalSales", "type": "nominal", "title":"Sales (CNY)"},
                                        {"field": "releaseDate", "type":"temporal", "timeUnit": "yearmonthdate","title":"Release Date"}
                                    ]
                                }
                            },
                            {
                                "mark":"area",
                                "height":ctx.h1,
                                "width":ctx.w,
                                "selection": {"timeBrush": {"encodings":["x"],"type": "interval"}},
                                "transform": [
                                            {"sort": [{"field": "releaseDate"}],
                                            "window": [{"field": "totalSales", "op": "sum", "as": "cumulative_sales"}],
                                            "frame": [null, 0]}],
                                "encoding": {
                                    "x": {
                                      "timeUnit": "yearmonthdate", 
                                      "field": "releaseDate",
                                      "type": "temporal",
                                      "axis":{"title": null}
                                    },
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
                        ]
                    }
                ]
            }
            ,
            {
                "width":200,
                "height":ctx.h,
                "mark": "bar",
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
                    "color":{
                        "field":"platform",
                        "type": "nominal",
                        "scale": {"scheme": "platformColors"},
                        "legend":{"title":"Platform"}
                    },
                    "tooltip": [
                        {"field": "platform", "type": "nominal", "title":"Music Platform"}
                    ]
                }
            }
        ]
    };
    console.log(singerFilter)
    if (singerFilter != ""){
        vlSpec.transform.push({"filter": {"field": "singer", "oneOf": singerFilter.split(",")}});
    }
    var vlOpts = {actions:true};
    vegaEmbed("#albumScat", vlSpec, vlOpts);
    console.log('Update scatter plot, scale type:' + scaleType + ', singer:' + singerFilter);
};

/* create the box plot of the annual sales */
var createSalesBoxPlot = function(){
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

/* update the scatter plot when we made some changes */
var updateScatterPlot = function(){
    createAlbumScatterPlot(ctx.scaleType, ctx.singerFilter);
};

