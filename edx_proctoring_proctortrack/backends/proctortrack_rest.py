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
    base_url = 'https://prestaging.verificient.com'

    @property
    def instructor_url(self):
        "Returns the instructor dashboard url"
        return self.base_url + u'/launch/edx/instructor/{client_id}/?jwt={jwt}'

    @property
    def proctoring_instructions(self):
        "Returns the (optional) proctoring instructions"
        return [
            _("Following are the steps which you need to follow in order to attempt proctored test using Proctortrack"),
            _("Step one, click on start system check button to download the proctoring software"),
            _("Next, run the software"),
            _("You will be asked to verify your identity as part of the proctoring exam set up."),
            _("Make sure you are on a computer with a webcam,"),
            _("and that you have valid photo identification such as a driver\'s license or passport, before you continue."),
            _("When you are finished, you will be redirected to the exam."),
            _("Remember if you have issues relating to proctoring, you can contact Proctortrack technical support by emailing - support@verificient.com or by calling (844) 753-2020."),
            _("Finally, have a nice day!"),
                ]

    def __init__(self, **kwargs):
        """
        Initialize REST backend.
        client_id: provided by backend service
        client_secret: provided by backend service
        """
        super(ProctortrackBackendProvider, self).__init__(**kwargs)
        self.session.oauth_uri = '/edx/oauth2/access_token'

