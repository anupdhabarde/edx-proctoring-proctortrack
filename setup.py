#!/usr/bin/env python
# -*- coding: utf-8 -*-
# pylint: disable=C0111,W6005,W6100
from __future__ import absolute_import, print_function

import os

from setuptools import setup

README = open(os.path.join(os.path.dirname(__file__), 'README.md')).read()

setup(
    name='edx-proctoring-proctortrack',
    description='Proctoring subsystem for edX-proctoring',
    long_description=README,
    author='Verificient',
    author_email='vivek@verificient.com',
    url='https://github.com/joshivj/edx-proctoring-proctortrack',
    license="Apache-2.0",
    keywords='Proctortrack edx',
    version='1.1.1',
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
    classifiers=[
        'Programming Language :: Python',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: Implementation :: CPython',
        ],
)
