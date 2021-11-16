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

    const startDrag = (event, tool) => {
        setDragging(true)
        const object = event.currentTarget;
        if (event.altKey) {
            event.dataTransfer.setData('text', JSON.stringify(tool));
            event.dataTransfer.effectAllowed = 'copy';
            return;
        }
        const id = tool.id;
        const dummy = document.createElement('span');
        event.dataTransfer.setDragImage(dummy, 0, 0);
        event.dataTransfer.setData('text', id);
        event.dataTransfer.effectAllowed = 'move';
        let inner;
        if (tool.params.container) {
            inner = objectModel.filter( obj => (
                obj.x >= tool.x &&
                obj.y >= tool.y &&
                obj.x < (tool.x + tool.params.size[0]) &&
                obj.y < (tool.y + tool.params.size[1]) &&
                obj.id !== tool.id
            ))
        }
        const startPos = [event.clientX, event.clientY];
        const _moveEl = event => {
            const move = [snapToGrid(event.clientX - startPos[0]),
                          snapToGrid(event.clientY - startPos[1])];
            const max = [window.innerWidth - object.offsetWidth,
                         window.innerHeight - object.offsetHeight];    
            const newX = tool.x+move[0];
            const newY = tool.y+move[1];
            if (newX > 0 && newX < max[0] && newY > 0 && newY < max[1]) {
                if (tool.params.container && inner.length > 0) {
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
    const startResizing = (event, tool) => {
        event.stopPropagation();
        const dummy = document.createElement('span');
        event.dataTransfer.setDragImage(dummy, 0, 0);
        event.dataTransfer.effectAllowed = 'move';
        const id = tool.id;
        const startSize = tool.params.size;
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
    const model = objectModel.map( tool => {
        const {params, ...rest} = tool;
        const wrapperStyle = {
            position: 'absolute',
            left: snapToGrid(tool.x),
            top: snapToGrid(tool.y),
            padding: editMode ? grid/2 : 0,
            background: editMode ? 'rgba(100,100,200,.4)' : null,
            cursor: editMode ? 'move' : 'default',
            zIndex: params.container ? 0 : 100
        }
        const wrapperProps = {
            style: wrapperStyle, 
            key:tool.id, id:tool.id, 
            draggable: editMode, 
            onDragStart: editMode ? e => startDrag(e, tool): null,
            onClick: editMode ? openMenu : null
        }
        const elementProps = {
            sendMessage: (path, param, value) => {
                const rootPath = tool.parentId ? 
                    objectModel.find( o => o.id == tool.parentId).path : '';
                dispatcher(updateParams({id: tool.id, param, value}));
                if (window.electron) window.electron.sendOSC(rootPath+path, value, address);    
            },
            ...params,
            ...rest,
        }
        const NewElement = React.createElement(library[tool.type], elementProps);
        return (
            <div {...wrapperProps} > 
                {editMode ? 
                    <>
                        <div style={{pointerEvents: 'none'}}>{NewElement}</div> 
                        <div className='resizing-tool' 
                             onDragStart={e => startResizing(e, tool)} draggable
                             style={{width: grid, height: grid}}></div>
                    </>
                    : NewElement}
            </div>
        )
    });
    return (
        <>
        {model}
        </>
    )
}
    

export default ElementSheet;