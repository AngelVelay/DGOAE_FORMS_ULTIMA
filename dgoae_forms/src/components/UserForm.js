import React, { useEffect, useRef, useState } from "react";
import { Button, Typography } from "@material-ui/core";
import { useNavigate, useParams } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import Alert from "@mui/material/Alert";

import CryptoJS from "crypto-js";

import "./UserForm.css";

import axios, { Axios } from "axios";
import { useAuth0 } from "@auth0/auth0-react";

function UserForm() {
  const { global_id } = useParams();

  var [quest_excel, setColumn] = useState([]);
  var navigate = useNavigate();
  var [answer, setAnswer] = useState([]);

  const [doc_name, setDocName] = useState("Untitled Document");
  const [doc_desc, setDocDesc] = useState("Add Description");
  const [captchaVerification, setcaptchaVerification] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isEncrypted, setIsEncrypted] = useState({});
  const [isEnabled, setisEnabled] = useState(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const siteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY;

  const encryptInformation = (wordTextPlain) => {
    var textoCifrado = CryptoJS.AES.encrypt(
      JSON.stringify(wordTextPlain),
      process.env.REACT_APP_SECRET_KEY
    );
    return textoCifrado.toString();
  };

  const captcha = useRef();

  const onChange = async () => {
    let tokenCaptcha = captcha.current.getValue();

    if (captcha.current.getValue()) {
      

      var request = await axios.post("http://localhost:9000/signup-with-recaptcha", {
        token: tokenCaptcha,
      });

      console.log(request)

      setcaptchaVerification(request?.data.success);

    }
  };

  useEffect(() => {
    async function getForm() {
      var request = await axios.get(
        `http://localhost:9000/getform?global_id=${global_id}`
      );
      var question_data = request.data.questions;
      var doc_name = request.data.document_name;
      var doc_desc = request.data.document_description;
      var isEncrypted = request.data.isEncrypted;

      question_data.map((q, qindex) => {
        answer.push({
          question: q.questionText,
          answer: " ",
        });
      });

      question_data.map((q, qindex) => {
        quest_excel.push({ header: q.questionText, key: q.questionText });
      });

      setIsEncrypted(isEncrypted);
      setDocName(doc_name);
      setDocDesc(doc_desc);
      setQuestions(question_data);
    }
    getForm();
  }, []);

  var post_answer_data = {};

  function select(que, option, e) {
    setAnswer(answer);

    var k = answer.findIndex((ele) => ele.question === que);
    answer[k].answer = option;
    setAnswer(answer);
  }

  function selectInput(que, option, e) {
    setAnswer(answer);
    var k = answer.findIndex((ele) => ele.question === que);
    answer[k].answer = option;
    setAnswer(answer);
  }

  function selectCheck(que, option, e) {
    setAnswer(answer);
    var d = [];
    var k = answer.findIndex((ele) => ele.question === que);
    if (answer[k].answer) {
      d = answer[k].answer.split(",");
    }
    if (e === true) {
      d.push(option);
    } else {
      var n = d.findIndex((el) => el.option === option);
      d.splice(n, 1);
    }

    answer[k].answer = d.join(",");
    setAnswer(answer);
  }

  async function submit() {
    answer.map((ele) => {
      if (isEncrypted === true) {
        post_answer_data[ele.question] = encryptInformation(ele.answer);
      } else {
        post_answer_data[ele.question] = ele.answer;
      }
    });

    axios.post(`http://localhost:9000/student_response`, {
      global_id: global_id,
      column: quest_excel,
      doc_name: doc_name,
      answer_data: [post_answer_data],
    });
    navigate("/submitted/" + global_id);
  }

  return (
    <div className="submit">
      <div className="user_form">
        <div className="user_form_section">
          <div className="user_title_section">
            <Typography style={{ fontSize: "26px" }}>{doc_name}</Typography>
            <Typography style={{ fontSize: "15px" }}>{doc_desc}</Typography>
          </div>
          {questions.length > 0 ? (
            questions.map((question, qindex) => (
              <div className="user_form_questions" key={qindex}>
                <Typography
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    letterSpacing: ".1px",
                    lineHeight: "24px",
                    paddingBottom: "8px",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="mr-2">
                      {qindex + 1}. {question.questionText}
                    </span>
                    {question.required ? (
                      <label className="text-red-500">
                        La pregunta es requerida
                      </label>
                    ) : null}
                  </div>
                </Typography>
                {question.options.map((option, index) => (
                  <div key={index} style={{ marginBottom: "5px" }}>
                    <div style={{ display: "flex" }}>
                      <div className="form_check">
                        {question.questionType !== "radio" ? (
                          question.questionType !== "text" ? (
                            <label>
                              <input
                                type="checkbox"
                                name={qindex}
                                value={option.optionText}
                                className="form_check_input"
                                required={question.required}
                                style={{
                                  marginLeft: "5px",
                                  marginRight: "5px",
                                }}
                                onChange={(e) => {
                                  selectCheck(
                                    question.questionText,
                                    option.optionText,
                                    e.target.checked
                                  );
                                }}
                              />
                              {option.optionText}
                            </label>
                          ) : (
                            <label>
                              <input
                                type="text"
                                name={qindex}
                                className="form_check_input_text"
                                required={question.required}
                                style={{
                                  marginLeft: "5px",
                                  marginRight: "5px",
                                }}
                                onChange={(e) => {
                                  selectInput(
                                    question.questionText,
                                    e.target.value
                                  );
                                }}
                              />
                              {""}
                            </label>
                          )
                        ) : (
                          <label>
                            <input
                              type="radio"
                              name={qindex}
                              value={option.optionText}
                              className="form_check_input"
                              required={question.required}
                              style={{ marginLeft: "5px", marginRight: "5px" }}
                              onChange={(e) => {
                                select(
                                  question.questionText,
                                  option.optionText,
                                  e.target.value
                                );
                              }}
                            />
                            {option.optionText}
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="user_form_questions">
              <Typography
                style={{
                  fontSize: "24px",
                  fontWeight: "400",
                  letterSpacing: ".2px",
                  lineHeight: "24px",
                  paddingBottom: "8px",
                }}
              >
                Comunicate con el administrador para habilitar el formulario.
              </Typography>
            </div>
          )}

          {}

          <div className="recaptcha">
            <ReCAPTCHA ref={captcha} sitekey={siteKey} onChange={onChange} />
          </div>

          <div className="user_form_submit">
            <Button
              disabled={!captchaVerification}
              variant="contained"
              color="primary"
              onClick={submit}
              style={{ fontSize: "14px" }}
            >
              Guardar respuesta
            </Button>

            {/* {captchaVerification ? (
              <Button
                disabled = {captchaVerification}
                variant="contained"
                color="primary"
                onClick={submit}
                style={{ fontSize: "14px" }}
              >
                Guardar respuesta
              </Button>
            ) : null} */}
          </div>

          <div className="user_footer">DGOAE-FORMS</div>
        </div>
      </div>
    </div>
  );
}

export default UserForm;
