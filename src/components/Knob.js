const Knob = props => {
    const {min, max, value, size, ring, x, y} = props;
    const knobCenter = [size/2 + x, size/2 + y];
    const deegrees = ((.75*value/max)*360-135)%360;
    const turnKnob = () => {
        window.addEventListener('mousemove', moving)
        window.addEventListener('mouseup', endMove)
    }
    const moving = event => {
        const deltas = [
            event.clientY - knobCenter[1],
            event.clientX - knobCenter[0]
        ]
        const radians = Math.atan2(...deltas);
        const deg = (radians * (180/Math.PI)+450) % 360;
        if (160 < deg && deg < 225) return; //dead zone!
        let newVal = ((deg+135)%360)/360*max*1.25; 
        newVal = Math.max(min, Math.min(max, newVal));
        props.sendMessage(props.id, 'value', newVal, props.path)
    }
    const endMove = () => {
        window.removeEventListener('mousemove', moving)
        window.removeEventListener('mouseup', endMove)
    }
    const ringStyle = {
        width: size+16,
        height: size+16,
        padding: 7,
        borderRadius: '50%',
        borderTop: `solid 1px ${props.labelColor}`,
        borderLeft: `solid 1px ${props.labelColor}`,
        borderRight: `solid 1px ${props.labelColor}`,
        borderBottom: 'solid 1px transparent'
    }
    return (
        <div style={{width: size + (ring ? 16 : 0), 
                     textAlign: 'center', 
                     userSelect: 'none'}}>
            <div style={ring ? ringStyle : {width: size,height: size}}>
            <span className={props.theme+'_knob'} 
                style={{width: size, height: size}}></span>
            <span className={props.theme+'_knob'} onMouseDown={turnKnob}
                style={{width: size, height: size,
                transform: `rotate(${deegrees}deg)`,
                boxShadow: 'none'}}></span>
        </div>
            <span style={{  color: props.labelColor}}>
                {props.label} </span>
        </div>
    )
}

export default Knob;

export const setup = {
    description: 'Simple knob',
    label: 'Level',
    labelColor: '#d1d1d1',
    min: 0,
    max: 127,
    value: 64,
    theme: 'basic',
    ring: true,
    size: 48,
    markers: []
}
