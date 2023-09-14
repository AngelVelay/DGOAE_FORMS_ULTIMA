
import axios from "axios";
import React, { useEffect, useState } from "react";


import { Link, useNavigate, useParams } from "react-router-dom";
import LottieImage from "./LottieImage";
import { ClipboardCopy } from "./ClipBoard";

const SaveForm = () => {
  const { id } = useParams();

  var [global_id, setGlobal] = useState(-1);
  useEffect(() => {
    async function getGlobalID() {
      var request = await axios.get(
        `http://localhost:9000/getGlobalID?id=${id}`
      );
      setGlobal(request.data.gid);
    }

    getGlobalID();
  }, []);

  var navigate = useNavigate();

  const goToHome = () => {
    navigate("/");
  };

  return (
    <section id="home" className="min-h-[90vh] grid grid-cols-1 xl:grid-cols-8">
      {/* Information */}
      <div className="md:col-span-5 flex items-center justify-center p-8 xl:p-16">
        <div className="flex flex-col gap-8">
          <h1 className="text-2xl xl:text-4xl font-bold xl:leading-[7.5rem]">
            Formulario Guardado con exito
          </h1>

          <p className="text-gray-500 text-2xl leading-[2.5rem]">
            Copia el siguiente link para el uso del cuestionario:
            <br />
          </p>

          <ClipboardCopy copyText={window.location.origin + "/response/" + global_id}/>
          {/* <Link to={"/response/" + global_id} style={
            {
              color: "black",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "1.5rem",
              fontWeight: "bold"
            }
          }>
            <label className="text-gray-900 text-xl leading-[2.5rem]" style={
              {cursor: "pointer",}
            }>
              {window.location.origin + "/response/" + global_id}
            </label>
          </Link> */}
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* <Button
              color="primary"
              variant="contained"
              style={{ border: "2px solid blueviolet" }}
              onClick={() => goToHome()}
            >
              Regresar al Inicio
            </Button> */}
            <button
              onClick={goToHome}
              className="w-full xl:w-auto bg-sky-800 text-white py-2 px-8 rounded-xl text-xl"
            >
              Regresar al Inicio
            </button>
          </div>
        </div>
      </div>
      {/* Image */}
      <div className="md:col-span-3 flex items-center justify-center relative">
        {/* Content image */}
        <div>
          <LottieImage />
        </div>
      </div>
    </section>
  );
};

export default SaveForm;
