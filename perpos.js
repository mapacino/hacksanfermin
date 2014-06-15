/* POSICIONAR PERIODISTAS */

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]

function isPointInPoly(poly, pt){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}

function perposition(perdata, evento) {
    // Dados los datos del periodista y el luegar donde hay que colocarlo
    // generar el punto. Necesita los polígonos que definen las zonas
    // cargados en grows
    // Ej. perposition(gperiod[0], "Chupinazo")

    var polz = [], rndvallado = Math.floor(Math.random()*3) + 1;

    // Polígonos para el evento
    switch(evento) {
        case "Chupinazo":
            //console.log("Chupinazo");
            if (perdata.lugchu=="CASA CONSISTORIAL") {
                polz = grows.filter(function(d) {return d.grupo=="Ayuntamiento"});
            } else if (perdata.lugchu == "CASA SEMINARIO") {
                polz = grows.filter(function(d) {return d.grupo=="Casa seminario"});
            }
            //map.setZoom(18);
            break;
        case "Encierro":
            if (perdata.lugenc=="CASA CONSISTORIAL") {
                polz = grows.filter(function(d) {return d.grupo=="Ayuntamiento"});
            } else if (perdata.lugenc=="CASA SEMINARIO") {
                polz = grows.filter(function(d) {return d.grupo=="Casa seminario"});
            } else if (perdata.lugenc=="VALLADO") {
                console.log("here");
                polz = grows.filter(function(d) {return d.grupo=="vallado" + rndvallado});
            }
            //map.setZoom(17);
            break;
        case "Pobre":
            if (perdata.lugpob=="CASA CONSISTORIAL") {
                polz = grows.filter(function(d) {return d.grupo=="Ayuntamiento"});
            } else if (perdata.lugpob == "CASA SEMINARIO") {
                polz = grows.filter(function(d) {return d.grupo=="Casa seminario"});
            } else if  (perdata.lugpob == "PLAZA CONSISTORIAL") {
                polz = grows.filter(function(d) {return d.grupo=="Plaza Consistorial"});
            }
            //map.setZoom(18);
            break;
        //default:
    //        break;
    }
    //console.log(polz);
    var xe = d3.extent(polz, function(d) {return d.lon});
    var ye = d3.extent(polz, function(d) {return d.lat});
    return { lon: xe[0] + Math.random()*(xe[1]-xe[0]),
             lat: ye[0] + Math.random()*(ye[1]-ye[0])} ;
}

/// PRUEBA COLOCACIÓN PERIODISTAS EN CHUPINAZO Y POBRE DE MÍ
plotEvento = function(evento, dia) {
    var per = [];
    switch(evento) {
        case "Chupinazo":
            per = gperiod.filter(function(d) {return d.lugchu !== undefined}).slice();
            break;
        case "Encierro":
            per = gperiod.filter(function(d) {return d.lugenc !== undefined &&
                d["d" + dia] == "S"}).slice();
            break;
        case "Pobre":
            per = gperiod.filter(function(d) {return d.lugpob !== undefined}).slice();
            break;
    }
    translonlat = function(lon, lat) {
        return map.latLngToLayerPoint(new L.LatLng(lat, lon));
    };

    per.forEach(function(d,i) {
        per[i].pos = perposition(d, evento);
        //console.log( per[i].pos );
        //L.marker([per[i].pos.lat, per[i].pos.lon])
        //    .addTo(map)
        //    .bindPopup(d.nombre + " de " + d.medio.toUpperCase() +
        //                   "<br>"  + d.pais +
        //                   (d.ccaa != undefined ? " (" + d.ccaa + ")" : "")
        //                   )
    });

    svg.selectAll(".per").remove();
    var perp = svg.selectAll(".per")
            .data(per)
            .enter()
            .append("circle")
            .attr("class", "per")
            .attr("cx", cxevento(evento))
            .attr("cy", 40)
            .attr("r", 15)
            .style("stroke-width", 0)
            .style("fill", colorevento(evento))
            .style("opacity", 0.1)
        .transition()
            .duration(3000)
            .delay(function(d, i) {return i*10})
            .attr("cx", function(d) {return translonlat(d.pos.lon, d.pos.lat).x;})
            .attr("cy", function(d) {return translonlat(d.pos.lon, d.pos.lat).y;})
            .attr("r", function(d) {return 3})
            .style("stroke", "black")
            .style("stroke-width", 0.5)
            .style("opacity", 0.8);

    svg.selectAll(".per").append("animateMotion")
            .attr("path", function(d) {return "M 0 0 V " + (Math.random()*10)  +" Z";})
            .attr("dur", function(d) {return Math.random() +"s"})
            .attr("repeatCount", "indefinite");


    svg.selectAll(".per")
        .style("cursor", "pointer")
        .on("mouseover", function(d,i) {
            var esto = d3.select(this),
                datesto = esto.datum();

            console.log(datesto);
            console.log(  d.nombre + "<br>" + d.medio + "<br" );
            var toolti = d3.select("#toolti")
                .html( d.nombre + "<br>" +
                      "<href =" +  d.url + " target='_blank'>" + d.medio.toUpperCase() +
                      "</a><br>" +
                      d.pais + (d.ccaa != undefined ? " (" + d.ccaa + ")" : "") +
                      "<br>" + "Total " + per.length + " periodistas"
                     )
                .attr("class", "one")
                .attr("height", 300)
            .style("overflow-y", "scroll")
                
                
            ;


            })
            .on("mouseout", function(d,i) {
                //var toolti = d3.select("#toolti")
                //    .html( "" );


            });

}

/*
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
*/
