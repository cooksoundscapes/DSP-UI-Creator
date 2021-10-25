import '../styles/MainCanvas.scss';
import React, { useState, useEffect } from 'react';
import * as library from '../components';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMode, addObject, setChildren } from '../lib/main-slice';
import ElementSheet from './ElementSheet';
import ComponentMenu from './ComponentMenu';    

export default function MainCanvas() {
    const dispatcher = useDispatch();
    const [pages, setPages] = useState(1);
    const [menuTarget, setObjMenu] = useState(null);
    const [dragging, setDragging] = useState(false);
    const editMode = useSelector( state => state.global.editMode);
    const objectModel = useSelector( state => state.global.objectModel);
    const navWidth = 200;
    const grid = 16;

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
        let type = event.dataTransfer.getData('text');
        const x = event.clientX - navWidth;    
        const y = event.clientY - 22;
        const containers = objectModel.filter( obj => obj.params.hasOwnProperty('container'))
        const targetContainer = containers.find( cont => (
            cont.x < x && cont.y < y &&
            (cont.params.size[0] + cont.x) > x && 
            (cont.params.size[1] + cont.y) > y
        ));
        let params;
        try {
            const clone = JSON.parse(type);
            type = clone.type;
            params = clone.params;
        } catch (e) {}
        if (type in library) {
            params = params || library[type+'_setup'];
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
            if (!target) return;
            else if (targetContainer && (targetContainer != target)) {
                dispatcher(setChildren({
                    parentId: targetContainer.id,
                    childId: target.id
                }));
            } else if (!targetContainer) {
                dispatcher(setChildren({
                    parentId: null,
                    childId: target.id
                }));
            } 
        }  
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
    const sheetProps = {grid, menuTarget, setDragging, setObjMenu};
    return (
        <main onClick={closeObjMenu} 
              onDrop={handleDrop} 
              onDragOver={e => e.preventDefault()} 
              className='main-container'
              style={{left: editMode ? navWidth : 0}} >
            <div className='tab-container' > 
                    {renderTabs()} 
                    <button className='add-tab' onClick={ () => setPages(pages+1) }>+</button>
                </div>
            <div className='backdrop' > 
                <div style={{width: '100%', 
                             height: '100%', 
                             position: 'absolute',
                             top: editMode ? -grid/2 : 0, 
                             left:editMode ? -grid/2 : 0}} >
                <ElementSheet {...sheetProps} />
                {(menuTarget && !dragging) ? 
                    <ComponentMenu onClose={() => setObjMenu(null)} targetid={menuTarget}/>
                : null}
                </div>
            </div>
        </main>
    )
}
