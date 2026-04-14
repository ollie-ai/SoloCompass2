import { FEATURES } from '../config/features';

function useFeature(featureName) {
  const isEnabled = FEATURES[featureName] === true;
  
  const isDisabled = !isEnabled;

  const isEnabledFn = (feature) => {
    return FEATURES[feature] === true;
  };

  return {
    isEnabled,
    isDisabled,
    isEnabledFn,
    features: FEATURES,
  };
}

export default useFeature;
