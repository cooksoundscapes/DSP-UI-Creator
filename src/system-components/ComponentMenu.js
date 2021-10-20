import '../styles/ComponentMenu.scss';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changeOSCPath, updateParams, deleteObject } from '../main-slice';
import { MdLabelOutline, MdOutlineBrush, 
         MdOutlineDelete, MdOutlineMoreHoriz } from 'react-icons/md'
import Tooltip from './Tooltip';

const ComponentMenu = props => {
    const [form, setForm] = useState(false);
    const formRef = useRef();
    const objectModel = useSelector(state => state.global.objectModel);
    const dispatcher = useDispatch();
    const target = objectModel.find(item => item.id == props.targetid);
    const targetObj = document.getElementById(props.targetid);
    
    const entries = [
        [<MdLabelOutline />, 'change label', () => setForm(form != 'label' ? 'label' : null)],
        ['OSC', 'change OSC path', () => setForm(form != 'path' ? 'path' : null)],
        [<MdOutlineBrush />, 'change theme'],
        [<MdOutlineDelete />, 'delete object', () => {
            dispatcher(deleteObject(props.targetid));
            props.onClose()
        }],
        [<MdOutlineMoreHoriz />, 'more'],
    ]
    const handleChanges = event => {
        const v = event.target.value;
        if (form == 'path') {
            if (!v.startsWith('/')) return;
            dispatcher(changeOSCPath({id: props.targetid, path:v}))
        } else if (form == 'label') {
            dispatcher(updateParams({id: props.targetid, param: 'label', value: v}))
        }
    }
    useEffect( () => {
        if (form) formRef.current.focus()
    }, [form])

    const renderButtons = () => (
        entries.map( (item, index) => (
            <Tooltip key={index} text={item[1]} delay={250} balloon>
                <button onClick={item[2]}>{item[0]}</button>
            </Tooltip>
        ))
    )

    return (
        <nav onClick={event => event.stopPropagation()} className='component-menu'
             style={{
                 left: Math.max(16, Math.min(target.x+(targetObj.offsetWidth-270)/2, 
                         window.innerWidth - 270)),
                 top: target.y + (target.y > 100 ? -60 : targetObj.offsetHeight + 20)
             }}>
            {renderButtons()}
            { form ? <input type='text' ref={formRef} 
                            onChange={handleChanges} 
                            spellCheck={false}
                            value={target[form] || target.params[form]} />
            : null}
        </nav> 
    )
}

export default ComponentMenu;