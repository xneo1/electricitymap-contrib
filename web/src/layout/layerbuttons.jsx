import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import { useTranslation } from '../helpers/translation';
import { saveKey } from '../helpers/storage';
import { useWindEnabled, useSolarEnabled, useSolarToggledLocation, useWindToggledLocation } from '../hooks/router';
import { dispatchApplication } from '../store';

import LanguageSelect from '../components/languageselect';
import ButtonToggle from '../components/buttontoggle';
import styled from 'styled-components';
import { TIME } from '../helpers/constants';

const HiddenOnMobile = styled.div`
  @media screen and (max-width: 767px) {
    display: none;
  }
`;

export default () => {
  const { __ } = useTranslation();
  const windEnabled = useWindEnabled();
  const windToggledLocation = useWindToggledLocation();
  const windDataError = useSelector((state) => state.data.windDataError);

  const solarEnabled = useSolarEnabled();
  const solarDataError = useSelector((state) => state.data.solarDataError);
  const solarToggledLocation = useSolarToggledLocation();

  const brightModeEnabled = useSelector((state) => state.application.brightModeEnabled);

  const isWeatherEnabled = useSelector(
    (state) => state.application.selectedTimeAggregate === TIME.HOURLY && state.application.selectedZoneTimeIndex === 24
  );
  const toggleBrightMode = () => {
    dispatchApplication('brightModeEnabled', !brightModeEnabled);
    saveKey('brightModeEnabled', !brightModeEnabled);
  };

  const Link = ({ to, hasError, children }) =>
    !hasError ? <RouterLink to={to}>{children}</RouterLink> : <div>{children}</div>;

  const getWeatherTranslateId = (weatherType, enabled, isWeatherEnabled) => {
    if (!isWeatherEnabled) {
      return 'tooltips.weatherDisabled';
    }

    return enabled ? `tooltips.hide${weatherType}Layer` : `tooltips.show${weatherType}Layer`;
  };

  return (
    <HiddenOnMobile>
      <div className="layer-buttons-container">
        <LanguageSelect />
        <Link to={windToggledLocation} hasError={windDataError || !isWeatherEnabled}>
          <ButtonToggle
            active={windEnabled}
            tooltip={__(getWeatherTranslateId('Wind', windEnabled, isWeatherEnabled))}
            errorMessage={windDataError}
            ariaLabel={__(getWeatherTranslateId('Wind', solarEnabled, isWeatherEnabled))}
            icon="weather/wind"
          />
        </Link>
        <Link to={solarToggledLocation} hasError={solarDataError || !isWeatherEnabled}>
          <ButtonToggle
            active={solarEnabled}
            tooltip={__(getWeatherTranslateId('Solar', solarEnabled, isWeatherEnabled))}
            errorMessage={solarDataError}
            ariaLabel={__(getWeatherTranslateId('Solar', solarEnabled, isWeatherEnabled))}
            icon="weather/sun"
          />
        </Link>
        <ButtonToggle
          active={brightModeEnabled}
          onChange={toggleBrightMode}
          tooltip={__('tooltips.toggleDarkMode')}
          ariaLabel={__('tooltips.toggleDarkMode')}
          icon="brightmode"
        />
      </div>
    </HiddenOnMobile>
  );
};
