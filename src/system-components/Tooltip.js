import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import '../styles/Tooltip.scss';

const Tooltip = props => {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState([0, 0]);
    let timer_id;

    useEffect( () => { 
        const anchor = document.getElementById('modalAnchor');
        if (visible) {
            timer_id = setTimeout(() => {
                render( 
                    <article style={{left: pos[0]+10, top: pos[1]}} 
                    className={props.balloon ? 'tooltip-balloon' : 'tooltip-box'} >
                        {props.text} </article>
                , anchor)
            }, 500);
        } else {
            render(null, anchor)
        }
        return () => clearTimeout(timer_id)
    }, [visible])
    
    const showTip = ({currentTarget}) => {
        const rect = currentTarget.getBoundingClientRect();
        /*let padding = window.getComputedStyle(currentTarget, null).getPropertyValue('padding-left');
        padding = parseFloat(padding);*/
        const offset = props.place == 'side' ? [rect.width, rect.height*.2] : 
                        [-rect.width, -rect.height];
        setPos([
            rect.x + offset[0],
            rect.y + offset[1]
        ]);
        setVisible(true);
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