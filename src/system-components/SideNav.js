import { useSelector, useDispatch } from 'react-redux';
import { setAddr, setPort } from '../main-slice';
import '../styles/SideNav.scss';
import ToolBox from './ToolBox';

export default function SideNav() {
    const editMode = useSelector( state => state.global.editMode);
    const address = useSelector( state => state.global.ipAddr);
    const dispatcher = useDispatch();

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
                    className='address-input' value={address[1]}
                    onChange={ ({target}) => dispatcher(setPort(target.value))} />
                </label>
                </div>
                <ToolBox />
            </div>              
        </nav>
    )   
}           