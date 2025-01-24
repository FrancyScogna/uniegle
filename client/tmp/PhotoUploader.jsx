import React, { useState, useRef, useEffect } from "react";
import { compressBase64Image } from "../src/libs/image_manipulation";

const PhotoUploader = ({setStep}) => {
    const [image, setImage] = useState(undefined);
    const [cameraActive, setCameraActive] = useState(false);
    const [nickname, setNickname] = useState("");
    const videoRef = useRef();
    const canvasRef = useRef();
    const inputFileRef = useRef();

    useEffect(() => {
        const userDataJSON = localStorage.getItem("userData");
        const userData = JSON.parse(userDataJSON);
        if(userData){
            setImage(userData.imgSrc);
            setNickname(userData.nickname);
        }
    },[])

    // Caricamento immagine dal computer
    const handleImageUpload = (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                setImage(await compressBase64Image(e.target.result));
            };
            reader.readAsDataURL(file);
        }
    };

    // Attiva webcam
    const startCamera = async () => {
        setCameraActive(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
    };

    // Scatta una foto dalla webcam
    const takePhoto = async() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = await compressBase64Image(canvas.toDataURL("image/jpeg"));
        setImage(image);
        stopCamera();
    };

    // Disattiva la webcam
    const stopCamera = () => {
        const stream = videoRef.current.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
        setCameraActive(false);
    };

    const onChangeNickname = (e) => {
        setNickname(e.target.value);
    }

    const onClickEliminaFoto = () => {
        setImage(undefined);
    }

    const onClickProsegui = () => {
        if(image && nickname){
            const userData = {
                imgSrc: image,
                nickname
            }
            localStorage.setItem("userData", JSON.stringify(userData))
            setStep(2);
        }
    }

    return (
        <div>

            <h1>Inserisci un nickname</h1>

            <div style={{ marginBottom: "20px" }}>
                <input type="text" onChange={onChangeNickname} value={nickname}/>
            </div>

            <h1>Carica o Scatta una Foto</h1>

            {/* Pulsante per caricare immagine */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{display: "none"}}
                    ref={inputFileRef}
                />
                <button onClick={() => inputFileRef.current.click()}>Carica una Foto</button>
            </div>

            {/* Pulsante per scattare una foto */}
            <div style={{ marginBottom: "20px" }}>
                {cameraActive ? (
                    <>
                        <video
                            ref={videoRef}
                            style={{
                                width: "300px",
                                display: "block",
                                marginBottom: "10px",
                            }}
                        />
                        <button onClick={takePhoto}>Scatta Foto</button>
                        <button onClick={stopCamera}>Chiudi Fotocamera</button>
                    </>
                ) : (
                    <button onClick={startCamera}>Apri Fotocamera</button>
                )}
            </div>

            <div>
                <button onClick={onClickEliminaFoto}>Elimina foto</button>
            </div>

            {/* Mostra immagine caricata o scattata */}
            {image && (
                <div style={{ marginTop: "20px" }}>
                    <h2>Anteprima Immagine</h2>
                    <img
                        src={image}
                        alt="Caricata o scattata"
                        style={{
                            maxWidth: "300px",
                            height: "auto",
                            border: "1px solid black",
                        }}
                    />
                </div>
            )}

            {/* Canvas nascosto per scattare la foto */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            { nickname && image && (
            <>
            <h2>Prosegui con la chat</h2>
            <button onClick={onClickProsegui}>Prosegui</button>
            </>
            )
            }
        </div>
    );
};

export default PhotoUploader;
