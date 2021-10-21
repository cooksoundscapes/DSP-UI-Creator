import '../styles/ComponentMenu.scss';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changeOSCPath, updateParams, deleteObject } from '../main-slice';
import { MdLabelOutline, MdOutlineBrush, 
         MdOutlineDelete, MdOutlineMoreHoriz } from 'react-icons/md'
import Tooltip from './Tooltip';

const MoreMenu = props => {
    const renderItems = () => {
        return props.items.map( (item, i) => (
            <li onClick={() => props.paramGetter(item)} 
                key={i}>{item[0]}</li>
        ))
    }
    return (
        <ul className='more-menu'>
            {renderItems()}
        </ul>
    )
}

const ComponentMenu = props => {
    const [more, setMore] = useState(false);
    const [helper, setHelper] = useState(false);
    const [helperType, setType] = useState('text')
    const helperRef = useRef();
    const objectModel = useSelector(state => state.global.objectModel);
    const dispatcher = useDispatch();
    const target = objectModel.find(item => item.id == props.targetid);
    const targetObj = document.getElementById(props.targetid);
    const allParams = Object.entries(target.params);
    const validParams = allParams.filter( param => {
        return !(['value','theme','size', 'label', 'container', 'description'].includes(param[0]))
    });

    const entries = [
        [<MdLabelOutline />, 'change label', () => {
            setHelper(helper != 'label' ? 'label' : null);
            setType('text')
            setMore(false)
        }],
        ['OSC', 'change OSC path', () => {
            setHelper(helper != 'path' ? 'path' : null);
            setType('text')
            setMore(false)  
        }],
        [<MdOutlineBrush />, 'change theme'],
        [<MdOutlineDelete />, 'delete object', () => {
            dispatcher(deleteObject(props.targetid));
            props.onClose()
        }],
        [<MdOutlineMoreHoriz />, 'more', () => {
            setMore(!more);
            setHelper(false);
        }],
    ]

    const processParam = param => {
        if (typeof(param[1]) == 'string') {
            setHelper(param[0])
            setType('text')
        } else if (typeof(param[1]) == 'number') {
            setHelper(param[0])
            setType('number')
        }
        else if (typeof(param[1]) == 'boolean') {
            setHelper(param[0])
            setType('checkbox')
        }
    }
    const handleChanges = event => {
    const value = helperType == 'checkbox' ? eval(event.target.checked) :
                                            event.target.value;
        if (helper == 'path') {
            if (!value.startsWith('/')) return;
            dispatcher(changeOSCPath({id: props.targetid, path:value}));
        } else {
            dispatcher(updateParams({id: props.targetid, param: helper, value: value}))
        }
    }
    useEffect( () => {
        if (helper) helperRef.current.focus()
    }, [helper])

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
            { helper ? <input type={helperType} ref={helperRef} 
                            onChange={handleChanges} 
                            spellCheck={false}
                            value={target[helper] || target.params[helper] || ''}
                            checked={helperType == 'checkbox' ? target.params[helper] : null} />
            : null}
            { more ? <MoreMenu paramGetter={processParam} items={validParams} /> : null}
        </nav> 
    )
}

export default ComponentMenu;