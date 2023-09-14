
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IconButton, Switch, Typography } from '@material-ui/core'
import MoreVert from '@material-ui/icons/MoreVert'
import axios from 'axios'
import './Summary.css'
import Button from '@material-ui/core/Button'
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

function Summary() {


    const { id } = useParams();

    var [responses, setResponses] = useState([]);
    var [rsize, setRSize] = useState(0);
    var [rcols, setRCols] = useState([]);
    var [questions, setQuestions] = useState([]);
    var navigate = useNavigate();

    //let items = [];

    useEffect(() => {

        async function getReponses() {

            var request = await axios.get(`http://localhost:9000/getResponses?id=${id}`);

            responses = request.data.resp;

            rsize = request.data.rsize;
            rcols = request.data.columns;
            questions = request.questions;


            setResponses(responses);
            setRSize(rsize);
            setRCols(rcols);
            setQuestions(questions);


        };

        getReponses();

    }, []);

    async function descargaExcel() {

        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const ws = XLSX.utils.json_to_sheet(responses);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: fileType});

        FileSaver.saveAs(data, id + fileExtension);

        
    }

    function evalResponses(){
        

        let resumen = {}; 

    }


    function regresarPrincipal() {
        navigate("/");
    }


    return (
        <div className='submit' style={{ height: "76vh" }}>
            <div className='user_form'>
                <div className='user_form_section'>
                    <div className='user_form_questions' style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography style={{ fontSize: "15px", fontWeight: "400", letterSpacing: ".1px", lineHeight: "24px", paddingBottom: "8px", fontSize: "24px" }} >Resumen de las respuestas</Typography>

                        </div>
                        <div>

                            Total de aplicaciones {rsize}
                        </div>
                    </div>

                </div>



                <div className='user_form_section'>
                    <div className='user_form_questions' style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography style={{ fontSize: "15px", fontWeight: "400", letterSpacing: ".1px", lineHeight: "24px", paddingBottom: "8px", fontSize: "24px" }} >Resumen </Typography>

                        </div>
                        <br></br>
                        <div style={{ margin: "5px" }}>
                            <span>Descargar Excel </span>
                            <Button variant='contained' color='primary' onClick={(e) => descargaExcel()}style={{ fontSize: '12px' }}>Descargar</Button>
                        </div>

                        <br></br>
                        <div className='save_form'>
                            <Button variant='contained' color='secondary' onClick={regresarPrincipal} style={{ fontSize: '10px' }}>Regresar</Button>
                        </div>


                        <div className='user_footer'>
                            DGOAE FORMS
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Summary


