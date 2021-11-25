import { useEffect, useRef, useState } from "react";

const AudioInput = props => {
    const scope = useRef();
    const audio = useRef();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            margin: 0, padding: 10,
            background: "cadetblue",
            color: "#e1e1e1"
        }}>
            Look mum, I'm receiving audio!
            <audio ref={audio} src='http://localhost:5678/stream' controls autoPlay/>
            <canvas ref={scope} />
        </div>
    )
}

export default AudioInput;
export const setup = {level: 0}

/*
const waveFrame = (canvas, buffer) => {
        const ctx = canvas.getContext('2d');
        const {width, height} = canvas;
        const jump = buffer.length / width;
        ctx.clearRect(0,0,width,height);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(0, height/2);
        for (let i = 0; i < buffer.length; i++) {
            ctx.lineTo(i * jump, (buffer[i]*-1+1)*(height*.5));
        }
        ctx.stroke()
    }
    const meter = (canvas, buffer) => {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += Math.abs(buffer[i]); 
        }
        sum = sum/buffer.length;
        const ctx = canvas.getContext('2d');
        const {width, height} = canvas;
        const level = width * sum;
        ctx.clearRect(0,0,width,height);
        ctx.beginPath()
        ctx.rect(0,0,level,height)
        ctx.fill()
    }   
*/