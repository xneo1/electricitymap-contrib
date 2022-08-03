#!/usr/bin/env python3
# coding=utf-8

"""
This parser returns Gulf Cooperation Council countries (United Arab Emirates, Bahrain, Saudi Arabia, Oman, Qatar, and Kuwait) electricity demand (only consumption, production data is not available)
Kuwait has a good data source and parser of its own, but should it become unavailable this parser can return data for Kuwait as well
Source: Gulf Cooperation Council Interconnection Authority
URL: https://www.gccia.com.sa/
Scroll down to see the system demand map
Kuwait shares of Electricity production in 2017: 65.6% oil, 34.4% gas (source: IEA; https://www.iea.org/statistics/?country=KUWAIT&indicator=ElecGenByFuel)
"""

# TODO get this data for the other countries as well

import re
from datetime import datetime
from logging import Logger, getLogger
from sys import stderr
from typing import Optional

import arrow
from requests import Session

from .lib.exceptions import ParserException

COUNTRY_CODE_MAPPING = {
    "AE": "uae",
    "BH": "bah",
    "KW": "kuw",
    "OM": "omn",
    "QA": "qat",
    "SA": "ksa",
}

TIME_ZONE_MAPPING = {
    "AE": "Asia/Dubai",
    "BH": "Asia/Bahrain",
    "KW": "Asia/Kuwait",
    "OM": "Asia/Muscat",
    "QA": "Asia/Qatar",
    "SA": "Asia/Riyadh",
}


def fetch_consumption(
    zone_key,
    session: Optional[Session] = None,
    target_datetime: Optional[datetime] = None,
    logger: Logger = getLogger(__name__),
):

    if target_datetime:
        raise NotImplementedError("This parser is not yet able to parse past dates")

    r = session or Session()
    url = "https://www.gccia.com.sa/"
    response = r.get(url)

    pattern = COUNTRY_CODE_MAPPING[zone_key] + r'-mw-val">\s*(\d+)'

    match = re.findall(pattern, response.text)
    if not match:
        # if no data, the text becomes " - "
        raise ParserException(
            "GCCIA.py", "data is currently not available", zone_key=zone_key
        )
    consumption = int(match[0])

    datapoint = {
        "zoneKey": zone_key,
        "datetime": arrow.now(TIME_ZONE_MAPPING[zone_key]).datetime,
        "consumption": consumption,
        "source": "www.gccia.com.sa",  # URL won't work without WWW
    }

    return datapoint


if __name__ == "__main__":
    """Main method, never used by the electricityMap backend, but handy for testing."""

    for i in COUNTRY_CODE_MAPPING:
        print("fetch_consumption('{0}') ->".format(i))
        try:
            print(fetch_consumption(i))
        except IndexError as error:
            print("Could not fetch consumption data for {0}".format(i), file=stderr)
            print(type(error), ":", error, file=stderr)
        print()
