import React, { useEffect, useState } from 'react'
import { Button, Typography} from '@material-ui/core'
import { useNavigate, useParams } from 'react-router-dom'
import "./UserForm.css"
import { useStateValue } from "./StateProvider"


function ViewUserForm() {
    
    const { id } = useParams();
    var quest = [];
    var navigate = useNavigate();
    var [answer, setAnswer] = useState([]);
    var [{ questions, doc_name, doc_desc }, dispatch] = useStateValue();

    useEffect(
        () => {
            questions.map((q) => {
                answer.push({
                    "question": q.questionText,
                    "answer": " "
                })
            })

            questions.map((q, qindex) => {
                quest.push({ "header": q.questionText, "key": q.questionText });
                
            })

        }, [])

    function select(que, option) {



        var k = answer.findIndex((ele) => (ele.question === que));
        answer[k].answer = option;
        setAnswer(answer);
   
    }

    function selectInput(que, option) {

    
        var k = answer.findIndex((ele) => (ele.question === que));
        answer[k].answer = option;
        setAnswer(answer);
    
    }

    function selectCheck(e, que, option) {

 

        var d = [];
        var k = answer.findIndex((ele) => (ele.question === que));
        if (answer[k].answer) {
            d = answer[k].answer.split(",");
        }
        if (e === true) {
            d.push(option);
        } else {
            var n = d.findIndex((el) => (el.option === option));
            d.splice(n, 1);
        }
        answer[k].answer = d.join(",")
        setAnswer(answer);
   
    }

    function regresar(){
        navigate(`/form/${id}`)
    }

    return (
        <div className='submit'>
            <div className='user_form'>
                <div className='user_form_section'>

                    <div className='user_title_section'>
                        <Typography style={{ fontSize: "26px" }}>{doc_name}</Typography>
                        <Typography style={{ fontSize: "15px" }}>{doc_desc}</Typography>
                    </div>
                    {
                        questions.map((question, qindex) => (
                            <div className='user_form_questions' key={qindex}>
                                <Typography style={{ fontSize: "15px", fontWeight: "400", letterSpacing: ".1px", lineHeight: "24px", paddingBottom: "8px" }}>
                                    {qindex + 1}.{question.questionText}</Typography>
                                {
                                    question.options.map((option, index) => (

                                        <div key={index} style={{ marginBottom: '5px' }}>
                                            <div style={{ display: 'flex' }}>
                                                <div className='form_check'>
                                                    {
                                                        question.questionType !== "radio" ? (
                                                            question.questionType !== "text" ? (
                                                                <label>
                                                                    <input
                                                                        type={question.questionType}
                                                                        name={qindex}
                                                                        value={option.optiontText}
                                                                        className="form_check_input"
                                                                        required={question.required}
                                                                        style={{ marginLeft: "5px", marginRight: "5px" }}
                                                                        onChange={(e) => { selectCheck(e.target.checked, question.questionText, option.optiontText) }} />
                                                                    {option.optionText}

                                                                </label>) : (
                                                                <label>
                                                                    <input
                                                                        type={question.questionType}
                                                                        name={qindex}
                                                                        value={""}
                                                                        className="form_check_input"
                                                                        required={question.required}
                                                                        style={{ marginLeft: "5px", marginRight: "5px", width:"250px"}}
                                                                        onChange={(e) => { selectInput(question.questionText, e.target.value) }}
                                                                    />{""}
                                                                </label>
                                                            )) : (


                                                            <label>
                                                                <input
                                                                    type={question.questionType}
                                                                    name={qindex}
                                                                    value={option.optiontText}
                                                                    className="form_check_input"
                                                                    required={question.required}
                                                                    style={{ marginLeft: "5px", marginRight: "5px" }}
                                                                    onChange={(e) => { select(question.questionText, option.optiontText) }}
                                                                />{option.optionText}
                                                            </label>

                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ))}

                        <div className='user_form_submit'>
                            <Button variant="contained" color="primary" onClick={regresar} style={{fontSize:"14px"}}>Regresar</Button>
                        </div>
                        <div className='user_footer'>
                                DGOAE-FORMS
                        </div>
                </div>
            </div>
        </div>
    )
}

export default ViewUserForm