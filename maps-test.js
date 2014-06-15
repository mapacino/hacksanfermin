
/* MAPA DEL RECORRIDO DEL ENCIERRO PARA POSICIONAR PERIODISTAS */
var pamplona = {lat: 42.81813, lon: -1.643863};
var map = L.map('mappamplona', {minZoom: 15, maxZoom: 18, attributionControl: false})
            .setView([pamplona.lat, pamplona.lon], 16);

//L.control.attribution().addTo(map);
// Ajustar mapa a coordenadas
// toner, toner-lite, toner-background, toner-lines
var toner = new L.StamenTileLayer("toner").addTo(map);

var svg = d3.select(map.getPanes().overlayPane)
        //.style("margin-top", "-18px")
        //.style("margin-left", "-40px")
        .append("svg")
        .attr("width", $("#mappamplona").width())
        .attr("height", $("#mappamplona").height()),
    // mala elección de nombre, cambiar
    svgg = svg.append("g").attr("class", "leaflet-zoom-hide");

var color = d3.scale.linear().domain([5,20]).range(['red', 'blue']);
var colorevento = d3.scale.ordinal()
    .domain(["Chupinazo", "Encierro", "Pobre"])
.range(["#CFFFDD ", "#FF1F4C ", "#5C5863 "]);
var cxevento = d3.scale.ordinal()
    .domain(["Chupinazo", "Encierro", "Pobre"])
    .range([350, 400, 450]);

var bolasfijas = svg.selectAll(".bolafija")
            .data([{cx: 350, ev: "Chupinazo"},
                  {cx: 400, ev: "Encierro"},
                  {cx: 450, ev: "Pobre"}])
            .enter()
            .append("circle")
            .attr("class", "bolafija")
            .attr("cx", function(d) {return cxevento(d.cx)})
            .attr("cy", 40)
            .attr("r", 24)
            .attr("fill", function(d) {return colorevento(d.ev)});


// Pasar longitud y latitud al svg, pero es sensible al zoom
translonlat = function(lon, lat) {
    return map.latLngToLayerPoint(new L.LatLng(lat, lon));
};
//console.log(translonlat(-3.7101648, 40.4119956));

var colores, grupos=[], grows=[], gpol = [], gorigs;
d3.csv("data/posiciones.csv", function(d) {
    return {
        grupo: d.grupo,
        tipo: d.tipo,
        lugar: d.address,
        lat: +d.lat,
        lon: +d.lon,
        proy: translonlat(+d.lon, +d.lat),
    };

}, function(rows) {
    //console.log(rows);

    grupos = d3.keys(d3.set( rows.map(function(d) {return d.grupo;}) )).slice();
    colores = d3.scale.category10().domain(d3.extent(grupos));

    grows = rows;
    addd3points2(svg, map, "toros"); // Pasar a Zooom

});


/* Dibujar grupos de polígonos para probar*/

function plotZones(z) {

    var dg = grows.filter(function(d) {
            return d.grupo==z;
    }).slice();
    //console.log(dg[0].tipo);
    var tipo = dg[0].tipo;
/*
    switch(tipo) {
        case "line":
            gpol.push( L.polyline(dg.map(function(d) {return [d.lat, d.lon]}),
                                 {color: colores(z), smoothFactor: 0.5})
                            .addTo(map) );
            break;
        case "poligono":
            gpol.push( L.polygon(dg.map(function(d) {return [d.lat, d.lon]}),
                                {color: colores(z), smoothFactor: 0.5})
                .addTo(map)
                     );

            break;
        default:
            //default code block
    }
    */
}


function addd3points(svgelem, mapelem, clase, points) {
    translonlat = function(lon, lat) {
        return mapelem.latLngToLayerPoint(new L.LatLng(lat, lon));
    };

    svgelem.selectAll("." + clase).remove();
    svgelem.selectAll("." + clase)
            .data(points)
            .enter()
            .append("circle")
            .attr("class", clase)
            .attr("cx", function(d) {return translonlat(d[0], d[1]).x;})
            .attr("cy", function(d) {return translonlat(d[0], d[1]).y;})
            .attr("r", 3)
            .style("fill", "red");
    /*
    svgelem.append("image").attr("id","torero").attr("xlink:href", "torero.svg")
        .attr("width", "20%").attr("height", "20%")
        .attr("x", translonlat(-1.639339, 42.815837).x)
        .attr("y", translonlat(-1.639339, 42.815837).y)
    ;
    */
}

map.on('viewreset', function() {
   var zoom = this.getZoom();
    svg.selectAll(".per").remove();

    translonlat = function(lon, lat) {
        return map.latLngToLayerPoint(new L.LatLng(lat, lon));
    };

    svg.select("#torero").remove();
    svg.select("#toro1").remove();
    svg.select("#toro2").remove();


    svg.append("image").attr("id","torero").attr("xlink:href", "torero.svg")
        .attr("width", "25%").attr("height", "25%")
        .attr("x", translonlat(-1.640599, 42.817037).x)
        .attr("y", translonlat(-1.640599, 42.817037).y)
    ;

    svg.append("image").attr("id","toro1").attr("xlink:href", "toro.svg")
    .attr("width", "10%").attr("height", "10%")
    .attr("x", translonlat(-1.64563, 42.821023).x)
    .attr("y", translonlat(-1.64563, 42.821023).y)
    ;

    svg.append("image").attr("id","toro2").attr("xlink:href", "toro.svg")
    .attr("width", "20%").attr("height", "20%")
    .attr("x", translonlat(-1.64673, 42.821023).x)
    .attr("y", translonlat(-1.64673, 42.821023).y)
    ;


}, map);

var width = $("#webs").width(), height = 300, fotosdata = [];
var nrow = 10, ncol = 20;
var fotowidth = width/ncol, fotoheight = height/nrow;
var svgfotos = d3.select("#webs").append("svg")
        .attr("width", width)
        .attr("height", height);

var gperiod = [];
d3.csv('data/master-periodistas-final-2.csv', function(d,i) {
    return {
        seq: i,
        id: d.id,
        nombre: d.nombre,
        medio: d.medio,
        url: d.url,
        imgf: d.img != "" ? "webimg/" + d.img + ".png" : undefined,
        pais: d.pais,
        ccaa: (d.pais=="españa" && d.cautonoma != "" ? d.cautonoma : undefined),
        d7:  (d.dia7 =="S" ? d.dia7 : undefined),
        d8:  (d.dia8 =="S" ? d.dia8 : undefined),
        d9:  (d.dia9 =="S" ? d.dia9 : undefined),
        d10: (d.dia10=="S" ? d.dia10 : undefined),
        d11: (d.dia11=="S" ? d.dia11 : undefined),
        d12: (d.dia12=="S" ? d.dia12 : undefined),
        d13: (d.dia13=="S" ? d.dia13 : undefined),
        d14: (d.dia14=="S" ? d.dia14 : undefined),
        lugenc: d["lugar"] != "" ? d["lugar"] : undefined,
        lugchu: d["lugar.c"] != "" ? d["lugar.c"] : undefined,
        lugpob: d["lugar.p"] != "" ? d["lugar.p"] : undefined,
    }

}, function(period) {
    console.log(period);
    gperiod = period;


    var ii=0, jj=0;
    gperiod.forEach(function(d,i){
        if (gperiod[i].imgf != undefined) {
            gperiod[i].fx = jj;
            gperiod[i].fy = ii;
            jj++;
            if (jj>ncol) {
                ii++;
                jj=0;
            }
        } else {
            gperiod[i].fx = undefined;
            gperiod[i].fy = undefined;
        }
    });

    var fotos = svgfotos.selectAll(".fotos")
        .data(gperiod.filter(function(d) {return d.imgf != undefined;}))
        .enter()
        .append("image")
        .attr("class", "fotos")
        .attr("id", function(d) {return "f" + d.seq;})
        .attr("x", function(d) {return d.fx*fotowidth;})
        .attr("y", function(d) {return d.fy*fotoheight;})
        .attr("width", fotowidth)
        .attr("height", fotoheight)
        .style("opacity", 1)
        .attr("xlink:href", function(d) {return d.imgf;});

    svgfotos.selectAll(".fotos")
        .on("click", function(d) {
            d3.select("#fotobig").html("<a href='" + d.url +
                                       "' target='_blank'>" + d.medio + "</a>");
        });

});

/* MAPA DEL MUNDO, PARA EL ORIGEN DE LOS PERIODISTAS */
var mapm = L.map('mapworld', {minZoom: 1, maxZoom: 20, attributionControl: false})
            .setView([pamplona.lat - 20, pamplona.lon], 1);
var tonerm = new L.StamenTileLayer("toner-background").addTo(mapm);


d3.csv("data/origenes.csv", function(d) {
    return {
        lugar: d.pais,
        n: +d.Freq,
        lon: +d.lon,
        lat: +d.lat
    };
}, function(origs) {
    //console.log(origs);
    gorigs = origs;

    for (var i=0; i< gorigs.length; i++) {
        //console.log(gorigs[i]);
        //L.marker([gorigs[i].lat, gorigs[i].lon]).addTo(mapm)
        //    .bindPopup(gorigs[i].lugar + ": " + gorigs[i].n);
        L.polyline([[gorigs[i].lat, gorigs[i].lon],
                    [pamplona.lat, pamplona.lon]],
                   {color: 'steelblue', weight: 3, opacity: 0.7}).addTo(mapm)
            .bindPopup(gorigs[i].lugar + " (<strong>" + gorigs[i].n + "</strong>)");
    }
});

