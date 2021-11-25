const Toggle = props => {
    return (
    <label style={{color: "white"}}>
        {props.label}
    <input type="checkbox" 
        onChange={event => props.sendMessage(props.path, "state", event.target.value)}
    />
    </label>
    )
}

export default Toggle;

export const setup = {
    label: ""
}