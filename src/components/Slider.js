
const Slider = (props) => {
    
    const handleChange = ({target}) => {
        const path = '/'+props.id;
        props.sendMessage(props.id, 'value', target.value, path)
    }
    
    return (
        <label className={props.theme+'_label'}>{props.label}
            <input onChange={handleChange} 
            type='range' min={props.min} max={props.max} value={props.value} />
        </label>
    )
}

export default Slider;

export const setup = {
    description: 'Simple 1-param slider',
    label: 'Volume',
    theme: 'basic',
    size: [130,16],
    min: 0,
    max: 127,
    value: 64
}
