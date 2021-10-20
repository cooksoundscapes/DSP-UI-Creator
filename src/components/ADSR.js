
import {useEffect, useRef} from 'react';

const ADSR = props => {
    const cnv = useRef()
    const {values, maxTime, AtkCurve, DecCurve, RelCurve, path} = props;
    //Atk, dec and rel values are in Ms and grow on exponential curve; for drawing,
    //convert them to 0-1 range and back to linear values;
    const lin_values = values.map( (v,i) => i != 2 ? Math.pow(v / maxTime, .25) : v); 

    useEffect( () => { //drawing event;
        const canvas = cnv.current;
        const padding = 8;
        const width = canvas.width - padding;
        const height = canvas.height - padding;

        const A = Math.max(padding, width*.25*(1 - lin_values[0]));
        const D = width*.25*lin_values[1]+width*.25;
        const S = Math.max(padding, height * (1-lin_values[2]));
        const R = width*.25*lin_values[3]+width*.75;

        const AtkCtrlPoint = [
            Math.max(A,AtkCurve*width*.25), 
            Math.max(padding, AtkCurve*height) 
        ]
        const DecCtrlPoint = [
            width*.25+(1-DecCurve)*width*.25*lin_values[1], 
            Math.max(padding, DecCurve*S) 
        ];
        const RelCtrlPoint = [
            width*.75+(1-RelCurve)*width*.25*lin_values[3],                   
            Math.max(S,RelCurve*height)
        ];

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();    
        ctx.strokeStyle = '#9090ee';
        const grad = ctx.createLinearGradient(padding, padding, padding, height);
              grad.addColorStop(0, '#9090eea0');
              grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.moveTo(A, height);
        ctx.bezierCurveTo(...AtkCtrlPoint, width*.25, padding, width*.25, padding);
        ctx.bezierCurveTo(...DecCtrlPoint, D, S, D, S);
        ctx.lineTo(width*.75, S);
        ctx.bezierCurveTo(...RelCtrlPoint, ...RelCtrlPoint, R, height);
        ctx.stroke();
        ctx.fill()
    }, [values, props.size])

    let startPos, x_pos, type;

    const handleDrag = event => {
        startPos = [event.clientX, event.clientY];
        x_pos = event.clientX - event.target.offsetLeft - event.target.offsetParent.offsetLeft;
        type = Math.floor(4*(x_pos / event.target.clientWidth));
        window.addEventListener('mousemove', moving)
        window.addEventListener('mouseup', endMove)
    }

    const moving = event => {
        const move = [event.clientX - startPos[0],
                      event.clientY - startPos[1]];
        let change;
        let curveChange;
        switch (type) {
            case 0:
                change = move[0] * -.01;
                curveChange = Math.max(0,Math.min(1,AtkCurve + move[1]*.01));
                props.sendMessage(props.id, 'AtkCurve', curveChange, path+'/curve/A')
                break;
            case 1:
                change = move[0] * .01;
                curveChange = Math.max(0,Math.min(1,DecCurve + move[1]*.01));
                props.sendMessage(props.id, 'DecCurve', curveChange, path+'/curve/D')
                break;
            case 2:
                change = move[1] * -.01;
                break;
            case 3:
                change = move[0] * .01;
                curveChange = Math.max(0,Math.min(1,RelCurve + move[1]*.01));
                props.sendMessage(props.id, 'RelCurve', curveChange, path+'/curve/R')
                break;
        }
        change = Math.max(0, Math.min(1, lin_values[type] + change));
        let newValues = [...lin_values];
        newValues[type] = change;
        newValues = newValues.map( (v,i) => i == 2 ? v : Math.pow(v,4)*maxTime)
        props.sendMessage(props.id, 'values', newValues, path);
    }
    const endMove = () => {
        window.removeEventListener('mousemove', moving)
        window.removeEventListener('mouseup', endMove)
    }

    return (
        <canvas width={props.size} height={props.size*.5} className='adsr-canvas' ref={cnv} 
            style={{position: 'relative', width: '100%', height: '100%'}} 
            onMouseDown={handleDrag} />
    )
}

export default ADSR;

export const setup = {
    description: 'Classic ADSR controls',
    size: 128,
    values: [5, 3000, .5, 600],
    AtkCurve: 0.5,
    DecCurve: 0.5,
    RelCurve: 0.666,
    maxTime: 10000
}   
