import classNames from 'classnames';
import travleImg from '../../assets/travel.png';

import './index.scss';

interface ICoverProps {
    visible?: boolean;
    title?: string;
}

export default function Cover({ visible, title }: ICoverProps) {
    return (
        <div className={classNames('cover', { 'cover--hidden': !visible })}>
            <div className="cover__content">{title}</div>
            <img className="cover__img" src={travleImg} alt="" />
        </div>
    );
}
