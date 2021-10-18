import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import '../styles/Tooltip.scss';

const Tooltip = props => {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({x:0, y:0});
    let timer_id;

    useEffect( () => { 
        const anchor = document.getElementById('modalAnchor');
        if (visible) {
            timer_id = setTimeout(() => {
                render( 
                    <article style={{left: pos.x+10, top: pos.y}} 
                    className='tooltip-box' >{props.text}</article>
                , anchor)
            }, 500);
        } else {
            render(null, anchor)
        }
        return () => clearTimeout(timer_id)
    }, [visible])
    
    const showTip = event => {
        setVisible(true)
        setPos({x:event.target.offsetLeft + event.target.offsetWidth, y:event.target.offsetTop})
    }
    const hideTip = () => {
        setVisible(false)
    }
    const hoverOnChild = React.Children.map( props.children, child => {
        return React.cloneElement(child, {onMouseEnter: showTip, onMouseLeave: hideTip})
    })

    return (
        <>
        {hoverOnChild}
        </>
    )
}

export default Tooltip;