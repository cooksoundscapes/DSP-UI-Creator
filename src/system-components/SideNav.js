import { useSelector, useDispatch } from 'react-redux';
import { setAddr, setPort, setEntireModel, 
         setProjectName, setLastSave } from '../main-slice';
import '../styles/SideNav.scss';
import ToolBox from './ToolBox';
import { useState } from 'react';

export default function SideNav() {
    const [openDialog, setDialog] = useState(false);
    const editMode = useSelector( state => state.global.editMode);
    const address = useSelector( state => state.global.ipAddr);
    const objectModel = useSelector( state => state.global.objectModel);
    const projName = useSelector( state => state.global.projectName);
    const lastSave = useSelector( state => state.global.lastSave);
    const dispatcher = useDispatch();
    const unsaved = JSON.stringify({address, objectModel}) !== lastSave;
    document.title = "DSP UI Creator - "+ (projName || 'new project') + (unsaved ? ' *' : '');
   
    const saveJson = (overwrite=false, loadAfter=false) => {
        const data = JSON.stringify({address, objectModel});
        const saveReq = !overwrite ? data : [data, projName];
        setDialog(true);
        window.electron.manageFiles(saveReq).then( name => {
            dispatcher(setProjectName(name))
            dispatcher(setLastSave(data));
            setDialog(false);
        }).catch( () => {   
            console.log('Aborted saving file.');
            setDialog(false)
        }).finally( () => {if (loadAfter) loadJson(true)})
    }
    const loadJson = (skipCheck=false) => {
        setDialog(true);
        if (unsaved && !skipCheck) {
            window.electron.manageFiles('save-warning').then( resp => {
                switch (resp) {
                    case 0:
                        const exists = projName == true;
                        saveJson(exists, true);
                        break;
                    case 1:
                        loadJson(true);
                        break;
                    case 2:
                        setDialog(false)
                        break;
                }
            }).catch(err => {console.log(err)});  
        } else {
            window.electron.manageFiles('load').then( file => {
                const openedProj = JSON.parse(file[0])
                const name = file[1].split('.')[0];''
                dispatcher(setProjectName(name))
                dispatcher(setEntireModel(openedProj));
                dispatcher(setLastSave(file[0]))
                setDialog(false);
            }).catch( () =>{ 
                console.log('Aborted loading file.');
                setDialog(false)
            })
        }  
    }
    
    return (
        <nav style={{width: editMode ? 200 : 0}} className='sidenav'>
            <div className='sidenav-container'>
                <div className='address-form'>
                    <label style={{width: '10em'}}>address:
                        <input spellCheck={false} type='text' 
                        className='address-input' value={address[0]} 
                        onChange={ ({target}) => dispatcher(setAddr(target.value))} />
                    </label>      
                    <label style={{width: '4em'}}>port:
                        <input spellCheck={false} type='text' 
                        minLength='4' maxLength='5'
                        className='address-input' value={address[1]}
                        onChange={ ({target}) => {
                            if (isNaN(parseInt(target.value))) return;
                            dispatcher(setPort(target.value));
                        }} />
                    </label>
                </div> 
                <button disabled={!projName || openDialog} onClick={() => saveJson(true)} className='sidenav-button'>
                    Save
                </button>
                <button disabled={openDialog} onClick={() => saveJson()} className='sidenav-button'>
                    Save Project As...
                </button>
                <button disabled={openDialog} onClick={() => loadJson()} className='sidenav-button'>
                    Load Project
                </button>
                <ToolBox />
            </div>              
        </nav>
    )   
}           

/*
<label onChange={loadJson} className='sidenav-button'>
    Load Project
    <input type='file' accept='.json'/>
</label>
*/