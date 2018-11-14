"""
Base implementation of a REST backend, following the API documented in
docs/backends.rst
"""
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
    base_url = 'https://prestaging.verificient.com'

    def __init__(self, client_id=None, client_secret=None, **kwargs):
        """
        Initialize REST backend.
        client_id: provided by backend service
        client_secret: provided by backend service
        """
        ProctoringBackendProvider.__init__(self)
        self.client_id = client_id
        self.client_secret = client_secret
        self.default_config = None
        for key, value in kwargs.items():
            setattr(self, key, value)
        self.session = OAuthPTAPIClient(self.base_url, self.client_id, self.client_secret)

