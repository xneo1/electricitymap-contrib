import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { interpolate } from 'd3-interpolate';
import { formatDistance } from 'date-fns';

import { getRefTime, getTargetTime } from '../helpers/grib';
import { TIME } from '../helpers/constants';

export function useExchangeArrowsData() {
  const isConsumption = useSelector((state) => state.application.electricityMixMode === 'consumption');
  const isHourly = useSelector((state) => state.application.selectedTimeAggregate === TIME.HOURLY);

  const selectedZoneTimeIndex = useSelector((state) => state.application.selectedZoneTimeIndex);
  const exchanges = useSelector((state) => state.data.exchanges);

  if (!isConsumption || !isHourly) {
    return [];
  }

  return Object.values(exchanges)
    .filter((exchange) => exchange.data[selectedZoneTimeIndex])
    .map((exchange) => ({ ...exchange.config, ...exchange.data[selectedZoneTimeIndex] }));
}

export function useInterpolatedWindData() {
  const windData = useSelector((state) => state.data.wind);

  // TODO: Recalculate every 5 minutes if custom datetime is not set.
  return useMemo(() => {
    if (!windData || !windData.forecasts) {
      return null;
    }

    const gribs1 = windData.forecasts[0];
    const gribs2 = windData.forecasts[1];
    const tBefore = getTargetTime(gribs1[0]);
    const tAfter = getTargetTime(gribs2[0]);
    const datetime = new Date();
    const k = (datetime - tBefore) / (tAfter - tBefore);

    if (datetime > tAfter) {
      console.error('Error while interpolating wind because current time is out of bounds');
      return null;
    }

    // eslint-disable-next-line no-console
    console.log(
      `#1 wind forecast target ${formatDistance(tBefore, new Date(), { addSuffix: true })} made ${formatDistance(
        getRefTime(gribs1[0]),
        new Date(),
        { addSuffix: true }
      )}`
    );
    // eslint-disable-next-line no-console
    console.log(
      `#2 wind forecast target ${formatDistance(tAfter, new Date(), { addSuffix: true })} made ${formatDistance(
        getRefTime(gribs2[0]),
        new Date(),
        { addSuffix: true }
      )}`
    );

    return [
      { ...gribs1[0], data: gribs1[0].data.map((d, i) => interpolate(d, gribs2[0].data[i])(k)) },
      { ...gribs1[1], data: gribs1[1].data.map((d, i) => interpolate(d, gribs2[1].data[i])(k)) },
    ];
  }, [windData]);
}

export function useInterpolatedSolarData() {
  const solarData = useSelector((state) => state.data.solar);

  // TODO: Recalculate every 5 minutes if custom datetime is not set.
  return useMemo(() => {
    if (!solarData || !solarData.forecasts) {
      return null;
    }

    const grib1 = solarData.forecasts[0];
    const grib2 = solarData.forecasts[1];
    const tBefore = getTargetTime(grib1);
    const tAfter = getTargetTime(grib2);
    const datetime = new Date();
    const k = (datetime - tBefore) / (tAfter - tBefore);

    if (datetime > tAfter) {
      console.error('Error while interpolating solar because current time is out of bounds');
      return null;
    }

    // eslint-disable-next-line no-console
    console.log(
      `#1 solar forecast target ${formatDistance(tBefore, new Date(), { addSuffix: true })} made ${formatDistance(
        getRefTime(grib1),
        new Date(),
        { addSuffix: true }
      )}`
    );
    // eslint-disable-next-line no-console
    console.log(
      `#2 solar forecast target ${formatDistance(tAfter, new Date(), { addSuffix: true })} made ${formatDistance(
        getRefTime(grib2),
        new Date(),
        { addSuffix: true }
      )}`
    );

    return { ...grib1, data: grib1.data.map((d, i) => interpolate(d, grib2.data[i])(k)) };
  }, [solarData]);
}
