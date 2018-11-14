#!/usr/bin/env python
# -*- coding: utf-8 -*-
# pylint: disable=C0111,W6005,W6100
from __future__ import absolute_import, print_function

import os
import re
import sys

from setuptools import setup


setup(
    name='edx-proctoring',
    description='Proctoring subsystem for edX-proctoring',
    author='Verificient',
    author_email='vivek@verificient.com',
    url='https://github.com/joshivj/edx-proctoring-proctortrack',
    keywords='Proctortrack edx',
    packages=[
        'edx_proctoring_proctortrack',
    ],
    include_package_data=True,
    install_requires=[
        "Django>=1.11,<2.0",
        "django-model-utils>=2.3.1",
        "edx-drf-extensions",
        "djangorestframework>=3.1,<3.7",
        "django-ipware>=1.1.0",
        "edx-opaque-keys>=0.4",
        "pytz>=2018",
        "pycryptodomex>=3.4.7",
        "python-dateutil>=2.1",
        "requests",
        "stevedore",
        "six",
        'edx_proctoring'
    ],
    entry_points={
        'openedx.proctoring': [
            'proctortrack = edx_proctoring_proctortrack.backends.proctortrack_rest:ProctortrackBackendProvider',
        ],
    },

)