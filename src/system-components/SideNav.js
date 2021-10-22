import { useSelector, useDispatch } from 'react-redux';
import { setAddr, setPort, setEntireModel, setProjectName } from '../main-slice';
import '../styles/SideNav.scss';
import ToolBox from './ToolBox';

export default function SideNav() {
    const editMode = useSelector( state => state.global.editMode);
    const address = useSelector( state => state.global.ipAddr);
    const objectModel = useSelector( state => state.global.objectModel);
    const projName = useSelector( state => state.global.projectName)
    const dispatcher = useDispatch();
    document.title = "DSP UI Creator - "+ (projName || 'new project');

    const saveJson = () => {
        const data = JSON.stringify({address, objectModel})
        window.electron.manageFiles(data).then( woot => console.log(woot))
    }

    const loadJson = () => {
        window.electron.manageFiles('load').then( file => {
            const openedProj = JSON.parse(file)
            dispatcher(setEntireModel(openedProj));
        }).catch( err => console.log('error loading file: ', err))
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
                <button onClick={saveJson} className='sidenav-button'>
                    Save Project
                </button>
                <button onClick={loadJson} className='sidenav-button'>
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