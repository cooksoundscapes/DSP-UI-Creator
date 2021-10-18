const Knob = props => {
    const {min, max, value, size} = props;
    let startPos;
    
    const turnKnob = event => {
        startPos = [event.clientX, event.clientY];
        window.addEventListener('mousemove', moving)
        window.addEventListener('mouseup', endMove)
    }
    const moving = event => {
        const move = [event.clientX - startPos[0],
                      event.clientY - startPos[1]];
        const increment = move[0] - move[1];
        const newVal = Math.max(min, Math.min(max, value + increment));
        const path = '/'+props.id;
        props.sendMessage(props.id, 'value', newVal, path)
    }
    const endMove = () => {
        window.removeEventListener('mousemove', moving)
        window.removeEventListener('mouseup', endMove)
    }

    return (
        <div style={{width: size+16, 
                     textAlign: 'center', 
                     userSelect: 'none'}}>
            <div style={{
                width: size+16,
                height: size+16,
                padding: 7,
                borderRadius: '50%',
                borderTop: `solid 1px ${props.labelColor}`,
                borderLeft: `solid 1px ${props.labelColor}`,
                borderRight: `solid 1px ${props.labelColor}`,
                borderBottom: 'solid 1px transparent'
            }}>
                <span className={props.theme+'_knob'} 
                    style={{width: size, height: size}}></span>
                <span className={props.theme+'_knob'} onMouseDown={turnKnob}
                    style={{width: size, height: size,
                    transform: `rotate(${(value/max*280)-140}deg)`,
                    boxShadow: 'none'}}></span>
            </div>
            <span style={{color: props.labelColor}}>
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
    value: 32,
    theme: 'basic',
    size: 64,
    markers: []
}
