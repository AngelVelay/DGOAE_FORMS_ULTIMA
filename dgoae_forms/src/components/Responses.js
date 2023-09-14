import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IconButton, Switch, Typography } from "@material-ui/core";
import MoreVert from "@material-ui/icons/MoreVert";
import axios from "axios";
import "./Responses.css";
import CryptoJS from "crypto-js";

import ReactPaginate from "react-paginate";
import Button from "@material-ui/core/Button";

function Responses() {
  const { id } = useParams();

  var [responses, setResponses] = useState([]);
  var [rsize, setRSize] = useState(0);
  var [rcols, setRCols] = useState([]);
  var [dname, setDName] = useState("");
  var [state, setState] = useState({ perPage: 2, page: 0, pages: 0 });
  var [items, setItems] = useState([]);
  var navigate = useNavigate();

  useEffect(() => {
    async function getReponses() {
      var request = await axios.get(
        `http://localhost:9000/getResponses?id=${id}`
      );

      responses = request.data.resp;

      rsize = request.data.rsize;
      rcols = request.data.columns;
      dname = request.data.doc_name;

      setResponses(responses);
      setRSize(rsize);
      setRCols(rcols);
      setDName(dname);

      items = responses.slice(
        state.page * state.perPage,
        (state.page + 1) * state.perPage
      );
      setItems(items);
      state.pages = Math.floor(rsize / state.perPage);
      setState(state);
    }

    getReponses();
  }, []);

  function handlePageClick(event) {
    state.page = event.selected;
    setState(state);

    items = responses.slice(
      state.page * state.perPage,
      (state.page + 1) * state.perPage
    );

    setItems(items);
  }

  async function enableForm(event, checked) {
    try {
      const response = await axios.post(
        `http://localhost:9000/enable_disable`,
        {
          fid: id,
          enabled: checked,
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  function regresarPrincipal() {
    navigate("/");
  }

  const decryptInformation = (wordTextCipher) => {
    var bytes = CryptoJS.AES.decrypt(
      wordTextCipher,
      process.env.REACT_APP_SECRET_KEY

    );
    var textoPlano = bytes.toString(CryptoJS.enc.Utf8);
    return textoPlano;
  };

  return (
    <div className="submit" style={{ height: "76vh" }}>
      <div className="user_form">
        <div className="user_form_section">
          <div
            className="user_form_questions"
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "20px",
            }}
          >
            <Typography
              style={{
                fontWeight: "700",
                letterSpacing: ".2px",
                lineHeight: "24px",
                paddingBottom: "8px",
                fontSize: "28px",
              }}
            >
              Cuestionario : {dname}
            </Typography>
            <br></br>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                style={{
                  fontWeight: "400",
                  letterSpacing: ".1px",
                  lineHeight: "24px",
                  paddingBottom: "8px",
                  fontSize: "24px",
                }}
              >
                Total de respuestas {rsize}
              </Typography>
              <div>
                <IconButton>
                  <MoreVert className="form_header_icon" />
                </IconButton>
              </div>
            </div>
            <br></br>
          </div>
        </div>

        <div className="user_form_section">
          <div
            className="user_form_questions"
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                style={{
                  fontSize: "15px",
                  fontWeight: "400",
                  letterSpacing: ".1px",
                  lineHeight: "24px",
                  paddingBottom: "8px",
                  fontSize: "24px",
                }}
              >
                Respuestas{" "}
              </Typography>
            </div>
            <br></br>
            <div style={{ marginBottom: "5px" }}></div>
            {rsize > 0 ? (
              items.map((element, rindex) => (
                <div key={rindex} className="w3">
                  <div style={{ fontWeight: "600" }}>
                    {" "}
                    Respuesta - {state.page * state.perPage + rindex + 1}
                  </div>
                  {rcols.map((elem, colindex) => (
                    <div key={colindex}>
                      {colindex + 1}. {elem.header} - {decryptInformation(element[elem.header])}
                    </div>
                  ))}

                  <br></br>
                </div>
              ))
            ) : (
              <h1>No hay respuestas por mostrar</h1>
            )}
            <div className="pagination-txt">
              Mostrando {state.page + 1} de {state.perPage} páginas{" "}
            </div>
            <br />
            <br />
            <div className="float-end">
              <ReactPaginate
                previousLabel={"<<"}
                nextLabel={">>"}
                pageCount={state.perPage}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                activeClassName={"active"}
              />
            </div>
            <br></br>
            <div className="save_form">
              <Button
                variant="contained"
                color="secondary"
                onClick={regresarPrincipal}
                style={{ fontSize: "14px" }}
              >
                Regresar
              </Button>
            </div>

            <div className="user_footer">DGOAE FORMS</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Responses;

