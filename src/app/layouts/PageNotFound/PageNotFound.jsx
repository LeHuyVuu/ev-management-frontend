import { Button } from 'primereact/button';
import React from 'react';
import FuzzyText from './PuzzyText';

export default function PageNotFound() {


    return (
        <div className="flex items-center justify-center min-h-screen">
            <FuzzyText
                baseIntensity={0.2}
                hoverIntensity={0.8}
                enableHover={true}
            >
                404
            </FuzzyText>
        </div>
    );
}
