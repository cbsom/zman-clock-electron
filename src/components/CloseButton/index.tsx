import './index.tsx.scss';
import {Location} from "@/jcal-zmanim";

type closeButtonProps = { onClick: Function }
export default function CloseButton({onClick}: closeButtonProps) {
    return (
        <div className="close" onClick={() => onClick()}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <svg viewBox="0 0 36 36" className="circle" stroke="currentColor">
                <path
                    strokeDasharray="100, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
            </svg>
        </div>
    );
};

