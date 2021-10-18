const Panel = props => {
    return (
        <div style={{
                     gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
                     gridTemplateRows: `[label] 1em repeat(${props.rows}, 1fr [body])`,
                     width: props.size[0] || 260, 
                     height: props.size[1] || 260}}
            className={props.theme+'_panel'} >
            <h5 style={{
                userSelect: 'none',
                margin: 0,
                gridColumn: `1 / ${props.columns+1}`
            }}>{props.label}</h5>
            {props.children}
        </div>
    )

}

export default Panel;

export const setup = {
    description: 'empty panel; drop something onto it',
    container: true,
    theme: 'basic',
    size: [260,260],
    columns: 2,
    rows: 2,
    label: '',
}