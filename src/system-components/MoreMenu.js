const MoreMenu = props => {
    const renderItems = () => {
        return props.items.map( (item, i) => {
            const type = typeof(item[1]);
            return (
            <li onClick={type == 'string' ? () => props.paramSetter(item) : null} key={i}>
                {item[0]}
                {type == 'number' ?
                    <input className='inline-helper' type='number' step='0.1' value={item[1]} 
                        onChange={({target}) => {
                            props.paramSetter(item, target.value)
                        }} />
                : type == 'boolean' ? 
                    <input className='inline-helper' type='checkbox' checked={item[1]} 
                        onChange={({target}) => {
                            props.paramSetter(item, target.checked)
                        }} />
                : null}
            </li>
            )
        })
    }
    return (
        <ul className='more-menu'>
            {renderItems()}
        </ul>
    )
}

export default MoreMenu;