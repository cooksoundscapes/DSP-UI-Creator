const Toggle = props => {
    return (
    <label style={{color: "white"}}>
        {props.label}
    <input type="checkbox" 
        onChange={event => {
            props.sendMessage(parseInt(+event.target.checked), 'state');
            console.log(event.target.checked)
        }}
    />
    </label>
    )
}

export default Toggle;

export const setup = {
    label: ""
}