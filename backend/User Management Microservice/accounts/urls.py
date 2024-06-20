from django.urls import path
from .views import my_view, get_all_users, delete_user, update_user, UpdateUser

urlpatterns = [
    path('get_user/<str:email>/', my_view, name='get-user-by-email'),  # Nouveau chemin d'URL pour récupérer un utilisateur par e-mail
    path('get_all_users/', get_all_users, name='get-all-users'),
    path('delete_user/<int:user_id>/', delete_user, name='delete-user'),  #methode get n'est pas DELETE
    path('update_user/<int:id>/', UpdateUser.as_view(), name='update-user'),

]
