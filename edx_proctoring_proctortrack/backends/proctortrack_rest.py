"""
Base implementation of a REST backend, following the API documented in
docs/backends.rst
"""
from django.utils.translation import ugettext as _

from edx_proctoring.backends.rest import BaseRestProctoringProvider


class ProctortrackBackendProvider(BaseRestProctoringProvider):
    """
    Base class for official REST API proctoring service.
    Subclasses must override base_url and may override the other url
    properties
    """
    base_url = 'https://testing.verificient.com'
    npm_module = 'edx-proctoring-proctortrack'

    @property
    def instructor_url(self):
        "Returns the instructor dashboard url"
        return self.base_url + u'/launch/edx/instructor/{client_id}/?jwt={jwt}'

    @property
    def proctoring_instructions(self):
        "Returns the (optional) proctoring instructions"
        return [
            _('Click on the "Start System Check" button below to download the proctoring software.'),
            _("Run the software"),
            _("When you are finished verifying your identity and reviewing the Exam Guidelines, you will be redirected back to this page."),
            _("Make sure you see the Proctortrack blue box and Webcam Feed."),
            _('Click on the "Start Proctored Exam" button below to begin your exam.'),
                ]

    def __init__(self, **kwargs):
        """
        Initialize REST backend.
        client_id: provided by backend service
        client_secret: provided by backend service
        """
        super(ProctortrackBackendProvider, self).__init__(**kwargs)
        self.session.oauth_uri = '/edx/oauth2/access_token'

