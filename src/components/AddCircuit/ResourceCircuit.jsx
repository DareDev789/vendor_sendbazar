import React from 'react';
import CircuitResourceManager from './CircuitResourceManager';

export default function ResourceCircuit({ niveau, register, setValue, watch }) {
    return (
        <CircuitResourceManager 
            niveau={niveau} 
            register={register} 
            setValue={setValue} 
            watch={watch} 
        />
    );
}
