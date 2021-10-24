import '../styles/MainCanvas.scss';
import React, { useState, useEffect } from 'react';
import * as library from '../components';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMode, addObject, 
         updateParams, repositionObj, 
         setChildren } from '../main-slice';
import ComponentMenu from './ComponentMenu';

export default function MainCanvas() {
    const [pages, setPages] = useState(1);
    const [menuTarget, setObjMenu] = useState(null);
    const [dragging, setDragging] = useState(false);
    const navWidth = 200;
    const grid = 16;
    const dispatcher = useDispatch();
    const editMode = useSelector( state => state.global.editMode);
    const address = useSelector( state => state.global.ipAddr);
    const objectModel = useSelector( state => state.global.objectModel);

    useEffect( () => {
        const toggleEdit = event => {
            if( event.key == '.' && event.ctrlKey) {
                dispatcher(toggleMode());
                setObjMenu(null)
            } 
        }   
        window.addEventListener('keypress', toggleEdit);
        return () => window.removeEventListener('keypress', toggleEdit);
    })

    const handleDrop = event => {
        const type = event.dataTransfer.getData('text');
        const x = event.clientX - navWidth;    
        const y = event.clientY - 22;
        const containers = objectModel.filter( obj => obj.params.hasOwnProperty('container'))
        const targetContainer = containers.find( cont => (
            cont.x < x && cont.y < y &&
            (cont.params.size[0] + cont.x) > x && 
            (cont.params.size[1] + cont.y) > y
        ));
        if (type in library) {
            const params = library[type+'_setup'];
            let count = 0;
            for (let item of objectModel) {
                if (item.type == type) count++
            }
            const id = type+(count+1);
            const path = '/'+id;
            const newEntry = {id, type, path, x, y, params};
            if (targetContainer) newEntry.parentId = targetContainer.id;
            dispatcher(addObject(newEntry))
        } else {
            const target = objectModel.find( obj => obj.id == type);
            if (targetContainer && (targetContainer != target)) {
                dispatcher(setChildren({
                    parentId: targetContainer.id,
                    childId: target.id
                }));
            } else {
                dispatcher(setChildren({
                    parentId: null,
                    childId: target.id
                }));
            } 
        }
       
    }

    const renderElements = () => {
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
        return objectModel.map( tool => {
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
    }
    
    const renderTabs = () => {
        const tabs = [];
        for (let i = 0; i < pages; i++) {
            tabs.push(<div key={i} className='tab'>Page {i+1}</div>)
        }
        return tabs
    }
    const closeObjMenu = () => { 
        setObjMenu(null)
    }

    return (
        <main onClick={closeObjMenu} 
              onDrop={handleDrop} 
              onDragOver={e => e.preventDefault()} style={{flexGrow: 1}}>
            <div className='tab-container' style={{left: editMode ? navWidth : 0}}> 
                    {renderTabs()} 
                    <button className='add-tab' onClick={ () => setPages(pages+1) }>+</button>
                </div>
            <div className='backdrop' style={{left: editMode ? navWidth : 0}} > 
                <div style={{width: '100%', 
                             height: '100%', 
                             position: 'absolute',
                             top: editMode ? -grid/2 : 0, 
                             left:editMode ? -grid/2 : 0}} >
                {renderElements()}
                {(menuTarget && !dragging) ? 
                    <ComponentMenu onClose={() => setObjMenu(null)} targetid={menuTarget}/>
                : null}
                </div>
            </div>
        </main>
    )
}