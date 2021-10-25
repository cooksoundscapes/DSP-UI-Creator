import {render} from 'react-dom';
import MainCanvas from './system-components/MainCanvas';
import SideNav from './system-components/SideNav';
import { Provider as ReduxProvider} from 'react-redux';
import {IconContext} from 'react-icons';
import store from './lib/store';
import './styles/baseline.css';
import './themes/index.scss';

render(
    <div className='inner-root'>
        <ReduxProvider store={store}>
            <IconContext.Provider value={{size: '1.5em', className: 'react-icons'}}>
            <SideNav />
            <MainCanvas />
            </IconContext.Provider>
        </ReduxProvider>    
    </div>
    , document.getElementById('root')
)   