## Tratamiento archivo periodistas con acreditación
## - Se recogen los tres eventos
## - Se consolidan identidades y ubicaciones

library(XLConnect)
library(plyr)
library(reshape2)
library(stringr)

periol <- list()
medios <- c()
paises <- c()

#readWorksheetFromFile("data/Corredores-169.xls", sheet="2013")

for (i in c("chupinazo", "encierro", "Pobre de Mi")) {
    periol[[i]] <- readWorksheetFromFile("data/Periodistas-166-paises.xls", 
                                             sheet=i)
    periol[[i]]$evento <- i
    colnames(periol[[i]]) <- tolower(colnames(periol[[i]]))
    mc <- grep("medio", colnames(periol[[i]]))
    colnames(periol[[i]])[mc] <- "medio"
    periol[[i]]$medio <- tolower(periol[[i]]$medio)
    medios <- c(medios, periol[[i]]$medio)
    
    #periol[[i]]$pais <- gsub(" ", "", periol[[i]]$pais)
    #periol[[i]]$pais <- gsub("[[:blank:]]*", "", periol[[i]]$pais)
    #periol[[i]]$pais <- str_replace_all(tolower(periol[[i]]$pais),
    #                                               "[[:blank:]]", "")
    periol[[i]]$pais <- tolower(periol[[i]]$pais)    
    paises <- c(paises, periol[[i]]$pais)
    periol[[i]] <- subset(periol[[i]], anyo==2013)
    
}
sort(table(paises))

#write.csv(unique(medios), file="medios.csv", row.names=FALSE)
#write.csv(unique(paises), file="lugares.csv", row.names=FALSE)

## Intento matchear los periodistas en los distintos eventos
eident <- periol[["encierro"]]$identificador
cident <- periol[["chupinazo"]]$dni
pident <- periol[["Pobre de Mi"]]$identificador
table(cident %in% eident)
table(pident %in% eident)

pgorda <- list()
pgorda[["encierro"]] <- periol[["encierro"]][, c("identificador", "nombre", "medio",
                "lugar", "pais", "cautonoma", "evento", "dia7", "dia8", "dia9", "dia10", "dia11", "dia12",
                "dia13", "dia14")]
colnames(pgorda[["encierro"]])[1] <- "id"
pgorda[["encierro"]]$id <- as.character(pgorda[["encierro"]]$id)

pgorda[["chupinazo"]] <- periol[["chupinazo"]][, c("dni", "nombre", "medio",
                 "lugar", "pais", "cautonoma", "evento")]
colnames(pgorda[["chupinazo"]])[1] <- "id"
pgorda[["chupinazo"]]$id <- as.character(pgorda[["chupinazo"]]$id)

pgorda[["pobredemi"]] <- periol[["Pobre de Mi"]][, c("identificador", "nombre", "medio",
                 "lugar", "pais", "cautonoma", "evento")]
colnames(pgorda[["pobredemi"]])[1] <- "id"
pgorda[["pobredemi"]]$id <- as.character(pgorda[["pobredemi"]]$id)

### Fusionamos la información de los dos primeros eventos
master <- merge(pgorda[["encierro"]], 
            pgorda[["chupinazo"]][, c("id", "nombre", "medio", 
                        "lugar", "pais", "cautonoma", "evento")], 
            by="id", all=TRUE, suffixes=c("", ".c"))
## Completamos información principal
for (col in c("nombre", "medio", "pais", "cautonoma")) {
    master[, col] <- 
        ifelse(is.na(master[, col]), 
                     master[, paste0(col, ".c")], master[, col])
    
}
## Quitamos columnas tratadas, excepto lugar.c
for (col in c("nombre", "medio", "pais", "cautonoma", "evento")) {
    master[, paste0(col, ".c")] <- NULL 
}

## Fusionamos con Pobre de Mí
master1 <- merge(master, pgorda[["pobredemi"]][, c("id", "nombre", "medio", 
                        "lugar", "pais", "cautonoma", "evento")], 
            by="id", all=TRUE, suffixes=c("", ".p"))
for (col in c("nombre", "medio", "pais", "cautonoma")) {
    master1[, col] <- 
        ifelse(is.na(master1[, col]), 
                     master1[, paste0(col, ".p")], master1[, col])   
}
## Quitamos columnas tratadas, excepto lugar.c
for (col in c("nombre", "medio", "pais", "cautonoma", "evento")) {
    master1[, paste0(col, ".p")] <- NULL 
}
## Quitamos la columna de evento, basta con lugar para el encierro
master1$evento <- NULL
master2 <- subset(master1, id != "")

## Guardamos
master2$id <- as.character(master2$id)
master2$cautonoma <- ifelse(master2$cautonoma < 1, NA, master2$cautonoma)
write.csv(master2, file="master-periodistas.csv", row.names=FALSE, na="")

## No coinciden por incidencias variadas, habrá que consolidar esto
length(unique(master2$id))
nrow(master2)

master <- read.csv("master-periodistas.csv", stringsAsFactors=FALSE)
dups <- duplicated(with(master, paste0(id, nombre)))
masternd <- master[!dups, ]
write.csv(masternd, file="master-periodistas-nd.csv", row.names=FALSE, na="")

## Vamos a coger el medio al que pertenece y la imagen
master <- read.csv("master-periodistas-nd.csv", stringsAsFactors=FALSE)
medios <- read.csv("medios-2-copia.csv", stringsAsFactors=FALSE)
master[, c("medioo", "url", "img")] <- ""

for (i in 1:nrow(master)) {
    #i <- 1
    mi <- grep(master[i, "medio"], medios[, "medio"])
    master[i, c("medioo", "url", "img")] <- medios[mi[1], c("texto", "url", "img")]
}
write.csv(master, file="master-periodistas-nd.csv", row.names=FALSE, na="")

## Genero diccionario geocoding
master <- read.csv("master-periodistas-nd.csv", stringsAsFactors=FALSE)

lugares <- as.data.frame(with(subset(master, pais !=""), table(pais)))
lugares$pais <- as.character(lugares$pais)
lugares[, c("lon", "lat")] <- NA

master$cautonoma <- recode(master$cautonoma, 
    "'2'='Aragón'; 
     '3'='Asturias'; 
     '6'='Cantabria';
     '8'='Castilla y León';
     '9'='Cataluña';
    '13'='Madrid';
    '16'='Navarra';
    '18'='C. Valenciana';
    '19'='País Vasco';
    else=NA")

write.csv(master, file="master-periodistas-final.csv", row.names=FALSE, na="")


master$cautonoma <- as.character(master$cautonoma)
table(master$cautonoma)
ccaas <- as.data.frame(with(subset(master, cautonoma !=""), table(cautonoma)))
ccaas[, c("lon", "lat")] <- NA
colnames(ccaas) <- c("pais", "Freq", "lon", "lat")

lugares <- rbind(lugares, ccaas)
for (i in 1:nrow(lugares)) {
    if (is.na(lugares[i, "lon"])) {
        lugares[i, c("lon", "lat")] <- geocode(lugares[i, "pais"])
    }
}
write.csv(lugares, file="origenes.csv", na="")

#### resumenes
master <- read.csv("master-periodistas-final.csv", stringsAsFactors=FALSE)
medios2 <- read.csv("medios-2-copia.csv", stringsAsFactors=FALSE)

for (i in 1:nrow(master)) {
    im <- grep(master[i, "medio"], medios2$medio)[1]
    cat(im, "\n")
    master[i, "img"] <- medios2[im, "img"]
}
write.csv(master, file="master-periodistas-final-2.csv", na="", row.names=FALSE)
