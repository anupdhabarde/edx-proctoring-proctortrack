#!/usr/bin/env python
# -*- coding: utf-8 -*-
# pylint: disable=C0111,W6005,W6100
from __future__ import absolute_import, print_function

import os
import re
import sys

from setuptools import setup


setup(
    name='edx-proctoring-proctortrack',
    description='Proctoring subsystem for edX-proctoring',
    author='Verificient',
    author_email='vivek@verificient.com',
    url='https://github.com/joshivj/edx-proctoring-proctortrack',
    keywords='Proctortrack edx',
    version='1.0.0',
    packages=[
        'edx_proctoring_proctortrack',
    ],
    include_package_data=True,
    install_requires=[
        'edx_proctoring',
    ],
    entry_points={
        'openedx.proctoring': [
            'proctortrack = edx_proctoring_proctortrack.backends.proctortrack_rest:ProctortrackBackendProvider',
        ],
    },

)