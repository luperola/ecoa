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
var pdf2table = require("pdf2table");

var fileOriginale;
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
        fileOriginale = req.file.originalname;
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

          // -----------------pdf2table-----------------
          fs.readFile(
            __dirname + "/" + fileOriginale.toString(),
            function (err, buffer) {
              if (err) return console.log(err);

              pdf2table.parse(buffer, function (err, rows, rowsdebug) {
                if (err) return console.log(err);
                fs.writeFileSync("sample2.json", JSON.stringify(rows));
              });
            }
          );

          //-----------------end pdf2table-------------------------
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

app.get("/apicounter", (req, res) => {
  var testReadCounter = fs.readFileSync("counter.txt", "utf8");
  res.send(testReadCounter);
});

app.post("/newcounter", (req, res) => {
  const newCounter = req.body;
  fs.writeFileSync("counter.txt", newCounter.dataTest.toString());
  res.json(newCounter.dataTest.toString());
});

// ----------WACKER POST-----------------
app.post("/apitwo", (req, res) => {
  const dataWacker = req.body;
  //console.log(dataWacker);
  xw = new XMLWriter(true);
  xw.startDocument("1.0", "UTF-8");
  xw.startElement("GasesShipment");
  xw.writeAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
  xw.writeAttribute("xsi:noNamespaceSchemaLocation", dataWacker.nameSpace);
  xw.writeAttribute("MaterialCode", dataWacker.partNumber);
  xw.writeAttribute("SupplierHoldingDesc", "LINDE PLC");
  xw.writeAttribute("ReceivingStPlant", dataWacker.receivingPlant);
  xw.writeAttribute("MpsSpecNo", dataWacker.materialSpec);
  xw.writeAttribute("MpsSpecRev", dataWacker.revisionSpec);
  xw.writeAttribute("ShipmentDate", dataWacker.shipmentdate);
  xw.writeAttribute("ShipmentNumber", dataWacker.shipmentNumber);
  xw.writeAttribute("ShipQty", 1);
  xw.startElement("Lot");
  xw.writeAttribute("SupplierSupplyChainSeqCode", "LINDE PLC-BURGHAUSEN-1585");
  xw.writeAttribute("ShipLotNo", dataWacker.lotNumber);
  xw.writeAttribute("ExpiryDate", dataWacker.expiryDate);
  xw.writeAttribute("MfgDate", dataWacker.manDate);
  xw.writeAttribute("LotQty", 1);
  if (dataWacker.receivingPlant === "Agrate") {
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
  }

  if (dataWacker.receivingPlant === "Catania") {
    xw.startElement("DIM_Nitrogen_N2 ");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataWacker.N2value);
    xw.endElement();
    xw.endElement("DIM_Nitrogen_N2 ");
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
    xw.startElement("DIM_Total_hydrocarbon_as_CH4 ");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataWacker.CH4value);
    xw.endElement();
    xw.endElement("DIM_Total_hydrocarbon_as_CH4 ");
    xw.startElement("DIM_Moisture_H2O");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataWacker.H2Ovalue);
    xw.endElement();
    xw.endElement("DIM_Moisture_H2O");
    xw.startElement("DIM_Oxygen_plus_argon_O2_plus_Ar ");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataWacker.O2Arvalue);
    xw.endElement();
    xw.endElement("DIM_Oxygen_plus_argon_O2_plus_Ar ");
    xw.startElement("DIM_Iron_Fe");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataWacker.Fevalue);
    xw.endElement();
    xw.endElement("DIM_Iron_Fe");
    xw.endDocument();
  }

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
//------------END WACKER POST

//-----------CHLORGAS POST-------------
app.post("/apithree", (req, res) => {
  const dataCSPost = req.body;
  //console.log(dataCSPost);
  var zipCS = new AdmZip();
  for (let i = 0; i < dataCSPost.lotNumber.length; i++) {
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
    xw.writeAttribute("ShipmentDate", dataCSPost.shipment[i]);
    xw.writeAttribute("ShipmentNumber", dataCSPost.progressivoCS[i]);
    xw.writeAttribute("ShipQty", 1);
    xw.startElement("Lot");
    xw.writeAttribute(
      "SupplierSupplyChainSeqCode",
      "LINDE PLC-S/ CHLORGAS - Bitterfeld-Wolfen-1784"
    );
    xw.writeAttribute("ShipLotNo", dataCSPost.lotNumber[i]);
    xw.writeAttribute("ExpiryDate", dataCSPost.expiryDate[i]);
    xw.writeAttribute("MfgDate", dataCSPost.shipment[i]);
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
      var fileToBeDownloaded = dataCSPost.filetext[i];
      fileToBeDownloaded = fileToBeDownloaded.replace("/", "-");
      fileToBeDownloaded = fileToBeDownloaded + ".xml";
      //console.log("file to be dw", fileToBeDownloaded);
      fs.writeFileSync(fileToBeDownloaded, xw.toString());
      zipCS.addLocalFile(fileToBeDownloaded);
    } catch (e) {
      console.log("Error:", e.stack);
    }
  }
  fs.writeFileSync("sourcename.txt", "Chlorgas");
  zipCS.writeZip(/*target file name*/ "filesCS.zip");
});
//-----------END CHLORGAS POST-------------

//-----------POST from Hongin AGR-------------
app.post("/apifour", (req, res) => {
  const dataHIPost = req.body;
  //console.log(dataHIPost);
  var zipHI = new AdmZip();
  for (let i = 0; i < dataHIPost.filenamesHI.length; i++) {
    xw = new XMLWriter(true);
    xw.startDocument("1.0", "UTF-8");
    xw.startElement("GasesShipment");
    xw.writeAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
    xw.writeAttribute(
      "xsi:noNamespaceSchemaLocation",
      "3GASCD26_DM0000775807_06.xsd"
    );
    xw.writeAttribute("MaterialCode", "3GASCD26");
    xw.writeAttribute("SupplierHoldingDesc", "LINDE PLC");
    xw.writeAttribute("ReceivingStPlant", "Agrate");
    xw.writeAttribute("MpsSpecNo", "DM0000775807_06");
    xw.writeAttribute("MpsSpecRev", "2.0");
    xw.writeAttribute("ShipmentDate", dataHIPost.manDateHI[i]);
    xw.writeAttribute("ShipmentNumber", dataHIPost.progressivoHI[i]);
    xw.writeAttribute("ShipQty", 1);
    xw.startElement("Lot");
    xw.writeAttribute(
      "SupplierSupplyChainSeqCode",
      "LINDE PLC-HONG-IN CHEMICAL / Ulsan-1684"
    );
    xw.writeAttribute("ShipLotNo", dataHIPost.lotNumberHI[i]);
    xw.writeAttribute("ExpiryDate", dataHIPost.expiryDateHI[i]);
    xw.writeAttribute("MfgDate", dataHIPost.manDateHI[i]);
    xw.writeAttribute("LotQty", 1);
    xw.startElement("DIM_Carbon_dioxide_CO2");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPost.HICO2value[i]);
    xw.endElement();
    xw.endElement("DIM_Carbon_dioxide_CO2");
    xw.startElement("DIM_Carbon_monoxide_CO");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPost.HICOvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Carbon_monoxide_CO");
    xw.startElement("DIM_Hydrogen_H2 ");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPost.HIH2value[i]);
    xw.endElement();
    xw.endElement("DIM_Hydrogen_H2 ");
    xw.startElement("DIM_Iron_Fe");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPost.HIFevalue[i]);
    xw.endElement();
    xw.endElement("DIM_Iron_Fe");
    xw.startElement("DIM_Moisture_H2O");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPost.HIH2Ovalue[i]);
    xw.endElement();
    xw.endElement("DIM_Moisture_H2O");
    xw.startElement("DIM_Nitrogen_N2 ");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPost.HIN2value[i]);
    xw.endElement();
    xw.endElement("DIM_Nitrogen_N2 ");
    xw.startElement("DIM_Oxygen_plus_argon_O2_plus_Ar ");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPost.HIO2Arvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Oxygen_plus_argon_O2_plus_Ar ");
    xw.startElement("DIM_Methane_CH4 ");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPost.HICH4value[i]);
    xw.endElement();
    xw.endElement("DIM_Methane_CH4 ");
    xw.endDocument();
    //console.log("AGR eCOA", xw.toString());

    try {
      var HIfileToBeDownloaded = dataHIPost.filenamesHI[i];
      HIfileToBeDownloaded = HIfileToBeDownloaded.replace("/", "-");
      HIfileToBeDownloaded = HIfileToBeDownloaded + ".xml";
      //console.log("file to be dw", HIfileToBeDownloaded);
      fs.writeFileSync(HIfileToBeDownloaded, xw.toString());
      zipHI.addLocalFile(HIfileToBeDownloaded);
    } catch (e) {
      console.log("Error:", e.stack);
    }
  }
  fs.writeFileSync("sourcename.txt", "HongInAGR");
  zipHI.writeZip(/*target file name*/ "filesHIAGR.zip");
});
//-----------END POST from Hongin AGR-------------

//-----------POST from Hongin CAT-------------

app.post("/apifive", (req, res) => {
  const dataHIPostCAT = req.body;
  //console.log(dataHIPostCAT);
  var zipHI = new AdmZip();
  for (let i = 0; i < dataHIPostCAT.filenamesHI.length; i++) {
    xw = new XMLWriter(true);
    xw.startDocument("1.0", "UTF-8");
    xw.startElement("GasesShipment");
    xw.writeAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
    xw.writeAttribute(
      "xsi:noNamespaceSchemaLocation",
      "3GASCD35_DM000811559_06.xsd"
    );
    xw.writeAttribute("MaterialCode", "3GASCD35");
    xw.writeAttribute("SupplierHoldingDesc", "LINDE PLC");
    xw.writeAttribute("ReceivingStPlant", "Catania");
    xw.writeAttribute("MpsSpecNo", "DM000811559_06");
    xw.writeAttribute("MpsSpecRev", "1.0");
    xw.writeAttribute("ShipmentDate", dataHIPostCAT.manDateHI[i]);
    xw.writeAttribute("ShipmentNumber", dataHIPostCAT.progressivoHI[i]);
    xw.writeAttribute("ShipQty", 1);
    xw.startElement("Lot");
    xw.writeAttribute(
      "SupplierSupplyChainSeqCode",
      "LINDE PLC-HONG-IN CHEMICAL / Ulsan-1684"
    );
    xw.writeAttribute("ShipLotNo", dataHIPostCAT.lotNumberHI[i]);
    xw.writeAttribute("ExpiryDate", dataHIPostCAT.expiryDateHI[i]);
    xw.writeAttribute("MfgDate", dataHIPostCAT.manDateHI[i]);
    xw.writeAttribute("LotQty", 1);
    xw.startElement("DIM_Aluminum_Al");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIAlvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Aluminum_Al");

    xw.startElement("DIM_Antimony_Sb");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HISbvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Antimony_Sb");

    xw.startElement("DIM_Arsenic_As");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIAsvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Arsenic_As");

    xw.startElement("DIM_Bismuth_Bi");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIBivalue[i]);
    xw.endElement();
    xw.endElement("DIM_Bismuth_Bi");

    xw.startElement("DIM_Boron_B");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIBvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Boron_B");

    xw.startElement("DIM_Cadmium_Cd");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HICdvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Cadmium_Cd");

    xw.startElement("DIM_Arsenic_As");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIAsvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Arsenic_As");

    xw.startElement("DIM_Carbon_dioxide_CO2");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HICO2value[i]);
    xw.endElement();
    xw.endElement("DIM_Carbon_dioxide_CO2");
    xw.startElement("DIM_Carbon_monoxide_CO");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HICOvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Carbon_monoxide_CO");

    xw.startElement("DIM_Chromium_Cr");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HICrvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Chromium_Cr");

    xw.startElement("DIM_Cobalt_Co");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HICovalue[i]);
    xw.endElement();
    xw.endElement("DIM_Cobalt_Co");

    xw.startElement("DIM_Copper_Cu");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HICuvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Copper_Cu");

    xw.startElement("DIM_Hydrogen_H2 ");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIH2value[i]);
    xw.endElement();
    xw.endElement("DIM_Hydrogen_H2 ");
    xw.startElement("DIM_Iron_Fe");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIFevalue[i]);
    xw.endElement();
    xw.endElement("DIM_Iron_Fe");

    xw.startElement("DIM_Lead_Pb");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIPbvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Lead_Pb");

    xw.startElement("DIM_Arsenic_As");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIAsvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Arsenic_As");

    xw.startElement("DIM_Moisture_H2O");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIH2Ovalue[i]);
    xw.endElement();
    xw.endElement("DIM_Moisture_H2O");

    xw.startElement("DIM_Molybdenum_Mo");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIMovalue[i]);
    xw.endElement();
    xw.endElement("DIM_Molybdenum_Mo");

    xw.startElement("DIM_Nickel_Ni");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HINivalue[i]);
    xw.endElement();
    xw.endElement("DIM_Nickel_Ni");

    xw.startElement("DIM_Nitrogen_N2 ");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIN2value[i]);
    xw.endElement();
    xw.endElement("DIM_Nitrogen_N2 ");
    xw.startElement("DIM_Oxygen_plus_argon_O2_plus_Ar ");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIO2Arvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Oxygen_plus_argon_O2_plus_Ar ");

    xw.startElement("DIM_Phosphorous_P");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIPvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Phosphorous_P");

    xw.startElement("DIM_Sodium_Na");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HIAsvalue[i]);
    xw.endElement();
    xw.endElement("DIM_Sodium_Na");

    xw.startElement("DIM_Methane_CH4 ");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataHIPostCAT.HICH4value[i]);
    xw.endElement();
    xw.endElement("DIM_Methane_CH4 ");
    xw.endDocument();

    //console.log("CAT eCOA", xw.toString());

    try {
      var HIfileToBeDownloaded = dataHIPostCAT.filenamesHI[i];
      HIfileToBeDownloaded = HIfileToBeDownloaded.replace("/", "-");
      HIfileToBeDownloaded = HIfileToBeDownloaded + ".xml";
      //console.log("file to be dw", HIfileToBeDownloaded);
      fs.writeFileSync(HIfileToBeDownloaded, xw.toString());
      zipHI.addLocalFile(HIfileToBeDownloaded);
    } catch (e) {
      console.log("Error:", e.stack);
    }
  }
  fs.writeFileSync("sourcename.txt", "HongInCAT");
  zipHI.writeZip(/*target file name*/ "filesHICAT.zip");
});

//-----------END POST from Hongin CAT-------------

//-----------POST from TCS BURGHUASEN-------------

app.post("/TCS", (req, res) => {
  const dataTCSPost = req.body;
  //console.log(dataTCSPost);
  var zipTCS = new AdmZip();
  for (let i = 0; i < dataTCSPost.filenamesTCSB.length; i++) {
    xw = new XMLWriter(true);
    xw.startDocument("1.0", "UTF-8");
    xw.startElement("GasesShipment");
    xw.writeAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
    xw.writeAttribute(
      "xsi:noNamespaceSchemaLocation",
      "2CAG1211_DM00423514_09.xsd"
    );
    xw.writeAttribute("MaterialCode", "2CAG1211");
    xw.writeAttribute("SupplierHoldingDesc", "LINDE PLC");
    xw.writeAttribute("ReceivingStPlant", dataTCSPost.plant);
    xw.writeAttribute("MpsSpecNo", "DM00423514_09");
    xw.writeAttribute("MpsSpecRev", "3.0");
    xw.writeAttribute("ShipmentDate", dataTCSPost.shipmentDateTCSB);
    xw.writeAttribute("ShipmentNumber", dataTCSPost.progressivoTCSB[i]);
    xw.writeAttribute("ShipQty", 1);
    xw.startElement("Lot");
    xw.writeAttribute(
      "SupplierSupplyChainSeqCode",
      "LINDE PLC-BURGHAUSEN-1282"
    );
    xw.writeAttribute("ShipLotNo", dataTCSPost.filenamesTCSB[i]);
    xw.writeAttribute("ExpiryDate", dataTCSPost.expiryDateTCSB);
    xw.writeAttribute("MfgDate", dataTCSPost.manDateTCSB);
    xw.writeAttribute("LotQty", 1);

    xw.startElement("DIM_Acceptors_B");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataTCSPost.TCSBvalue);
    xw.endElement();
    xw.endElement("DIM_Acceptors_B");

    xw.startElement("DIM_Aluminum_Al");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataTCSPost.TCSAlvalue);
    xw.endElement();
    xw.endElement("DIM_Aluminum_Al");

    xw.startElement("DIM_Donors_P_As_Sb");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataTCSPost.TCSPAsSbvalue);
    xw.endElement();
    xw.endElement("DIM_Donors_P_As_Sb");

    xw.startElement("DIM_Iron_Fe_Liquid_phase");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataTCSPost.TCSFevalue);
    xw.endElement();
    xw.endElement("DIM_Iron_Fe_Liquid_phase");

    xw.startElement("DIM_Carbon_C");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataTCSPost.TCSCvalue);
    xw.endElement();
    xw.endElement("DIM_Carbon_C");

    xw.startElement("DIM_Trichlorosilane_HSiCl3_Assay");
    xw.startElement("RAW");
    xw.writeAttribute("VALUE", dataTCSPost.TCSAssay);
    xw.endElement();
    xw.endElement("DIM_Trichlorosilane_HSiCl3_Assay");
    xw.endDocument();

    //console.log("TCS eCOA", xw.toString());

    try {
      var TCSfileToBeDownloaded = dataTCSPost.filenamesTCSB[i];
      TCSfileToBeDownloaded = TCSfileToBeDownloaded.replace("/", "-");
      TCSfileToBeDownloaded = TCSfileToBeDownloaded + ".xml";
      //console.log("file to be dw", HIfileToBeDownloaded);
      fs.writeFileSync(TCSfileToBeDownloaded, xw.toString());
      zipTCS.addLocalFile(TCSfileToBeDownloaded);
    } catch (e) {
      console.log("Error:", e.stack);
    }
  }
  fs.writeFileSync("sourcename.txt", "TCS Burghausen");
  zipTCS.writeZip(/*target file name*/ "filesTCS.zip");
});

//-----------END POST from TCS BURGHAUSEN-------------

app.get("/download", function (req, res) {
  var sourceName = fs.readFileSync("sourcename.txt", "utf-8");
  //console.log("sourcename", sourceName);
  if (sourceName === "Chlorgas") {
    res.download("filesCS.zip", function (err) {
      if (err) {
        console.log("file not downloaded");
      } else {
        console.log("Download succesfull");
      }
    });
  }
  if (sourceName === "HongInAGR") {
    res.download("filesHIAGR.zip", function (err) {
      if (err) {
        console.log("file not downloaded");
      } else {
        console.log("Download succesfull");
      }
    });
  }
  if (sourceName === "HongInCAT") {
    res.download("filesHICAT.zip", function (err) {
      if (err) {
        console.log("file not downloaded");
      } else {
        console.log("Download succesfull");
      }
    });
  }
  if (sourceName === "TCS Burghausen") {
    res.download("filesTCS.zip", function (err) {
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

// legge il file sample.json e lo manda a public/index.js
app.get("/jsonSampleFile", (req, res) => {
  let jsonData = fs.readFileSync("sample.json");
  let jsonFile = JSON.parse(jsonData);
  //console.log(jsonFile);
  res.send(jsonFile);
});

app.get("/jsonSampleFile2", (req, res) => {
  let jsonData2 = fs.readFileSync("sample2.json");
  let jsonFile2 = JSON.parse(jsonData2);
  //console.log(jsonFile2);
  res.send(jsonFile2);
});

app.get("/txt", (req, res) => {
  const readTxtFile1 = fs.readFileSync("sample.txt", "utf-8");
  //console.log("writeTxtFile", readTxtFile1);
  res.send(readTxtFile1);
});
