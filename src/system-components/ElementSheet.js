import { useDispatch, useSelector } from "react-redux";
import { repositionObj, updateParams } from "../lib/main-slice";
import * as library from '../components';
import React from 'react';

const ElementSheet = props => {
    const dispatcher = useDispatch();
    const objectModel = useSelector( state => state.global.objectModel);
    const editMode = useSelector( state => state.global.editMode);
    const address = useSelector( state => state.global.ipAddr);
    const {grid, setObjMenu, menuTarget, setDragging} = props;
    
    window.electron.receiveOSC( ({msg}) => {
        const receivers = objectModel.filter( obj => (
            obj.path == msg.address && obj.params.receiver
        ));
        if (receivers.length > 0) {
            receivers.forEach( obj => {
                dispatcher(updateParams({
                    id: obj.id, 
                    param: 'income', 
                    value: msg.args 
                }))
            })
        }
    })
    const snapToGrid = value => {
        return Math.ceil(value/grid)*grid;
    }

    const startDrag = (event, component) => {
        setDragging(true)
        const object = event.currentTarget;
        if (event.altKey) {
            event.dataTransfer.setData('text', JSON.stringify(component));
            event.dataTransfer.effectAllowed = 'copy';
            return;
        }
        const id = component.id;
        const dummy = document.createElement('span');
        event.dataTransfer.setDragImage(dummy, 0, 0);
        event.dataTransfer.setData('text', id);
        event.dataTransfer.effectAllowed = 'move';
        let inner;
        if (component.params.container) {
            inner = objectModel.filter( obj => (
                obj.x >= component.x &&
                obj.y >= component.y &&
                obj.x < (component.x + component.params.size[0]) &&
                obj.y < (component.y + component.params.size[1]) &&
                obj.id !== component.id
            ))
        }
        const startPos = [event.clientX, event.clientY];
        const _moveEl = event => {
            const move = [snapToGrid(event.clientX - startPos[0]),
                          snapToGrid(event.clientY - startPos[1])];
            const max = [window.innerWidth - object.offsetWidth,
                         window.innerHeight - object.offsetHeight];    
            const newX = component.x+move[0];
            const newY = component.y+move[1];
            if (newX > 0 && newX < max[0] && newY > 0 && newY < max[1]) {
                if (component.params.container && inner.length > 0) {
                    inner.forEach( child => {
                        const childX = child.x+move[0];
                        const childY = child.y+move[1];
                        dispatcher(repositionObj({id: child.id, x: childX, y: childY}));
                    })
                }
                dispatcher(repositionObj({id, x: newX, y: newY}));
            }
        }
        const _endDrag = () => {
            setDragging(false)
            object.removeEventListener('drag', _moveEl);
            object.removeEventListener('dragend', _endDrag);
        }
        object.addEventListener('drag', _moveEl);
        object.addEventListener('dragend', _endDrag);
    }
    const startResizing = (event, component) => {
        event.stopPropagation();
        const dummy = document.createElement('span');
        event.dataTransfer.setDragImage(dummy, 0, 0);
        event.dataTransfer.effectAllowed = 'move';
        const id = component.id;
        const startSize = component.params.size;
        if (!startSize) return;
        const startPos = [event.clientX, event.clientY];
        const resize = event => {
            let value;
            const move = [event.clientX - startPos[0],
                        event.clientY - startPos[1]];
            if (Array.isArray(startSize)) {
                value = move.map( (n,i) => snapToGrid(n) + startSize[i]);
            } else {
                value = snapToGrid(move[0]+move[1]) + startSize;
            }
            if ((value > 0) || value.every(n => n>0)) {
                if (Array.isArray(value)) {
                    value.map( n => Math.max(grid, n));
                } else value = Math.max(grid, value);
                dispatcher(updateParams({id, param:'size', value}))
            }
        }
        const endDrag = () => { 
            window.removeEventListener('drag', resize)
            window.removeEventListener('dragend', endDrag)
        }
        window.addEventListener('drag', resize)
        window.addEventListener('dragend', endDrag)
    }
    const openMenu = event => {
        event.stopPropagation()
        if (event.target.id == menuTarget) setObjMenu(null);
        else setObjMenu(event.target.id)
    }
    const objectSheet = objectModel.map( component => {
        const {params, ...rest} = component;
        const wrapperStyle = {
            position: 'absolute',
            left: snapToGrid(component.x),
            top: snapToGrid(component.y),
            padding: editMode ? grid/2 : 0,
            background: editMode ? 'rgba(100,100,200,.4)' : null,
            cursor: editMode ? 'move' : 'default',
            zIndex: params.container ? 0 : 100
        }
        const wrapperProps = {
            style: wrapperStyle, 
            key:component.id, 
            id:component.id, 
            draggable: editMode, 
            onDragStart: editMode ? e => startDrag(e, component): null,
            onClick: editMode ? openMenu : null
        }
        const elementProps = {
            sendMessage: (value, param=null, path=rest.path) => {
                const rootPath = component.parentId ? 
                    objectModel.find( o => o.id == component.parentId).path : '';
                if (param) {
                    dispatcher(updateParams({id: component.id, param, value}));
                }
                if (window.electron) window.electron.sendOSC(rootPath+path, value, address);    
            },
            ...params,
            ...rest,
        }
        const NewElement = React.createElement(library[component.type], elementProps);
        return (
            <div {...wrapperProps} > 
                {editMode ? 
                    <>
                        <div style={{pointerEvents: 'none'}}>{NewElement}</div> 
                        <div className='resizing-tool' 
                             onDragStart={e => startResizing(e, component)} draggable
                             style={{width: grid, height: grid}}></div>
                    </>
                    : NewElement}
            </div>
        )
    });
    return objectSheet
}
    

export default ElementSheet;