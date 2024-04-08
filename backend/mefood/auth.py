import jwt
import requests
from django.contrib.auth.models import User
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed

from django.conf import settings


class KeycloakAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        try:
            prefix, token = auth_header.split(' ')
            assert prefix == 'Bearer'
        except ValueError:
            raise AuthenticationFailed('Formato de cabeçalho de autorização inválido.')

        response = requests.get(
            settings.KEYCLOAK_CONFIGURATION
        )
        if not response.ok:
            raise AuthenticationFailed("Não foi possível obter a configuração do Keycloak.")

        oidc_config = response.json()

        signing_algos = oidc_config["token_endpoint_auth_signing_alg_values_supported"]

        jwks_client = jwt.PyJWKClient(oidc_config["jwks_uri"])

        signing_key = jwks_client.get_signing_key_from_jwt(token)

        try:
            data = jwt.decode(
                token,
                signing_key.key,
                algorithms=signing_algos,
                audience="account",
                issuer=settings.KEYCLOAK_ISSUER
            )
        except Exception as e:
            print(e)
            raise AuthenticationFailed('Token inválido ou expirado.')

        user = User(username=data['preferred_username'], email=data['email'])
        return user, None
