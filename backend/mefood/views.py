from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class ExampleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        content = {
            "user": str(request.user),
            "auth": str(request.auth),
        }
        return Response(content)
