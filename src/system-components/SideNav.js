import { useSelector, useDispatch } from 'react-redux';
import { setAddr, setPort, setEntireModel } from '../main-slice';
import '../styles/SideNav.scss';
import ToolBox from './ToolBox';

export default function SideNav() {
    const editMode = useSelector( state => state.global.editMode);
    const address = useSelector( state => state.global.ipAddr);
    const objectModel = useSelector( state => state.global.objectModel)
    const dispatcher = useDispatch();

    const saveJson = () => {
        const data = JSON.stringify({address, objectModel})
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url;
        a.download = 'savedData';
        document.body.appendChild(a);
        a.click()
        document.body.removeChild(a)
    }

    const loadJson = event => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onloadend = () => {
            const json = JSON.parse(reader.result)
            dispatcher(setEntireModel(json))
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
                <button onClick={saveJson} className='sidenav-button'>
                    Save...
                    </button>
                <label onChange={loadJson} className='sidenav-button'>
                    Load...
                    <input type='file' accept='.json'/>
                </label>
                <ToolBox />
            </div>              
        </nav>
    )   
}           