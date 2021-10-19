import '../styles/ComponentMenu.scss';
import { useSelector } from 'react-redux';
import { MdLabelOutline, MdOutlineBrush, 
         MdOutlineDelete, MdOutlineMoreHoriz } from 'react-icons/md'
import Tooltip from './Tooltip';

const ComponentMenu = props => {
    const objectModel = useSelector( state => state.global.objectModel);
    const target = objectModel.find( item => item.id == props.targetid);
    const targetObj = document.getElementById(props.targetid);
    
    const renderButtons = () => {
        const entries = [
            [<MdLabelOutline />, 'change label'],
            ['OSC', 'change OSC path'],
            [<MdOutlineBrush />, 'change theme'],
            [<MdOutlineDelete />, 'delete object'],
            [<MdOutlineMoreHoriz />, 'more'],
        ]
        return entries.map( (item, index) => (
            <Tooltip key={index} text={item[1]} balloon>
                <button>{item[0]}</button>
            </Tooltip>
        ))
    }

    return (
        <nav onClick={event => event.stopPropagation()} className='component-menu'
             style={{
                 left: target.x,
                 top: target.y + (target.y > 100 ? -60 : targetObj.offsetHeight + 20)
             }}>
            {renderButtons()}
        </nav>
    )
}

export default ComponentMenu;