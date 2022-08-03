import React, { useEffect, useMemo, useState } from 'react';
import { Redirect, Link, useLocation, useParams, useHistory } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { noop } from '../../helpers/noop';
import styled from 'styled-components';

// Components
import LowCarbonInfoTooltip from '../../components/tooltips/lowcarboninfotooltip';
import CarbonIntensitySquare from '../../components/carbonintensitysquare';
import CircularGauge from '../../components/circulargauge';
import ContributorList from '../../components/contributorlist';
import CountryHistoryCarbonGraph from '../../components/countryhistorycarbongraph';
import CountryHistoryEmissionsGraph from '../../components/countryhistoryemissionsgraph';
import CountryHistoryMixGraph from '../../components/countryhistorymixgraph';
import CountryHistoryPricesGraph from '../../components/countryhistorypricesgraph';
import CountryTable from '../../components/countrytable';
import CountryDisclaimer from '../../components/countrydisclaimer';
import CountryDataInfo from '../../components/countrydatainfo';
import LoadingPlaceholder from '../../components/loadingplaceholder';
import Icon from '../../components/icon';

import { dispatchApplication } from '../../store';

// Modules
import { useCurrentZoneData } from '../../hooks/redux';
import { useTrackEvent } from '../../hooks/tracking';
import { flagUri } from '../../helpers/flags';
import { useTranslation, getZoneNameWithCountry } from '../../helpers/translation';
import SocialButtons from './socialbuttons';
import { TIME } from '../../helpers/constants';
import { CountryHistoryTitle } from '../../components/countryhistorytitle';
import { getCO2IntensityByMode } from '../../helpers/zonedata';
import { TimeDisplay } from '../../components/timeDisplay';
import { LABEL_TYPES, ZoneLabel } from '../../components/zonelabel';

// TODO: Move all styles from styles.css to here
// TODO: Remove all unecessary id and class tags

const CountryLowCarbonGauge = (props) => {
  const electricityMixMode = useSelector((state) => state.application.electricityMixMode);

  const d = useCurrentZoneData();
  if (!d) {
    return <CircularGauge {...props} />;
  }

  const fossilFuelRatio = electricityMixMode === 'consumption' ? d.fossilFuelRatio : d.fossilFuelRatioProduction;
  const countryLowCarbonPercentage = fossilFuelRatio !== null ? 100 - fossilFuelRatio * 100 : null;

  return <CircularGauge percentage={countryLowCarbonPercentage} {...props} />;
};

const CountryRenewableGauge = (props) => {
  const electricityMixMode = useSelector((state) => state.application.electricityMixMode);

  const d = useCurrentZoneData();
  if (!d) {
    return <CircularGauge {...props} />;
  }

  const renewableRatio = electricityMixMode === 'consumption' ? d.renewableRatio : d.renewableRatioProduction;
  const countryRenewablePercentage = renewableRatio !== null ? renewableRatio * 100 : null;

  return <CircularGauge percentage={countryRenewablePercentage} {...props} />;
};

const mapStateToProps = (state) => ({
  electricityMixMode: state.application.electricityMixMode,
  isMobile: state.application.isMobile,
  tableDisplayEmissions: state.application.tableDisplayEmissions,
  zones: state.data.zones,
});

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const Flag = styled.img`
  vertical-align: bottom;
  padding-right: 0.8rem;
`;

const CountryTime = styled.div`
  white-space: nowrap;
  display: flex;
`;

const ProContainer = styled.small`
  @media (max-width: 767px) {
    display: none !important;
  }
`;

const CountryNameTime = styled.div`
  font-size: smaller;
  margin-left: 25px;
`;

const StyledTimeDisplay = styled(TimeDisplay)`
  margin-top: 0px;
`;

const CountryNameTimeTable = styled.div`
  display: flex;
  justify-content: space-between;
  margin-left: 1.2rem;
`;
const CountryPanelWrap = styled.div`
  overflow-y: scroll;
  padding: 0 1.5rem;
  @media (max-width: 767px) {
    position: relative;
    padding-top: 0;
    overflow: hidden;
  }
`;

const BySource = styled.div`
  font-size: smaller;
  position: relative;
  top: 0.8rem;
  margin-bottom: 5px;
`;

const LoadingText = styled.p`
  margin-top: 2px;
`;

const CountryTableHeaderInner = styled.div`
  display: flex;
  flex-basis: 33.3%;
  justify-content: space-between;
`;

const CountryPanelStyled = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  margin: 0;
  flex: 1 1 0px;
  @media (max-width: 767px) {
    margin: 0;
    display: block;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    -moz-user-select: none; /* Selection disabled on firefox to avoid android "select all" button popping up when pressing graphs */
    margin-bottom: 60px; /* height of time-slider plus padding*/
  }
`;

const StyledSources = styled.div`
  // Provides extra space to scroll further than the timeController
  margin-bottom: 170px;
  @media (max-width: 767px) {
    margin-bottom: 40px;
  }
`;

const CountryHeader = ({ parentPage, zoneId, data, isMobile, isDataAggregated }) => {
  const { disclaimer, estimationMethod, stateDatetime, datetime } = data;
  const shownDatetime = stateDatetime || datetime;
  const isDataEstimated = !(estimationMethod == null);

  return (
    <div className="left-panel-zone-details-toolbar">
      <Link to={parentPage} className="left-panel-back-button">
        <Icon iconName="arrow_back" />
      </Link>
      <CountryNameTime>
        <CountryNameTimeTable>
          <div>
            <Flag id="country-flag" alt="" src={flagUri(zoneId, 24)} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <div className="country-name">{getZoneNameWithCountry(zoneId)}</div>
            <CountryTime>
              {shownDatetime && <StyledTimeDisplay />}
              {isDataEstimated && <ZoneLabel type={LABEL_TYPES.ESTIMATED} isMobile={isMobile} />}
              {isDataAggregated && <ZoneLabel type={LABEL_TYPES.AGGREGATED} isMobile={isMobile} />}
            </CountryTime>
          </div>
          {disclaimer && <CountryDisclaimer text={disclaimer} isMobile={isMobile} />}
        </CountryNameTimeTable>
      </CountryNameTime>
    </div>
  );
};

const CountryPanel = ({ electricityMixMode, isMobile, tableDisplayEmissions, zones }) => {
  const [tooltip, setTooltip] = useState(null);
  const { __ } = useTranslation();

  const isLoadingHistories = useSelector((state) => state.data.isLoadingHistories);

  // TODO: isLoadingGrid is holding rendering back too much on countryPanel. This should be avoided.
  const isLoadingGrid = useSelector((state) => state.data.isLoadingGrid);

  const trackEvent = useTrackEvent();
  const history = useHistory();
  const location = useLocation();
  const { zoneId } = useParams();
  const timeAggregate = useSelector((state) => state.application.selectedTimeAggregate);

  const data = useCurrentZoneData() || {};

  const parentPage = useMemo(() => {
    return {
      pathname: '/map',
      search: location.search,
    };
  }, [location]);

  // Disable mix graph on aggregated consumption data because we do not
  // show exchanges yet.
  const isMixGraphOverlayEnabled =
    timeAggregate && timeAggregate !== TIME.HOURLY && electricityMixMode == 'consumption';

  // Back button keyboard navigation
  useEffect(() => {
    const keyHandler = (e) => {
      if (e.key === 'Backspace' || e.key === '/') {
        history.push(parentPage);
      }
    };
    document.addEventListener('keyup', keyHandler);
    return () => {
      document.removeEventListener('keyup', keyHandler);
    };
  }, [history, parentPage]);

  // Redirect to the parent page if the zone is invalid.
  if (!zones[zoneId]) {
    return <Redirect to={parentPage} />;
  }

  const { hasParser, estimationMethod } = data;
  const isDataEstimated = estimationMethod ? true : false;

  const co2Intensity = getCO2IntensityByMode(data, electricityMixMode);

  const switchToZoneEmissions = () => {
    dispatchApplication('tableDisplayEmissions', true);
    trackEvent('PanelEmissionButton Clicked');
  };

  const switchToZoneProduction = () => {
    dispatchApplication('tableDisplayEmissions', false);
    trackEvent('PanelProductionButton Clicked');
  };

  if (isLoadingHistories || isLoadingGrid) {
    return (
      <CountryPanelStyled>
        <div id="country-table-header">
          <CountryHeader parentPage={parentPage} zoneId={zoneId} data={data} isMobile={isMobile} />
        </div>
        <LoadingWrapper>
          <LoadingPlaceholder height="2rem" />
          <LoadingText>Loading...</LoadingText>
        </LoadingWrapper>
      </CountryPanelStyled>
    );
  }

  return (
    <CountryPanelStyled>
      <div id="country-table-header">
        <CountryHeader
          isDataAggregated={timeAggregate && timeAggregate !== TIME.HOURLY}
          parentPage={parentPage}
          zoneId={zoneId}
          data={data}
          isMobile={isMobile}
        />
        {hasParser && (
          <React.Fragment>
            <CountryTableHeaderInner>
              <CarbonIntensitySquare value={co2Intensity} withSubtext />
              <div className="country-col country-lowcarbon-wrap">
                <div id="country-lowcarbon-gauge" className="country-gauge-wrap">
                  <CountryLowCarbonGauge
                    onClick={isMobile ? (x, y) => setTooltip({ position: { x, y } }) : noop}
                    onMouseMove={!isMobile ? (x, y) => setTooltip({ position: { x, y } }) : noop}
                    onMouseOut={() => setTooltip(null)}
                  />
                  {tooltip && <LowCarbonInfoTooltip position={tooltip.position} onClose={() => setTooltip(null)} />}
                </div>
                <div className="country-col-headline">{__('country-panel.lowcarbon')}</div>
                <div className="country-col-subtext" />
              </div>
              <div className="country-col country-renewable-wrap">
                <div id="country-renewable-gauge" className="country-gauge-wrap">
                  <CountryRenewableGauge />
                </div>
                <div className="country-col-headline">{__('country-panel.renewable')}</div>
              </div>
            </CountryTableHeaderInner>
            <div className="country-show-emissions-wrap">
              <div className="menu">
                <button
                  type="button"
                  onClick={switchToZoneProduction}
                  className={!tableDisplayEmissions ? 'selected' : null}
                >
                  {__(`country-panel.electricity${electricityMixMode}`)}
                </button>
                |
                <button
                  type="button"
                  onClick={switchToZoneEmissions}
                  className={tableDisplayEmissions ? 'selected' : null}
                >
                  {__('country-panel.emissions')}
                </button>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      <CountryPanelWrap>
        {hasParser ? (
          <React.Fragment>
            <BySource>
              {__(timeAggregate !== TIME.HOURLY ? 'country-panel.averagebysource' : 'country-panel.bysource')}
            </BySource>

            <CountryTable />

            <hr />
            <div className="country-history">
              <CountryHistoryTitle
                translationKey={tableDisplayEmissions ? 'country-history.emissions' : 'country-history.carbonintensity'}
              />
              <br />
              <ProContainer>
                <Icon iconName="file_download" size={16} />
                <a
                  href="https://electricitymap.org/?utm_source=app.electricitymap.org&utm_medium=referral&utm_campaign=country_panel"
                  target="_blank"
                  rel="noreferrer"
                >
                  {__('country-history.Getdata')}
                </a>
                <span className="pro">
                  <Icon iconName="lock" size={16} color="#4C4C4C" />
                  pro
                </span>
              </ProContainer>
              {tableDisplayEmissions ? <CountryHistoryEmissionsGraph /> : <CountryHistoryCarbonGraph />}
              <CountryHistoryTitle
                translationKey={
                  tableDisplayEmissions
                    ? `country-history.emissions${electricityMixMode === 'consumption' ? 'origin' : 'production'}`
                    : `country-history.electricity${electricityMixMode === 'consumption' ? 'origin' : 'production'}`
                }
              />
              <br />
              <ProContainer>
                <Icon iconName="file_download" size={16} />
                <a
                  href="https://electricitymap.org/?utm_source=app.electricitymap.org&utm_medium=referral&utm_campaign=country_panel"
                  target="_blank"
                  rel="noreferrer"
                >
                  {__('country-history.Getdata')}
                </a>
                <span className="pro">
                  <Icon iconName="lock" size={16} color="#4C4C4C" />
                  pro
                </span>
              </ProContainer>
              <div className="country-history">
                {isMixGraphOverlayEnabled && (
                  <div className="no-data-overlay visible">
                    <div className="no-data-overlay-background" />
                    <div
                      className="no-data-overlay-message graph"
                      dangerouslySetInnerHTML={{
                        __html: 'Temporarily disabled. <br/> Switch to production view',
                      }}
                    />
                  </div>
                )}

                <CountryHistoryMixGraph isOverlayEnabled={isMixGraphOverlayEnabled} />
              </div>

              {timeAggregate === TIME.HOURLY && (
                <>
                  <CountryHistoryTitle translationKey={'country-history.electricityprices'} />
                  <CountryHistoryPricesGraph />
                </>
              )}
            </div>
            <hr />
            <StyledSources>
              {isDataEstimated && <CountryDataInfo text={__('country-panel.dataIsEstimated')} />}
              {timeAggregate !== TIME.HOURLY && <CountryDataInfo text={__('country-panel.exchangesAreMissing')} />}
              {__('country-panel.source')}
              {': '}
              <a
                href="https://github.com/tmrowco/electricitymap-contrib/blob/master/DATA_SOURCES.md#real-time-electricity-data-sources"
                target="_blank"
                rel="noreferrer"
              >
                <span className="country-data-source">{data.source || '?'}</span>
              </a>
              <small>
                {' '}
                (
                <span
                  dangerouslySetInnerHTML={{
                    __html: __(
                      'country-panel.addeditsource',
                      'https://github.com/tmrowco/electricitymap-contrib/tree/master/parsers'
                    ),
                  }}
                />
                )
              </small>{' '}
              {__('country-panel.helpfrom')}
              <ContributorList />
              <SocialButtons hideOnDesktop />
            </StyledSources>
          </React.Fragment>
        ) : (
          <div className="zone-details-no-parser-message" data-test-id="no-parser-message">
            <span
              dangerouslySetInnerHTML={{
                __html: __(
                  'country-panel.noParserInfo',
                  'https://github.com/tmrowco/electricitymap-contrib/wiki/Getting-started'
                ),
              }}
            />
          </div>
        )}
      </CountryPanelWrap>
    </CountryPanelStyled>
  );
};

export default connect(mapStateToProps)(CountryPanel);
