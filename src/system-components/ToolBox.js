import * as tools from '../components';
import '../styles/ToolBox.scss';
import Tooltip from '../system-components/Tooltip';

const ToolBox = () => {
    const handleDrag = event => {
        event.target.classList.add('while-dragging')
        event.dataTransfer.setData("text", event.target.textContent)
    }

    const dragEnd = event => {
        event.target.classList.remove('while-dragging')
    }

    const renderMenu = () => {
        const toolList = [];
        for (let tool in tools) {
            const suffix = tool.slice(-6);
            if (suffix == '_setup') continue;
            const setup = tools[tool+'_setup'];
            let helptext;
            if (setup) helptext = setup.description;
            const item = (    
            <Tooltip key={tool+'_tt'}
                     place='side'
                     text={helptext || 'No one described this... yet!'}>
                <li draggable onDragStart={handleDrag} onDragEnd={dragEnd} key={tool} >
                    {tool}
                </li>
            </Tooltip>
            )
            toolList.push(item);
        }
        return toolList;
    }

    return (
    <div className='toolbox-container'>
        <ul>
            {renderMenu()}
        </ul>
    </div>
    )
}

export default ToolBox;