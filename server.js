// express는 node.js에서 server 핸들러 중 가장 많이 사용되는 dependence
const express = require("express");
const server = express();
const dotenv = require("dotenv");
// const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const loginController = require("./server/client/login.controller");
const mainController = require("./server/client/main.controller");
const totalbidController = require("./server/client/totalbid.controller");
const datasearchController = require("./server/client/datasearch.controller");
const artistController = require("./server/client/artist.controller");
const artmarketController = require("./server/client/artmarket.controller");
const artmarketControllerNew = require("./server/client/artmarket.controller-new");
var LOGGER = require('./server/utils/logger')
var path = require('path')
const  {auth}  = require("./server/client/jwt");
var helmet = require('helmet')
var ipIdentify = require('./server/middlewares/ipIdentify')
server.use(express.json());
server.use(cookieParser());
const cors = require("cors");
dotenv.config(); //'./.env')


server.use(cors({ credentials: true, origin: "*" }));
server.use(express.json())
server.use(express.urlencoded({ extended: false }))
server.use(express.static(path.join(__dirname, 'server/public')))
server.use(helmet())
server.use(ipIdentify)

const host = process.env.HOST
const port = process.env.PORT
// logger
server.use((req, res, next) => {
  LOGGER.HTTP.request(req)
  next()
})
// Router
let uploadMulti = require('./server/utils/upload');
let authRouter = require('./server/admin/api/auth');
let excelRouter = require('./server/admin/api/export_excel');
let authorRouter = require('./server/admin/api/author');
let auctionRouter = require('./server/admin/api/auction_solution');
let companyRouter = require('./server/admin/api/auction_company');
let currencyRouter = require('./server/admin/api/curency');
let servicesRouter = require('./server/admin/api/hankyung');
//Client
server.post("/crawling/login", loginController.login);
server.post("/crawling/logout", loginController.logout);
server.get("/crawling/main", auth, mainController.main);
server.get("/crawling/main1", auth, mainController.mainTop);
server.post("/crawling/totalbid", auth, totalbidController.topRanker);
server.post("/crawling/totalbid-export", auth, totalbidController.exportExcelTotalBid);
server.post("/crawling/search", auth, datasearchController.dataSearch);
server.post("/crawling/export-excel-datasearch", auth, datasearchController.exportExcel);
server.get("/crawling/artist", auth, artistController.main);
server.post("/crawling/winning-rate-and-bid", auth, artistController.getWinningRateAndWinningBid);
server.post("/crawling/artmarket", auth, artmarketControllerNew.Main);
server.get("/crawling/auto-complete-artist", auth, artistController.autoCompleteArtistSearch);
server.post("/crawling/new-artist", auth, artistController.newMain);
server.post("/crawling/level2-filters", auth, artistController.getLevel2Filters);

// server.get("/crawling/new-art-market", auth, artmarketController.newMain);



const { PREFIX } = process.env
server.use(`${PREFIX}`,uploadMulti)
server.use(`${PREFIX}/auth`, authRouter)
server.use(`${PREFIX}/excel`, excelRouter)
server.use(`${PREFIX}/author`, authorRouter)
server.use(`${PREFIX}/auction`, auctionRouter)
server.use(`${PREFIX}/company`, companyRouter)
server.use(`${PREFIX}/currenry`, currencyRouter)
server.use(`/invoke-api`, servicesRouter);

server.use((req, res) => {
  res.status(404).send({
    result: false,
    message: `${req.url} not found!`
  })
})

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is listening on ${host}:${port}`)
});
