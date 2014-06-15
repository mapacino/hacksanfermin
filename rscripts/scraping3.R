## Captura de pantalla de las web

library(RSelenium)
library(httr)
library(RCurl)
mm <- read.csv("medios-2-copia.csv", stringsAsFactors=FALSE)
#mm[, "img"] <- ""
webimgdir <- "webscreen"
urls <- unique(subset(mm, url!="")$url)

RSelenium::checkForServer()
RSelenium::startServer()

remDr <- remoteDriver(browserName="phantomjs")
remDr$open()
remDr$setWindowSize(900, 600)
#remDr$navigate("http://www.google.com")


for (i in 201:210) {   
    cat(paste(i, urls[i], " ", i, " de ", length(urls)))

    remDr$navigate(urls[i])
    ##remDr$maxWindowSize()
    ##kk <- remDr$findElement(using = "xpath", "//")
    
    #remDr$executeScript('document.body.style.zoom="120%"', args=list())
    b64out <- remDr$screenshot()
    fname <- sprintf("w%04d", i)

    writeBin(base64Decode(b64out, "raw"), paste0(webimgdir, "/", fname, ".png"))
    cat(urls[i], "\t", fname, "\n")
    
    mm[mm$url==urls[i], "img"] <- fname
    
    write.csv(mm, "medios-2-copia.csv", row.names=FALSE)
}

remDr$close()

## mogrify -crop x600+0+0 *.png
## mogrify -resize 150x100 *.png