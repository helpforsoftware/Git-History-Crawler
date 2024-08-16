import React, {useCallback} from 'react';
import {Decoration} from 'react-diff-view';
import './ExpandButton.css';

const ExpandButton = ({direction, previousEnd, start, lines, onExpand}) => {
    const click = useCallback(() => {
        if (direction === 'up') {
            onExpand(start - 10, start - 1);
        } else {
            onExpand(start + lines, start + lines + 9);
        }
    }, [direction, start, lines, onExpand]);

    // 这里需要用Decoration套一下，这样Diff组件能控制怎么把这个div放进表格里
    // 想要美化一些结构的话，调整div中的内容就行了。如果想要变成这一行有2部分（像GitHub一样），那么让Decoration的children有2个元素就行
    return (
        <Decoration>
            <div className="expand-button" onClick={click}>
                {direction === 'up' ? 'Expand Up' : 'Expand Down'}
            </div>
        </Decoration>
    );
};

export default ExpandButton;
