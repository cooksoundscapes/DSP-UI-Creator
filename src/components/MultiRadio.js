const MultiRadio = props => { 
    return props.choices.map( (item, i) => {
        return (
            <label key={i}>
                <input type='radio' name={props.id} value={i} checked={i == props.value}
                       onChange={e => props.sendMessage(e.target.value, 'value')}
                />
                {item}
            </label>
        )
    })
}

export default MultiRadio;
export const setup = {
    description: "Multi selector",
    label: "",
    choices: ["one", "two", "three", "four"],
    value: 0
}