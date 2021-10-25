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

    const startDrag = event => {
        setDragging(true)
        const dummy = document.createElement('span');
        event.dataTransfer.setDragImage(dummy, 0, 0);
        event.dataTransfer.setData('text', event.target.id);
        event.dataTransfer.effectAllowed = 'move';
        const object = event.target;
        const startMousePos = [event.clientX, event.clientY];
        const startObjectPos = [object.offsetLeft, object.offsetTop];
        let newX, newY;
        const _moveEl = event => {
            const moveX = event.clientX - startMousePos[0];
            const moveY = event.clientY - startMousePos[1];
            const maxX = window.innerWidth - object.offsetWidth;
            const maxY = window.innerHeight - object.offsetHeight;
            newX = Math.min(maxX, startObjectPos[0]+moveX);
            newY = Math.min(maxY, startObjectPos[1]+moveY);
            if (newX > 0 && newY > 0) {
                const id = object.id;
                dispatcher(repositionObj({id, newX, newY}))
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
    const startResizing = event => {
        event.stopPropagation();
        const dummy = document.createElement('span');
        event.dataTransfer.setDragImage(dummy, 0, 0);
        event.dataTransfer.effectAllowed = 'move';
        const id = event.target.offsetParent.id;
        const obj = objectModel.find( o => o.id == id);
        const startSize = obj.params.size;
        const startPos = [event.clientX, event.clientY];
        const resize = event => {
            let value;
            let move = [event.clientX - startPos[0],
                        event.clientY - startPos[1]];
            if (Array.isArray(startSize)) {
                value = [
                    Math.max(grid, Math.floor(move[0]/grid)*grid+startSize[0]),
                    Math.max(grid, Math.floor(move[1]/grid)*grid+startSize[1]),
                ]
            } else {
                move = move[0] + move[1]; 
                value = Math.max(grid, Math.floor(move/grid)*grid+startSize);
            }
            dispatcher(updateParams({id, param:'size', value}))
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
            left: Math.floor(tool.x/grid)*grid,
            top: Math.floor(tool.y/grid)*grid,
            padding: editMode ? grid/2 : 0,
            background: editMode ? 'rgba(100,100,200,.4)' : null,
            cursor: editMode ? 'move' : 'default',
            zIndex: params.container ? 0 : 100
        }
        const wrapperProps = {
            style: wrapperStyle, 
            key:tool.id, id:tool.id, 
            draggable: editMode, 
            onDragStart: editMode ? startDrag: null,
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
                             onDragStart={startResizing} draggable
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