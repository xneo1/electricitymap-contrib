import React from 'react';
import { useTranslation } from '../helpers/translation';
import styled, { css } from 'styled-components';
import { formatTimeRange } from '../helpers/formatting';
import { TIME } from '../helpers/constants';
import { useSelector } from 'react-redux';

const DateRangeOption = styled.span`
  font-size: 0.8rem;
  padding: 8px;
  margin-right: 5px;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 16px;
  white-space: nowrap;
  text-transform: capitalize;
  cursor: pointer;
  font-weight: ${(props) => (props.active ? 700 : 500)};
  color: ${(props) => (props.active ? '#000' : '#666')};
  ${(props) =>
    props.active &&
    css`
      background-color: white;
      box-shadow: 0.1px 0.1px 5px rgba(0, 0, 0, 0.1);
    `}
`;

const DateOptionWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  padding-top: 8px;
`;

const getOptions = (language) => [
  {
    key: TIME.HOURLY,
    label: formatTimeRange(language, TIME.HOURLY),
  },
  {
    key: TIME.DAILY,
    label: formatTimeRange(language, TIME.DAILY),
  },
  {
    key: TIME.MONTHLY,
    label: formatTimeRange(language, TIME.MONTHLY),
  },
  {
    key: TIME.YEARLY,
    label: formatTimeRange(language, TIME.YEARLY),
  },
];

const TimeControls = ({ selectedTimeAggregate, handleTimeAggregationChange }) => {
  const { i18n } = useTranslation();
  const options = getOptions(i18n.language);
  const zoneDatetimes = useSelector((state) => state.data.zoneDatetimes);

  return (
    <div>
      <DateOptionWrapper>
        {options.map((o) => (
          <DateRangeOption
            data-test-id={`time-controls-${o.key}-btn`}
            key={o.key}
            active={o.key === selectedTimeAggregate}
            onClick={() => {
              handleTimeAggregationChange(o.key, zoneDatetimes);
            }}
          >
            {o.label}
          </DateRangeOption>
        ))}
      </DateOptionWrapper>
    </div>
  );
};

export default TimeControls;
