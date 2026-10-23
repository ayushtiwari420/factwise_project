import { createContext, useContext } from 'react';

export const CareContext = createContext(null);
export const useCare = () => useContext(CareContext);
