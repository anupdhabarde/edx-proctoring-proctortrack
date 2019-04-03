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
    verbose_name = 'Proctortrack'
    tech_support_email = 'support@verificient.com'
    learner_notification_from_email = 'no-reply@verificient.com'
    tech_support_phone = '+1 844-753-2020'
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
            _('Click on the "Start System Check" link below to download and run the proctoring software.'),
            _("Once you have verified your identity and reviewed the exam guidelines in Proctortrack, you will be redirected back to this page."),
            _("To confirm that proctoring has started, make sure your webcam feed and the blue Proctortrack box are both visible on your screen."),
            _('Click on the "Start Proctored Exam" button below to continue.'),
                ]

    def __init__(self, **kwargs):
        """
        Initialize REST backend.
        client_id: provided by backend service
        client_secret: provided by backend service
        """
        super(ProctortrackBackendProvider, self).__init__(**kwargs)
        self.session.oauth_uri = '/edx/oauth2/access_token'

