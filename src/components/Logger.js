
const Logger = props => {
    const rendered = String(props.income)
    return <span>{rendered}</span>
}

export default Logger;
export const setup ={
    receiver: true,
    income: ''
}

