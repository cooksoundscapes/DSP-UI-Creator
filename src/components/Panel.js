const Panel = props => {
    return (
        <div style={{width: props.size[0] || 260, 
                     height: props.size[1] || 260}}
            className={props.theme+'_panel'} >
            <h5 style={{
                userSelect: 'none',
                margin: 0,
            }}>{props.label}</h5>
        </div>
    )

}

export default Panel;

export const setup = {
    description: 'empty panel; drop something onto it',
    container: true,
    theme: 'basic',
    size: [256,256],
    label: '',
}