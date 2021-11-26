var myDate, expirationDateOne, shipmentNumber, shipmentNumberCS;
let lotNumberArray = [],
  testMatrix = [],
  cylinderNumberArray = [],
  cylinderNumberArray1 = [],
  fillingDate = [],
  testMatrix1 = [],
  testMatrix2 = [],
  testMatrix3 = [],
  testMatrix4 = [],
  testMatrix5 = [],
  testMatrix6 = [],
  testMatrix7 = [],
  testMatrix8 = [],
  testMatrix9 = [],
  testMatrix10 = [],
  testMatrix11 = [],
  testMatrix12 = [],
  testMatrix13 = [],
  testMatrix14 = [],
  testMatrix15 = [],
  testMatrix16 = [],
  testMatrixCS1 = [],
  testMatrixCS2 = [],
  testMatrixCS3 = [],
  testMatrixCS4 = [],
  testMatrixCS5 = [],
  testMatrixCS6 = [],
  testMatrixCS7 = [],
  testMatrixCS8 = [],
  mfgDateCS = [],
  expDateCS = [],
  shipmentLotNumberCS = [],
  yearChangeFormat = [],
  shNumberCS = [];

function HongInStart() {
  document.getElementById("btndropdown").style.display = "none";
  document.getElementById("instructions").style.display = "none";
  document.getElementById("modalHI").style.display = "none";
  document.getElementById("modalCS").style.display = "none";
  document.getElementById("qtyinput").style.display = "inline";
}
function HongInLines() {
  var coaLines1 = document.getElementById("CoaLines").value;
  document.getElementById("qtyPagesHongIn").style.display = "inline";
  document.getElementById("qtyPagesHongIn").innerHTML =
    "eCOA Hong In lines =" + coaLines1.toString();
  HongInPdftoTxt(coaLines1);
}

function HongInPdftoTxt(coa) {
  //document.getElementById("qtyinput").style.display = "inline";
  //console.log("coaLines=", coa);
  ReadFileText();
  async function ReadFileText() {
    const res = await fetch("/txt");
    const dataText = await res.text();
    //console.log("data del file txt", dataText);

    document.getElementById("btndown").style.display = "inline";
    document.getElementById("btnHome").style.display = "inline";

    //shipmentDateFormat();
    //ExirationDateFormatOne();
    //FillingDateFormatOne();

    const needle = "HXHCL";
    splitOnFound = dataText
      .split(needle)
      .map(
        function (culm) {
          return (this.pos += culm.length + needle.length);
        },
        { pos: -needle.length }
      )
      .slice(0, -1); // {pos: ...} – Object wich is used as this
    //splitOnFound dà la posizione di tutti i lot numbers HXHCL...
    //con splitOnFound ho le posizioni nel file .txt dei lot numbers 'HXHCL...'. Con i due for creo array testMatrix, la metto assieme (matrix.join e prendo i valori giusti con .match (ogni 11 caratteri, lunghezza di HXHCL...')
    for (let ind = 0; ind < coa; ind++) {
      for (let index = 0; index < 11; index++) {
        testMatrix.push(dataText[splitOnFound[ind] + index]);
      }
    }
    //console.log("testM1", splitOnFound);
    const test = testMatrix.join("");
    //faccio split della stringa test ogni 11 posizioni (lunghexxa del lot number Hong In)
    lotNumberArray = test.match(/.{1,11}/g);
    //console.log("lotNUmber array", lotNumberArray);

    //sommando 13 a splitOnFound formiamo l'oggetto 'Cyl No' lungo 8 caratteri.
    for (let index = 0; index < coa; index++) {
      testMatrix1.push(splitOnFound[index] + 13);
    }
    //console.log("cylinderNumberArray- indexes", testMatrix1);

    for (let ind = 0; ind < coa; ind++) {
      for (let index = 0; index < 8; index++) {
        testMatrix2.push(dataText[testMatrix1[ind] + index]);
      }
    }
    //console.log("cylinders #:", testMatrix2);
    const test1 = testMatrix2.join("");
    cylinderNumberArray = test1.match(/.{1,8}/g);
    //cylindernumerArray = cyl N°
    //console.log("cyl No", cylinderNumberArray);

    testMatrix3[0] = testMatrix1[0] + 22;
    // sommando 22 testMatrix1 trovo la Filling Date lunga 8 caratteri - devo compensare la diff. della divrsa lungh. dei dati di cylinderNumberArray (da 5 a 8)
    for (let index = 1; index < coa; index++) {
      testMatrix3.push(
        testMatrix1[index] + 22 + (8 - cylinderNumberArray[index - 1].length)
      );
    }
    console.log("M3", testMatrix3);

    for (let ind = 0; ind < coa; ind++) {
      for (let index = 0; index < 8; index++) {
        testMatrix4.push(dataText[testMatrix3[ind] + index]);
      }
    }
    console.log("M4", testMatrix4);
    const test2 = testMatrix4.join("");
    fillingDate = test2.match(/.{1,8}/g);
    console.log("fillingDate", fillingDate);
    /*  for (let index = 583; index < 980; index++) {
      var element = dataText[index];
      console.log(index, "/", element);
    } */
  }
}

//}
//

// Wacker
function WackerHCl() {
  document.getElementById("btndropdown").style.display = "none";
  document.getElementById("supplierWacker").style.display = "inline";
  document.getElementById("modalHI").style.display = "none";
  document.getElementById("modalCS").style.display = "none";
  ReadFileJson();
  async function ReadFileJson() {
    const res = await fetch("/jsonSampleFile");
    const data = await res.json();
    //Counter alimenta e salva il contatore di counter.txt
    Counter();
    async function Counter() {
      let contatore;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contatore),
      };
      const myresponse = await fetch("/api", options);
      var myjson = await myresponse.json();
      myjson = parseInt(myjson);
      var dt = new Date();
      var anno = dt.getFullYear().toString();
      anno = anno.substring(2, 4);
      if (myjson < 10) {
        shipmentNumber = "IT/000" + myjson.toString() + "/" + anno;
      }
      if (myjson >= 10 && myjson < 100) {
        shipmentNumber = "IT/00" + myjson.toString() + "/" + anno;
      }
      if (myjson >= 100 && myjson < 1000) {
        shipmentNumber = "IT/0" + myjson.toString() + "/" + anno;
      }
      if (myjson >= 1000) {
        shipmentNumber = "IT/" + myjson.toString() + "/" + anno;
      }
      if (myjson > 10000) {
        alert("reset counter.txt file");
      }
      window.localStorage.setItem("shipment", shipmentNumber);
    }
    const shipmentNumber1 = window.localStorage.getItem("shipment");

    var wackerData = {
      shipmentNumber: shipmentNumber1,
      shipmentdate: data.Pages[0].Texts[22].R[0].T,
      lotNumber: data.Pages[0].Texts[42].R[0].T,
      expiryDate: data.Pages[0].Texts[50].R[0].T,
      manDate: data.Pages[0].Texts[47].R[0].T,
      N2value: data.Pages[0].Texts[79].R[0].T,
      O2Arvalue: data.Pages[0].Texts[86].R[0].T,
      CO2value: data.Pages[0].Texts[93].R[0].T,
      COvalue: data.Pages[0].Texts[100].R[0].T,
      CH4value: data.Pages[0].Texts[107].R[0].T,
      H2value: data.Pages[0].Texts[114].R[0].T,
      H2Ovalue: data.Pages[0].Texts[121].R[0].T,
      Fevalue: data.Pages[0].Texts[128].R[0].T,
    };
    wackerData.shipmentdate = wackerData.shipmentdate.replace(
      "date%20of%20issue%3A%20",
      ""
    );
    wackerData.shipmentdate = wackerData.shipmentdate.replaceAll(".", "-");
    const month = parseInt(wackerData.shipmentdate.substring(3, 5)) - 1;
    const monthName = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    wackerData.shipmentdate = wackerData.shipmentdate.replace(
      wackerData.shipmentdate.substring(3, 5),
      monthName[month]
    );

    wackerData.expiryDate = wackerData.expiryDate.replaceAll(".", "-");
    const monthExpiry = parseInt(wackerData.expiryDate.substring(3, 5)) - 1;
    const monthNameExpiry = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    wackerData.expiryDate = wackerData.expiryDate.replace(
      wackerData.expiryDate.substring(3, 5),
      monthNameExpiry[monthExpiry]
    );

    wackerData.manDate = wackerData.manDate.replaceAll(".", "-");
    const monthMan = parseInt(wackerData.manDate.substring(3, 5)) - 1;
    const monthNameMan = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    wackerData.manDate = wackerData.manDate.replace(
      wackerData.manDate.substring(3, 5),
      monthNameMan[monthMan]
    );

    wackerData.N2value = wackerData.N2value.replace("%3C%20", "");
    wackerData.O2Arvalue = wackerData.O2Arvalue.replace("%3C%20", "");
    wackerData.CO2value = wackerData.CO2value.replace("%3C%20", "");
    wackerData.COvalue = wackerData.COvalue.replace("%3C%20", "");
    wackerData.CH4value = wackerData.CH4value.replace("%3C%20", "");
    wackerData.H2value = wackerData.H2value.replace("%3C%20", "");
    wackerData.H2Ovalue = wackerData.H2Ovalue.replace("%3C%20", "");
    wackerData.Fevalue = wackerData.Fevalue.replace("%3C%20", "");
    wackerData.N2value = wackerData.N2value.replace("%2C", ".");
    wackerData.O2Arvalue = wackerData.O2Arvalue.replace("%2C", ".");
    wackerData.CO2value = wackerData.CO2value.replace("%2C", ".");
    wackerData.COvalue = wackerData.COvalue.replace("%2C", ".");
    wackerData.CH4value = wackerData.CH4value.replace("%2C", ".");
    wackerData.H2value = wackerData.H2value.replace("%2C", ".");
    wackerData.H2Ovalue = wackerData.H2Ovalue.replace("%2C", ".");
    wackerData.Fevalue = wackerData.Fevalue.replace("%2C", ".");

    const wData = {
      shipmentNumber: wackerData.shipmentNumber,
      shipment: wackerData.shipmentdate,
      lotNumber: data.Pages[0].Texts[42].R[0].T,
      expiryDate: wackerData.expiryDate,
      manDate: wackerData.manDate,
      N2value: wackerData.N2value,
      O2Arvalue: wackerData.O2Arvalue,
      CO2value: wackerData.CO2value,
      COvalue: wackerData.COvalue,
      CH4value: wackerData.CH4value,
      H2value: wackerData.H2value,
      H2Ovalue: wackerData.H2Ovalue,
      Fevalue: wackerData.Fevalue,
    };
    //console.log(wData);

    // passo i dati a xlm
    Counter2();
    async function Counter2() {
      const woptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wData),
      };
      const myresponsew = await fetch("/apitwo", woptions);
      var myjsonw = await myresponsew.json();
      console.log(myjsonw);
    }
    document.getElementById("btndown").style.display = "inline";
    document.getElementById("btnHome").style.display = "inline";
    return;
  }
}

function ChlorgasStart() {
  document.getElementById("btndropdown").style.display = "none";
  document.getElementById("instructions").style.display = "none";
  document.getElementById("modalHI").style.display = "none";
  document.getElementById("modalCS").style.display = "none";
  document.getElementById("qtyinputCS").style.display = "inline";
}

function ChlorgasLines() {
  document.getElementById("btndown").style.display = "inline";
  document.getElementById("btnHome").style.display = "inline";
  var coaLinesCS = document.getElementById("CoaLinesCS").value;
  document.getElementById("qtyPagesCS").style.display = "inline";
  document.getElementById("qtyPagesCS").innerHTML =
    "eCOA Chlorgas lines =" + coaLinesCS.toString();
  ChlorgasPdftoTxt(coaLinesCS);
}
function ChlorgasPdftoTxt(coaCS) {
  ReadCSText();
  async function ReadCSText() {
    const res = await fetch("/txt");
    var dataText = await res.text();
    dataText = dataText.replace(/[\r\n]+/g, "\n\n");
    //Counter per shipment Number progressivo
    for (let index = 0; index < coaCS; index++) {
      CounterCS();
      async function CounterCS() {
        let contatore;
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contatore),
        };
        const myresponse = await fetch("/api", options);
        var myjson = await myresponse.json();
        myjson = parseInt(myjson);
        var dt = new Date();
        var anno = dt.getFullYear().toString();
        anno = anno.substring(2, 4);
        if (myjson < 10) {
          shipmentNumberCS = "IT/000" + myjson.toString() + "/" + anno;
        }
        if (myjson >= 10 && myjson < 100) {
          shipmentNumberCS = "IT/00" + myjson.toString() + "/" + anno;
        }
        if (myjson >= 100 && myjson < 1000) {
          shipmentNumberCS = "IT/0" + myjson.toString() + "/" + anno;
        }
        if (myjson >= 1000) {
          shipmentNumberCS = "IT/" + myjson.toString() + "/" + anno;
        }
        if (myjson > 10000) {
          alert("reset counter.txt file");
        }
        shNumberCS.push(shipmentNumberCS);
        window.localStorage.setItem("CSshipment", shNumberCS);
      }
    }
    //creo matrice di dataText - tutti gli elementi
    for (let index = 0; index < dataText.length; index++) {
      var element = dataText[index];
      testMatrixCS1.push(element);
    }
    const test3 = testMatrixCS1.join("");

    // creo matrice .match con i contenuti della matrice sopra
    testMatrixCS2 = test3.match(/.{1,20}/g);
    //console.log(testMatrixCS2);

    //qualche volta è una o l'altra nel file text, allora verifico se esiste 'Nr.' o no
    if (testMatrixCS2.indexOf("Nr.") === -1) {
      for (let index = 0; index < testMatrixCS2.length; index++) {
        if (testMatrixCS2[index] === "Behälter-") {
          for (let i = 1; i < parseInt(coaCS) + 1; i++) {
            shipmentLotNumberCS.push(testMatrixCS2[index + i]);
          }
        }
      }
    }
    if (testMatrixCS2.indexOf("Nr.") != -1) {
      for (let index = 0; index < testMatrixCS2.length; index++) {
        if (testMatrixCS2[index] === "Nr.") {
          for (let i = 1; i < parseInt(coaCS) + 1; i++) {
            shipmentLotNumberCS.push(testMatrixCS2[index + i]);
          }
        }
      }
    }
    for (let index = 0; index < testMatrixCS2.length; index++) {
      if (testMatrixCS2[index] === "Datum") {
        for (let i = 1; i < parseInt(coaCS) + 1; i++) {
          mfgDateCS.push(testMatrixCS2[index + i]);
        }
      }
    }
    mfgMonthChange(mfgDateCS);

    //cambio format mese per CS
    function mfgMonthChange(monthChangeFormat) {
      for (let index = 0; index < coaCS; index++) {
        monthChangeFormat[index] = monthChangeFormat[index].replaceAll(
          ".",
          "-"
        );
        const monthMan = parseInt(monthChangeFormat[index].substring(3, 5)) - 1;
        const monthNameMan = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        monthChangeFormat[index] = monthChangeFormat[index].replace(
          monthChangeFormat[index].substring(3, 5),
          monthNameMan[monthMan]
        );
        monthChangeFormat[index] = monthChangeFormat[index].substring(0, 7);
        const Anno = "2021";
        const expAnno = "2023";
        expDateCS[index] = monthChangeFormat[index] + expAnno;
        monthChangeFormat[index] = monthChangeFormat[index] + Anno;
      }
    }

    var arrayShN = window.localStorage.getItem("CSshipment");
    arrayShN = arrayShN.split(",");
    for (let index = 0; index < coaCS; index++) {
      const dataCS = {
        shipment: mfgDateCS[index],
        lotNumber: shipmentLotNumberCS[index],
        expiryDate: expDateCS[index],
        manDate: mfgDateCS[index],
        progressivoCS: arrayShN[index],
        filetext: shipmentLotNumberCS,
      };
      //console.log("dataCS", index, "/", dataCS);

      Counter2();
      async function Counter2() {
        const CSoptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataCS),
        };
        const myresponseCS = await fetch("/apithree", CSoptions);
        var myjsonCS = await myresponseCS.json();
        console.log(myjsonCS);
      }
    }
  }
}
