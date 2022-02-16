import { useEffect, useRef } from "react";

const Oscilloscope = props => {
    const scope = useRef();

    useEffect( () => {
        let buffer, floatArr, jump, ctx;
        const canvas = scope.current;
        const {width, height} = canvas;
        window.electron.listenToAudio( (audio_data, info) => {
            buffer = audio_data.buffer;
            floatArr = new Float32Array(buffer);
            jump = width / floatArr.length;
            //Draw!
            requestAnimationFrame( () => {
                ctx = canvas.getContext('2d');
                ctx.clearRect(0,0,width,height);
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.strokeStyle = "blue";
                ctx.moveTo(0, height/2);
                for (let i = 0; i < floatArr.length; i++) {
                    ctx.lineTo(i * jump, (floatArr[i]*-1+1)*(height*.5));
                }
                ctx.stroke()
            });
        })
        return () => window.electron.removeAudioListeners()
    }, [props.size])

    return (
        <div style={{
            margin: 0, padding: 10,
            background: "#d1d1d1",
        }}>
            <canvas ref={scope} width={props.size[0]} height={props.size[1]}/>
        </div>
    )
}

export default Oscilloscope;
export const setup = {
    description: "Basic wave oscilloscope",
    label: "Scope-1",
    size: [256, 150]
}