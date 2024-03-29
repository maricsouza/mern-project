import styled from "styled-components";


export default function ImBox (props) {

    let imbox = props.info.filme;

    return (
        <BoxImage>
            <div className="image"> <img src={imbox.capa} alt="" width="180em" height="280em" /> </div>
            <div className="texts">
                <div className="title"> {imbox.nome} </div>
                <div className="description"> {imbox.idiomas} </div>
                <div className="description"> Classificação {imbox.classificacao}  </div>
            </div>
        </BoxImage>
    )
}

const BoxImage = styled.div`

        background-color: #AA0A0A;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 0.3em;

        margin-right: 4em;

        
        box-shadow: 2px -2px 3px 2px rgba(11, 0, 0, 0.25);
        border-radius: 16px 16px 16px 0px;

    .title {
        width: 9.5em;
        color: rgba(255, 202, 118, 1);
        font-size: large;

        margin-bottom: 0.5em;
        text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    }

`