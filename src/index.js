import {render} from 'react-dom';
import MainCanvas from './system-components/MainCanvas';
import SideNav from './system-components/SideNav';
import { Provider } from 'react-redux';
import store from './store';
import './styles/baseline.css';
import './themes/index.scss';

render(
    <div className='inner-root'>
        <Provider store={store}>
            <SideNav />
            <MainCanvas />
        </Provider>    
    </div>
    , document.getElementById('root')
)   