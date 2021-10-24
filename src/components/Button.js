
const Button =  props => {
    const measures = {
        fontSize: props.size >= 128 ? '3em' : 
                  props.size >= 80 ? '2em' : 
                  props.size <= 32 ? '.75em' : '1em',
        padding: props.size >= 80 ? 16 : 
                 props.size <= 32 ? 4 : 8,
        
    }

    return (
        <div>
            <button onClick={() => props.sendMessage(props.path, 'click', 'bang')}
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
    label: 'Click me!',
    theme: 'basic',
    size: 48,
    click: null
}