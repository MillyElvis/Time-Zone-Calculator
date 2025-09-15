import React from 'react';

export const RainIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-5.43-2.288 4.5 4.5 0 00-9.056 2.544z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 18.5v2m4-2.5v2m4-2v2" />
    </svg>
);
