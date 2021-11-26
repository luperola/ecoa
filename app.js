const express = require("express");
const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening server at ${port}`);
});
app.use(express.static(__dirname + "/public"));
app.use(express.json({ limit: "10mb" }));

const fs = require("fs");
const PDFParser = require("pdf2json");
const multer = require("multer");
const path = require("path");
var XMLWriter = require("xml-writer");
var AdmZip = require("adm-zip");

var fileOriginale, numeroFileSample;
// Uso multer per caricare file a scelta dalla mia directory. Solo pdf
const storageMultiple = multer.diskStorage({
  destination: function (req, file, cb) {
    //var dir = "public";
    var dir = __dirname;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    //cb(null, Date.now() + path.extname(file.originalname));
    cb(null, file.originalname + path.extname(file.originalname));
  },
});

const uploadMultiple = multer({
  storage: storageMultiple,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).array("image", 12);

// Set storage engine
const storage = multer.diskStorage({
  //destination: "public",
  destination: __dirname,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

//il nome in single("") deve essere identico al name dell'input
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("myFile");

// Check file Type
function checkFileType(file, cb) {
  const fileTypes = path.extname(file.originalname).toLowerCase();
  if (fileTypes == ".txt" || fileTypes == ".pdf") {
    return cb(null, true);
  } else {
    cb("Error: Pdf or txt files only !!!");
  }
}

// carico files pdf & txt (da HongIn.html), per pdf lo trasformo in sample.json, per txt lo copio come sample.txt
try {
  app.post("/upload", (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        console.log(err);
      }
      if (req.file == undefined) {
        res.redirect("index.html");
      } else {
        //fileUploadCheck = "File uploaded OK";
        fileOriginale = req.file.originalname;
        //console.log("fileUploadCheck", fileUploadCheck);
        var test = fileOriginale
          .substring(fileOriginale.length - 4)
          .toLowerCase();
        if (test === ".pdf") {
          const pdfParser = new PDFParser();
          pdfParser.on("pdfParser_dataError", (errData) =>
            console.error(errData.parserError)
          );
          pdfParser.on("pdfParser_dataReady", (pdfData) => {
            const id = __dirname + "/sample.json";
            fs.writeFile(id, JSON.stringify(pdfData), (err) =>
              console.error(err)
            );
            //res.json(pdfData);
          });
          pdfParser.loadPDF(__dirname + "/" + fileOriginale.toString());
        }
        if (test === ".txt") {
          const readTxtFile = fs.readFileSync(fileOriginale, "utf-8");
          //console.log("readTxtFile", readTxtFile);
          fs.writeFileSync("sample.txt", readTxtFile);
        }
        res.redirect("index.html");
        res.end();
        return;
      }
    });
  });
} catch (err) {
  console.log(err);
  return;
}

// Alimenta il contatore per 'shipmentNumber'
app.post("/api", (request, response) => {
  //const data = request.body;
  try {
    var prevCounter = fs.readFileSync("counter.txt", "utf8");
    //console.log(prevCounter);
    prevCounter++;
    fs.writeFileSync("counter.txt", prevCounter.toString());
    var afterCounter = fs.readFileSync("counter.txt", "utf8");
    //console.log(afterCounter);
  } catch (e) {
    console.log("Error:", e.stack);
  }
  response.json(afterCounter);
});

// Wacker data generator to populate xml
app.post("/apitwo", (req, res) => {
  const dataWacker = req.body;
  //console.log(dataWacker);
  xw = new XMLWriter(true);
  xw.startDocument("1.0", "UTF-8");
  xw.startElement("GasesShipment");
  xw.writeAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
  xw.writeAttribute(
    "xsi:noNamespaceSchemaLocation",
    "3GASC250_DM00608712_06.xsd"
  );
  xw.writeAttribute("MaterialCode", "3GASC250");
  xw.writeAttribute("SupplierHoldingDesc", "LINDE PLC");
  xw.writeAttribute("ReceivingStPlant", "Agrate");
  xw.writeAttribute("MpsSpecNo", "DM00608712_06");
  xw.writeAttribute("MpsSpecRev", "3.0");
  xw.writeAttribute("ShipmentDate", dataWacker.shipment);
  xw.writeAttribute("ShipmentNumber", dataWacker.shipmentNumber);
  xw.writeAttribute("ShipQty", 1);
  xw.startElement("Lot");
  xw.writeAttribute("SupplierSupplyChainSeqCode", "LINDE PLC-BURGHAUSEN-1585");
  xw.writeAttribute("ShipLotNo", dataWacker.lotNumber);
  xw.writeAttribute("ExpiryDate", dataWacker.expiryDate);
  xw.writeAttribute("MfgDate", dataWacker.manDate);
  xw.writeAttribute("LotQty", 1);
  xw.startElement("DIM_Carbon_dioxide_CO2");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", dataWacker.CO2value);
  xw.endElement();
  xw.endElement("DIM_Carbon_dioxide_CO2");
  xw.startElement("DIM_Carbon_monoxide_CO");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", dataWacker.COvalue);
  xw.endElement();
  xw.endElement("DIM_Carbon_monoxide_CO");
  xw.startElement("DIM_Iron_Fe");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", dataWacker.Fevalue);
  xw.endElement();
  xw.endElement("DIM_Iron_Fe");
  xw.startElement("DIM_Moisture_H2O");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", dataWacker.H2Ovalue);
  xw.endElement();
  xw.endElement("DIM_Moisture_H2O");
  xw.startElement("DIM_Nitrogen_N2 ");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", dataWacker.N2value);
  xw.endElement();
  xw.endElement("DIM_Nitrogen_N2 ");
  xw.startElement("DIM_Oxygen_plus_argon_O2_plus_Ar ");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", dataWacker.O2Arvalue);
  xw.endElement();
  xw.endElement("DIM_Oxygen_plus_argon_O2_plus_Ar ");
  xw.startElement("DIM_Total_hydrocarbon_as_CH4 ");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", dataWacker.CH4value);
  xw.endElement();
  xw.endElement("DIM_Total_hydrocarbon_as_CH4 ");
  xw.endDocument();

  try {
    fs.writeFileSync("sourcename.txt", "Wacker");
    fileToBeDownloaded = dataWacker.lotNumber.toString() + ".xml";
    res.json(xw.toString());
    fs.writeFileSync(fileToBeDownloaded, xw.toString());
    fs.writeFileSync("Wfilename.txt", fileToBeDownloaded);
  } catch (e) {
    console.log("Error:", e.stack);
  }
});

app.post("/apithree", (req, res) => {
  const dataCSPost = req.body;
  // console.log(dataCSPost);
  xw = new XMLWriter(true);
  xw.startDocument("1.0", "UTF-8");
  xw.startElement("GasesShipment");
  xw.writeAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
  xw.writeAttribute(
    "xsi:noNamespaceSchemaLocation",
    "3GASCD26_DM00822093_09.xsd"
  );
  xw.writeAttribute("MaterialCode", "3GASCD26");
  xw.writeAttribute("SupplierHoldingDesc", "LINDE PLC");
  xw.writeAttribute("ReceivingStPlant", "Agrate");
  xw.writeAttribute("MpsSpecNo", "DM00822093_09");
  xw.writeAttribute("MpsSpecRev", "1.0");
  xw.writeAttribute("ShipmentDate", dataCSPost.shipment);
  xw.writeAttribute("ShipmentNumber", dataCSPost.progressivoCS);
  xw.writeAttribute("ShipQty", 1);
  xw.startElement("Lot");
  xw.writeAttribute(
    "SupplierSupplyChainSeqCode",
    "LINDE PLC-S/ CHLORGAS - Bitterfeld-Wolfen-1784"
  );
  xw.writeAttribute("ShipLotNo", dataCSPost.lotNumber);
  xw.writeAttribute("ExpiryDate", dataCSPost.expiryDate);
  xw.writeAttribute("MfgDate", dataCSPost.shipment);
  xw.writeAttribute("LotQty", 1);
  xw.startElement("DIM_Carbon_dioxide_CO2");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", "1.8");
  xw.endElement();
  xw.endElement("DIM_Carbon_dioxide_CO2");
  xw.startElement("DIM_Carbon_monoxide_CO");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", "6.0");
  xw.endElement();
  xw.endElement("DIM_Carbon_monoxide_CO");
  xw.startElement("DIM_Iron_Fe");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", "0.4");
  xw.endElement();
  xw.endElement("DIM_Iron_Fe");
  xw.startElement("DIM_Methane_CH4 ");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", "0.8");
  xw.endElement();
  xw.endElement("DIM_Methane_CH4 ");
  xw.startElement("DIM_Moisture_H2O");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", "1.8");
  xw.endElement();
  xw.endElement("DIM_Moisture_H2O");
  xw.startElement("DIM_Nitrogen_N2 ");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", "2.0");
  xw.endElement();
  xw.endElement("DIM_Nitrogen_N2 ");
  xw.startElement("DIM_Oxygen_plus_argon_O2_plus_Ar ");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", "2.0");
  xw.endElement();
  xw.endElement("DIM_Oxygen_plus_argon_O2_plus_Ar ");
  xw.startElement("DIM_Hydrogen_H2 ");
  xw.startElement("RAW");
  xw.writeAttribute("VALUE", "5.0");
  xw.endElement();
  xw.endElement("DIM_Hydrogen_H2 ");
  xw.endDocument();

  try {
    fs.writeFileSync("sourcename.txt", "Chlorgas");
    var CSfileToBeDownloaded = dataCSPost.lotNumber;
    CSfileToBeDownloaded = CSfileToBeDownloaded.replace("/", "-");
    CSfileToBeDownloaded = CSfileToBeDownloaded + ".xml";
    var fileNameArray = dataCSPost.filetext;
    for (let index = 0; index < dataCSPost.filetext.length; index++) {
      fileNameArray[index] = fileNameArray[index].replace("/", "-");
      fileNameArray[index] = fileNameArray[index] + ".xml";
    }
    //console.log("file to be dw", fileNameArray);
    fs.writeFileSync(CSfileToBeDownloaded, xw.toString());
    fs.writeFileSync("filename.txt", "");
    for (let index = 0; index < dataCSPost.filetext.length; index++) {
      fs.appendFileSync(
        "filename.txt",
        "\n" + dataCSPost.filetext[index].toString()
      );
    }
  } catch (e) {
    console.log("Error:", e.stack);
  }
  var zip = new AdmZip();
  var numeroFileSample = fs.readFileSync("filename.txt", "utf-8");
  numeroFileSample = numeroFileSample.split("\n");
  var numeroFileSampleCS = numeroFileSample.shift();
  for (let index = 1; index < numeroFileSample.length; index++) {
    numeroFileSample[index] = numeroFileSample[index].replace("/", "-");
  }
  //console.log("numeroFileSampleArray", numeroFileSample);
  for (let index = 0; index < numeroFileSample.length; index++) {
    zip.addLocalFile(numeroFileSample[index]);
  }
  zip.writeZip(/*target file name*/ "files.zip");
  fs.writeFileSync("filename.txt", "");
});

app.get("/download", function (req, res) {
  var sourceName = fs.readFileSync("sourcename.txt", "utf-8");
  //console.log("sourcename", sourceName);
  if (sourceName === "Chlorgas") {
    res.download("files.zip", function (err) {
      if (err) {
        console.log("file not downloaded");
      } else {
        console.log("Download succesfull");
      }
    });
  }
  if (sourceName === "Wacker") {
    var WfileName = fs.readFileSync("Wfilename.txt", "utf-8");
    //console.log("Nome file Wacker", WfileName);
    res.download(WfileName, function (err) {
      if (err) {
        console.log("file not downloaded");
      } else {
        console.log("Download succesfull");
      }
    });
  }
});

/* app.get("/download", function (req, res) {
  var numeroFileSample = fs.readFileSync("filename.txt", "utf-8");
  CSfileToBeDownloaded = numeroFileSample;
  //CSfileToBeDownloaded = CSfileToBeDownloaded.replace("/", "-");
  //CSfileToBeDownloaded = CSfileToBeDownloaded + ".xml";
  console.log("fileToBeDownloaded", CSfileToBeDownloaded);
  res.download(CSfileToBeDownloaded, function (err) {
    if (err) {
      console.log("file not downloaded");
    } else {
      console.log("Download succesfull");
    }
  });
}); */

// legge il file sample.json e lo manda a public/index.js
app.get("/jsonSampleFile", (req, res) => {
  let jsonData = fs.readFileSync("sample.json");
  let jsonFile = JSON.parse(jsonData);
  //console.log(jsonFile);
  res.send(jsonFile);
});

app.get("/txt", (req, res) => {
  const readTxtFile1 = fs.readFileSync("sample.txt", "utf-8");
  //console.log("writeTxtFile", readTxtFile1);
  res.send(readTxtFile1);
});
