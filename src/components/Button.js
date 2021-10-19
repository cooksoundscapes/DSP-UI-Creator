
const Button =  props => {
    const measures = {
        fontSize: props.size == 'large' ? '2em' : props.size == 'small' ? '.5em' : '1em',
        padding: props.size == 'large' ? 16 : props.size == 'small' ? 4 : 8,
    }

    return (
        <div>
            <button onClick={() => props.sendMessage(props.id, 'click', 'bang', props.path)} 
                    className={props.theme+'_button'}
                    style={measures}>
                {props.label}
            </button>
        </div>
    )
}

export default Button;

export const setup = {
    description: 'Stateless click button',
    label: '',
    theme: 'basic',
    size: 'medium',
    click: null
}