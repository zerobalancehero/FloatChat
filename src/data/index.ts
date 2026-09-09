import { MockProvider } from './MockProvider';
import { ArgovisProvider } from './ArgovisProvider';
import { IFloatDataProvider } from './DataProvider';

// Architectural boundary toggle:
// FloatChat stays perfectly functional on Mock until Argovis backend proxy is finalized.
const USE_ARGOVIS = true;

export const DataService: IFloatDataProvider = USE_ARGOVIS ? new ArgovisProvider() : new MockProvider();
