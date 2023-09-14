import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import conectarDB from "../backend/config/db.js";
import Form from "../backend/models/Form.js";
import AllAccess from "./models/AllAcces.js";
import Response from "./models/Response.js";
import CryptoJS from "crypto-js";

const appback = express();

dotenv.config();

conectarDB();
appback.use(bodyParser.json());
appback.use(cors());
appback.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*", "http://localhost:3001/*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept"
  );
  next();
});

appback.get(`/data`, async (req, res) => {
  var docID = req.query.doc_id;
  var userID = req.query.username;

  try {
    const doc = await Form.findOne({ IdPregunta: docID });
    // const doc = await Form.findOne({ userID });
    if (!doc) {
      res.status(404).send("File not found");
      return;
    }
    res.send(doc);
  } catch (err) {
    console.log(err);
  }
});

appback.get(`/get_all_filenames_by_user`, async (req, res) => {
  var userID = req.query.username;

  Form.find({ email: userID }, (err, files) => {
    if (err) {
      console.error(err);
      res.json([]);
    } else {
      let js = files.map((file) => {
        return {
          name: file.document_name,
          formId: file.IdPregunta,
          description: file.document_description,
          questions: file.questions,
          time: file.fechaEntrega,
        };
      });
      res.json(js);
    }
  });
});

appback.get("/getform", async (req, res) => {
  const globalID = req.query.global_id;

  try {
    const allAccess = await AllAccess.findOne({ gid: globalID });
    if (allAccess.enable === true) {
      const form = await Form.findOne({ IdPregunta: allAccess.IdPregunta });
      res.send({
        document_name: form.document_name,
        document_description: form.file,
        questions: form.questions,
        isEncrypted: form.isEncrypted,
      });
    } else {
      const form = await Form.findOne({ IdPregunta: allAccess.IdPregunta });
      res.send({
        document_name: form.document_name,
        document_description: "Cuestionario no habilitado",
        questions: [],
      });
      return;
    }
  } catch (err) {
    res.status(500).send("Error while loading form");
  }
});

appback.get(`/getGlobalID`, async (req, res) => {
  const gid = req.query.id;

  try {
    const result = await AllAccess.findOne({ IdPregunta: gid });
    if (!result) {
      return;
    }
    res.json({ gid: result.gid });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

appback.post("/add_question", async (req, res) => {
  const user_id = req.query.username;
  const document_id = req.query.doc_id;
  const document_data = req.body;

  const form = await Form.findOne({ IdPregunta: document_id });

  const encryptInformation = (wordTextPlain) => {
    var textoCifrado = CryptoJS.AES.encrypt(
      JSON.stringify(wordTextPlain),
      process.env.REACT_APP_SECRET_KEY
    );
    return textoCifrado.toString();
  };

  const decryptInformation = (wordTextCipher) => {
    var bytes = CryptoJS.AES.decrypt(
      wordTextCipher,
      process.env.REACT_APP_SECRET_KEY
    );
    var textoPlano = bytes.toString(CryptoJS.enc.Utf8);
    return textoPlano;
  };

  if (!form) {
    const document = new Form({
      email: user_id,
      IdPregunta: document_id,
      document_name: document_data.document_name,
      document_description: document_data.document_description,
      isEncrypted: document_data.isEncrypted,
      questions: document_data.questions,
    });
    await document.save();
    res.json(document);
  } else {
    const document = new Form({
      email: form.email,
      IdPregunta: form.IdPregunta,
      document_name: document_data.document_name,
      document_description: document_data.document_description,
      isEncrypted: document_data.isEncrypted,

      questions: document_data.questions,
    });
    await form.updateOne({
      document_name: document_data.document_name,
      document_description: document_data.document_description,
      isEncrypted: document_data.isEncrypted,
      questions: document_data.questions,
    });
    res.json(document);
  }

  const allAccess = await AllAccess.findOne({ IdPregunta: document_id });
  if (!allAccess) {
    const newForm = new AllAccess({
      email: user_id,
      gid: uuidv4(),
      IdPregunta: document_id,
      enable: false,
      isEncrypted: false,
      IdRespuesta: uuidv4(),
    });
    await newForm.save();
  }
});

appback.post("/student_response", async (req, res) => {
  const encryptInformation = (wordTextPlain) => {
    var textoCifrado = CryptoJS.AES.encrypt(
      JSON.stringify(wordTextPlain),
      process.env.REACT_APP_SECRET_KEY
    );
    return textoCifrado.toString();
  };

  const docs_data = req.body;
  const globalID = req.query.doc_id;

  try {
    const response = await Response.findOne({
      doc_name: docs_data.doc_name,
    });
    if (!response) {
      const newResponse = new Response({
        gid: docs_data.global_id,
        IdRespuesta: docs_data.IdRespuesta,
        responses: docs_data.answer_data,
        columns: docs_data.column,
        doc_name: docs_data.doc_name,
      });
      await newResponse.save();
    } else {
      response.responses.push(docs_data.answer_data[0]);

      await response.save();
      res.sendStatus(200);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

function isObject(obj) {
  return obj !== undefined && obj !== null && obj.constructor == Object;
}

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

appback.get(`/getExcel`, async (req, res) => {
  const fid = req.query.id;

  try {
    const accessfile = await AllAccess.findOne({ file: fid }).exec();

    if (!accessfile) {
      res.send(null);
      return;
    }

    const user = accessfile.email;
    const filename = accessfile.filename;

    const response = await Response.findOne({ filename }).exec();

    if (!response) {
      res.send(null);
      return;
    }

    const json_responses = response.responses;

    res.json(json_responses);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

appback.post(`/enable_disable`, async (req, res) => {
  var docs_data = req.body;
  var fid = docs_data.fid;
  var isEnabled = docs_data.enabled;

  var filenameAll = `allaccess.json`;
  const diretoryPath = path.join(__dirname, "/files/");

  let accessfile = JSON.parse(fs.readFileSync(diretoryPath + filenameAll));
  accessfile.forms.map((element) => {
    if (fid === element.file) {
      element.enable = isEnabled;
    }
  });

  let jsondata = JSON.stringify(accessfile);
  fs.writeFileSync(diretoryPath + filenameAll, jsondata);
  res.send();
});

appback.get(`/getResponses`, async (req, res) => {
  try {
    const fid = req.query.id;

    const accessfile = await Form.findOne({ IdPregunta: fid });

    if (!accessfile) {
      res.send({ rsize: 0, resp: [], columns: [] });
      return;
    }

    const user = accessfile.email;
    const globalID = accessfile.gid;
    const filename = accessfile.document_name;
    const isEnabled = accessfile.enable;

    const s_response = await Response.findOne({ doc_name: filename });

    const json_responses = {
      rsize: s_response.responses.length,
      resp: s_response.responses,
      columns: s_response.columns,
      doc_name: s_response.doc_name,
      isEnabled: isEnabled,
    };

    res.send(json_responses);
  } catch (err) {
    console.log(err);
    res.send({ rsize: 0, resp: [], columns: [] });
  }
});

appback.get(`/getFormData`, async (req, res) => {
  const document_id = req.query.doc_id;

  try {
    const form = await Form.findOne({ IdPregunta: document_id });
    if (!form) {
      res.send({
        IdPregunta: form.IdPregunta,
        document_name: form.document_name,
        document_description: form.document_description,
        isEncrypted: form.isEncrypted,
      });
    } else {
      res.send({
        IdPregunta: form.IdPregunta,
        document_name: form.document_name,
        document_description: form.document_description,
        isEncrypted: form.isEncrypted,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

async function validateHuman(token) {
  const secret = process.env.REACT_APP_CAPTCHA_SECRET_KEY;
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
    {
      method: "POST",
    }
  );
  const data = await response.json();
  console.log(data);
  return data;
}

appback.post("/signup-with-recaptcha", async (req, res) => {
  const formData = req.body;

  const human = await validateHuman(formData.token);
  console.log(human);
  if (!human.success) {
    res.status(400);
    res.json({ errors: ["Error al entrar"] });
    return;
  }
  res.send(human)
});

appback.listen(9000, () => {
  console.log("Express server is running port number 9000");
});
