const express = require("express");
const app = express();
const cors = require("cors");
let query = "SELECT * FROM dual";
app.use(cors());
const corsOptions = {
  origin: "http://localhost:5173",
  method: "GET,POST",
};

const configuredCors = cors(corsOptions);
app.options("*", configuredCors);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/saveData", configuredCors, async (req, res) => {
  try {
    resetQuery();
    let connection = await oracledb.getConnection(config);
    console.log("coming to save data");
    saveDataQuery(JSON.stringify(req.body));
    const result = connection.execute(query);
    const commit = connection.execute("commit");
    console.log(result);
    res.json(result);
    connection.close();
    resetQuery();
  } catch (err) {
    console.log(err);
  }
});

app.get("/corspost", configuredCors, async (req, res) => {
  try {
    let connection = await oracledb.getConnection(config);
    const queryParams = req.query.myobj;
    buildQuery(queryParams);
    const result = await connection.execute(query);
    console.log("connected to database");
    // const jsonObject = result.rows;
    let jsonResult = [];
    for (let row of result.rows) {
      let rowObject = {};
      for (let i = 0; i < result.metaData.length; i++) {
        rowObject[result.metaData[i].name] = row[i];
      }
      jsonResult.push(rowObject);
    }

    res.json(jsonResult);
    console.log(jsonResult);
    connection.close();
    resetQuery();
  } catch (err) {
    console.error(err);
  }
});

app.get("/fetchAccountPostingRecon", configuredCors, async (req, res) => {
  try {
    console.log("Entering Fetch Profession");
    let connection = await oracledb.getConnection(config);

    const query =
      "select FinalStatus as label, count(*) as value from ( select RequestTmisId,RequestStatus,tbl1.transactionid as Transactionid,ResponseTmisId,ResponseStatus ,case when (RequestStatus = 'Completed') then case when (ResponseStatus = 'Completed') then 'Posting Completed' when (ResponseStatus in ('Pending','Failed')) then 'Response Not Processed' when (ResponseStatus is null) then 'Response Not Received' end when (RequestStatus in ('Failed','Pending')) then 'Request Not Processed' end as FinalStatus   from ( select tmisid as RequestTmisId, refid as RequestRefId, PaymentStatus as RequestStatus,txnstartdate as RequestDateTime, transactionid from TmisSummary where messagetype = 'BookingRequest') tbl1 left join ( select tmisid as ResponseTmisId, refid as ResponseRefId, PaymentStatus as ResponseStatus,txnstartdate as ResponseDateTime, transactionid from TmisSummary where messagetype = 'BookingResponse') tbl2 on tbl1.transactionid = tbl2.transactionid) group by FinalStatus";
    const result = await connection.execute(query);
    let jsonResult = [];
    for (let row of result.rows) {
      let rowObject = {};
      for (let i = 0; i < result.metaData.length; i++) {
        rowObject[result.metaData[i].name] = row[i];
      }
      jsonResult.push(rowObject);
    }
    res.json(jsonResult);
    console.log(jsonResult);
    connection.close();
    resetQuery();
  } catch (err) {
    console.error(err);
  }
});

app.get("/fetchDetails", configuredCors, async (req, res) => {
  try {
    console.log("Entering Fetch Recon Details");
    let connection = await oracledb.getConnection(config);
    const queryParams = req.query.finalstatus;
    console.log(queryParams);
    const query =
      "select * from ( select RequestTmisId,RequestStatus,tbl1.transactionid as Transactionid,ResponseTmisId,ResponseStatus ,case when (RequestStatus = 'Completed') then case when (ResponseStatus = 'Completed') then 'Posting Completed' when (ResponseStatus in ('Pending','Failed')) then 'Response Not Processed' when (ResponseStatus is null) then 'Response Not Received' end when (RequestStatus in ('Failed','Pending')) then 'Request Not Processed' end as FinalStatus   from ( select tmisid as RequestTmisId, refid as RequestRefId, PaymentStatus as RequestStatus,txnstartdate as RequestDateTime, transactionid from TmisSummary where messagetype = 'BookingRequest') tbl1 left join ( select tmisid as ResponseTmisId, refid as ResponseRefId, PaymentStatus as ResponseStatus,txnstartdate as ResponseDateTime, transactionid from TmisSummary where messagetype = 'BookingResponse') tbl2 on tbl1.transactionid = tbl2.transactionid" +
      " ) where FinalStatus = NVL('" +
      queryParams +
      "',FinalStatus)";
    console.log(query);
    const result = await connection.execute(query);
    let jsonResult = [];
    for (let row of result.rows) {
      let rowObject = {};
      for (let i = 0; i < result.metaData.length; i++) {
        rowObject[result.metaData[i].name] = row[i];
      }
      jsonResult.push(rowObject);
    }
    res.json(jsonResult);
    console.log(jsonResult);
    connection.close();
    resetQuery();
  } catch (err) {
    console.error(err);
  }
});

app.get("/fetchStats", configuredCors, async (req, res) => {
  try {
    console.log("Entering Fetch Profession");
    let connection = await oracledb.getConnection(config);
    const query =
      "select PaymentStatus as label, count(*) as value from TMISSUMMARY group by TMISSUMMARY.PAYMENTSTATUS";
    const result = await connection.execute(query);
    let jsonResult = [];
    for (let row of result.rows) {
      let rowObject = {};
      for (let i = 0; i < result.metaData.length; i++) {
        rowObject[result.metaData[i].name] = row[i];
      }
      jsonResult.push(rowObject);
    }
    res.json(jsonResult);
    console.log(jsonResult);
    connection.close();
    resetQuery();
  } catch (err) {
    console.error(err);
  }
});

app.get("/fetchProfession", configuredCors, async (req, res) => {
  try {
    console.log("Entering Fetch Profession");
    let connection = await oracledb.getConnection(config);
    const query = "SELECT INPUTPAYLOAD FROM PROJECTTECHSTACK";
    const result = await connection.execute(query);
    let jsonResult = [];
    for (let row of result.rows) {
      let rowObject = {};
      for (let i = 0; i < result.metaData.length; i++) {
        rowObject[result.metaData[i].name] = row[i];
      }
      jsonResult.push(rowObject);
    }
    res.json(jsonResult);
    console.log(jsonResult);
    connection.close();
    resetQuery();
  } catch (err) {
    console.error(err);
  }
});

app.listen(8080, () => {
  console.log("listening on port 8080");
});

const oracledb = require("oracledb");

const config = {
  user: "Devuser",
  password: "devuser",
  connectString: "SANTOCHA-C466MN3:1521/XEPDB1",
};

//async function run()

function buildQuery(jsondata) {
  console.log("coming inside buildQuery");
  console.log(jsondata);
  query =
    "SELECT   g.name, g.DESCRIPTION  from GUITARS g where name in ( SELECT name FROM JSON_TABLE ( ' " +
    jsondata +
    " ' , '$[*]'  COLUMNS ( name PATH '$' )) )";
}

function resetQuery() {
  query = "select * from dual";
}

function saveDataQuery(jsonSaveData) {
  query =
    "INSERT INTO PROJECTTECHSTACK VALUES ( ' " +
    jsonSaveData +
    " ',PROJECTTECHSTACKSEQ.NEXTVAL )";
}
