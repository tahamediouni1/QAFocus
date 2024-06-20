from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import UserAccount
from django.views.decorators.csrf import csrf_protect
from rest_framework import generics
from . import serializers
from rest_framework.permissions import *


def my_view(request, email):
    user = get_object_or_404(UserAccount, email=email)  # Récupérer l'utilisateur par e-mail

    if user is not None:
        # Construire un objet JSON contenant toutes les informations de l'utilisateur
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            # Inclure d'autres coordonnées d'utilisateur nécessaires ici
        }
        return JsonResponse(user_data)  # Renvoyer les informations de l'utilisateur sous forme de réponse JSON
    else:
        # Gérer le cas où l'utilisateur n'est pas trouvé
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)



def get_all_users(request):
    users = UserAccount.objects.all()  # Récupérer tous les utilisateurs de la base de données
    users_list = []  # Initialiser une liste pour stocker les informations de tous les utilisateurs

    for user in users:
        # Construire un dictionnaire avec les informations de chaque utilisateur
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            # Ajouter d'autres informations d'utilisateur si nécessaire
        }
        users_list.append(user_data)  # Ajouter les informations de l'utilisateur à la liste

    return JsonResponse(users_list, safe=False)

def delete_user(request, user_id):
    # Récupérer l'utilisateur à supprimer ou renvoyer une erreur 404 si l'utilisateur n'existe pas
    user = get_object_or_404(UserAccount, id=user_id)

    # Supprimer l'utilisateur de la base de données
    user.delete()

    # Répondre avec un message indiquant que l'utilisateur a été supprimé avec succès
    return JsonResponse({'message': 'Utilisateur supprimé avec succès'}, status=200)


@csrf_protect
def update_user(request, user_id):
    try:
        # Récupérer l'utilisateur à mettre à jour ou renvoyer une erreur 404 si l'utilisateur n'existe pas
        user = get_object_or_404(UserAccount, id=user_id)

        # Récupérer les données mises à jour depuis le corps de la requête (assurez-vous d'ajuster cette logique selon vos besoins)
        data = request.POST  # ou request.data si vous utilisez DRF

        # Mettre à jour les champs de l'utilisateur avec les données reçues
        if 'email' in data:
            user.email = data['email']
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'is_staff' in data:
            user.is_staff = data['is_staff'].lower() == 'true'  # Convertir la valeur en booléen

        # Enregistrer les modifications dans la base de données
        user.save()

        # Répondre avec un message indiquant que l'utilisateur a été mis à jour avec succès
        return JsonResponse({'message': 'Utilisateur mis à jour avec succès'}, status=200)
    except UserAccount.DoesNotExist:
        # Gérer l'erreur si l'utilisateur n'existe pas
        return JsonResponse({'error': 'L\'utilisateur demandé n\'existe pas'}, status=404)
    except Exception as e:
        # Gérer toute autre exception imprévue
        return JsonResponse({'error': f'Erreur lors de la mise à jour de l\'utilisateur : {str(e)}'}, status=500)


class UpdateUser(generics.UpdateAPIView):

    queryset = UserAccount.objects.all()
    serializer_class = serializers.UserUpdateSerializer
    permission_classes = []
    lookup_field = 'id'


