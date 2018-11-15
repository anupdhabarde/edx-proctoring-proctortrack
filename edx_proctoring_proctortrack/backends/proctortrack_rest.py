"""
Base implementation of a REST backend, following the API documented in
docs/backends.rst
"""
import jwt
from datetime import datetime, timedelta
from rest_framework_jwt.settings import api_settings

from edx_proctoring.backends.backend import ProctoringBackendProvider
from edx_rest_api_client.client import OAuthAPIClient
from edx_proctoring.backends.rest import BaseRestProctoringProvider


class OAuthPTAPIClient(OAuthAPIClient):
    """
    A subclass of OAuthAPIClient
    """
    oauth_uri = '/edx/oauth2/access_token'


class ProctortrackBackendProvider(BaseRestProctoringProvider):
    """
    Base class for official REST API proctoring service.
    Subclasses must override base_url and may override the other url
    properties
    """
    base_url = 'https://prestaging.verificient.com/'

    @property
    def exam_attempt_url(self):
        "Returns exam attempt url"
        return self.base_url + u'api/v1/exam/{exam_id}/attempt/{attempt_id}/'

    @property
    def create_exam_attempt_url(self):
        "Returns the create exam url"
        return self.base_url + u'api/v1/exam/{exam_id}/attempt/'

    @property
    def create_exam_url(self):
        "Returns create exam url"
        return self.base_url + u'api/v1/exam/'

    @property
    def exam_url(self):
        "Returns exam url"
        return self.base_url + u'api/v1/exam/{exam_id}/'

    @property
    def config_url(self):
        "Returns proctor config url"
        return self.base_url + u'api/v1/config/'

    @property
    def instructor_launch_url(self):
        "Returns proctor config url"
        return self.base_url + u'launch/edx/{0}?token={1}'

    @property
    def instructor_url(self):
        "Returns the instructor dashboar url"
        return self.base_url + u'api/v1/instructor/{client_id}/?jwt={jwt}'

    def __init__(self, client_id=None, client_secret=None, **kwargs):
        """
        Initialize REST backend.
        client_id: provided by backend service
        client_secret: provided by backend service
        """
        BaseRestProctoringProvider.__init__(self)
        self.client_id = client_id
        self.client_secret = client_secret
        self.default_config = None
        for key, value in kwargs.items():
            setattr(self, key, value)
        self.session = OAuthPTAPIClient(self.base_url, self.client_id, self.client_secret)

