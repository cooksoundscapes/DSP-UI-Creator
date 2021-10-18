import '../styles/MainCanvas.scss';
import React, { useState, useEffect } from 'react';
import * as library from '../components';
//redux objects
import { useSelector, useDispatch } from 'react-redux';
import { toggleMode, addObject, updateParams, repositionObj } from '../main-slice';

export default function MainCanvas() {
    const [pages, setPages] = useState(1);
    const navWidth = 200;
    const dispatcher = useDispatch();
    const editMode = useSelector( state => state.global.editMode);
    const address = useSelector( state => state.global.ipAddr);
    const objectModel = useSelector( state => state.global.objectModel);
    
    useEffect( () => {
        const toggleEdit = event => {
            if( event.key == '.' && event.ctrlKey) dispatcher(toggleMode());
        }   
        window.addEventListener('keypress', toggleEdit);
        return () => window.removeEventListener('keypress', toggleEdit);
    })
    const handleDragOver = event => {
        event.preventDefault();
    }
    const handleDrop = event => {
        const type = event.dataTransfer.getData('text');
        if (!(type in library)) {
            return
        };
        const x = event.clientX - navWidth;    
        const y = event.clientY - 22;
        const params = library[type+'_setup'];
        let count = 0;
        for (item of objectModel) {
            if (item.type == type) count++
        }
        const id = type+(count+1);
        const newEntry = {id, type, x, y, params};
        if (params.container) newEntry.childNodes = [];
        dispatcher(addObject(newEntry))
    }

    const renderElements = () => {
        const startDrag = event => {
            const dummy = document.createElement('span');
            event.dataTransfer.setDragImage(dummy, 0, 0);
            event.dataTransfer.setData('text', event.target.id);
            event.dataTransfer.effectAllowed = 'move';
            const object = event.currentTarget;
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
                object.removeEventListener('drag', _moveEl);
                object.removeEventListener('dragend', _endDrag);
            }
            object.addEventListener('drag', _moveEl);
            object.addEventListener('dragend', _endDrag);
        }
        const sendMessage = (id, param, value, path) => {
            if (editMode) return;
            dispatcher(updateParams({id, param, value}));
            window.electron.sendOSC(path, value, address);    
        }
        return objectModel.map( tool => {
            const style = {
                position: 'absolute',
                left: tool.x,
                top: tool.y,
                padding: editMode ? 12 : 0,
                background: editMode ? 'rgba(100,100,200,.4)' : null,
                cursor: editMode ? 'move' : 'default',
            }
            const key = tool.id;
            const wrapperProps = {
                style, key, id:key, draggable: editMode, 
                onDragStart: editMode? startDrag: null
            }
            const NewElement = React.createElement(library[tool.type], 
                {...tool.params, id: key, sendMessage});
            return (
                <div {...wrapperProps} > 
                    {editMode ? 
                        <div style={{pointerEvents: 'none'}}>{NewElement}</div> 
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
    return (
        <main onDrop={handleDrop} onDragOver={handleDragOver} style={{flexGrow: 1}}>
            <div className='tab-container' style={{left: editMode ? navWidth : 0}}> 
                    {renderTabs()} 
                    <button className='add-tab' onClick={ () => setPages(pages+1) }>+</button>
                </div>
            <div className='backdrop' style={{left: editMode ? navWidth : 0}} > 
                <div style={{width: '100%', 
                             height: '100%', 
                             position: 'absolute',
                             top: editMode?-12:0, 
                             left:editMode?-12:0}}>
                {renderElements()}
                </div>
            </div>
        </main>
    )
}