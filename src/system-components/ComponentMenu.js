import '../styles/ComponentMenu.scss';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changeOSCPath, updateParams, deleteObject } from '../main-slice';
import { MdLabelOutline, MdOutlineBrush, 
         MdOutlineDelete, MdOutlineMoreHoriz } from 'react-icons/md'
import Tooltip from './Tooltip';

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

const ComponentMenu = props => {
    const [more, setMore] = useState(false);
    const [helper, setHelper] = useState(false);
    const helperRef = useRef();
    const objectModel = useSelector(state => state.global.objectModel);
    const dispatcher = useDispatch();
    const target = objectModel.find(item => item.id == props.targetid);
    const targetObj = document.getElementById(props.targetid);
    const allParams = Object.entries(target.params);
    const validParams = allParams.filter( param => {
        return !(['value','theme','size', 'label', 
                'container', 'description'].includes(param[0]))
    });

    useEffect( () => {
        if (helper) helperRef.current.focus()
    }, [helper])

    const entries = [
        [<MdLabelOutline />, 'change label', () => {
            setHelper(helper != 'label' ? 'label' : null);
            setMore(false)
        }],
        ['OSC', 'change OSC path', () => {
            setHelper(helper != 'path' ? 'path' : null);
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

    const menuChanges = (item, value=null) => {
        switch (typeof(item[1])) {
            case 'string':
                setHelper(item[0]);
                break;
            case 'number':
                const newValue = !value ? 0 :
                    Number.isInteger(value) ? 
                    parseInt(value) : 
                    parseFloat(value);
                    dispatcher(updateParams({
                        id: props.targetid, 
                        param: item[0], 
                        value: newValue}))
                break;
            case 'boolean':
                dispatcher(updateParams({
                    id: props.targetid, 
                    param: item[0], 
                    value: value}))
                break;
        }
    }

    const handleChanges = event => {
        const value = event.target.value;
        if (helper == 'path') {
            if (!value.startsWith('/')) return;
            dispatcher(changeOSCPath({id: props.targetid, path:value}));
        } else {
            dispatcher(updateParams({id: props.targetid, param: helper, value: value}))
        }
    }
    
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
            { helper ? 
                <input className='menu-helper' type='text' ref={helperRef} 
                    onChange={handleChanges} 
                    spellCheck={false}
                    value={target[helper] || target.params[helper] || ''} />
            : null}
            { more ? 
                <MoreMenu paramSetter={menuChanges} items={validParams} /> 
            : null}
        </nav> 
    )
}

export default ComponentMenu;