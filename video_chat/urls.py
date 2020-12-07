from . import views
from django.urls import path

urlpatterns = [
    path('home', views.home, name = 'home'),
    path('signin', views.signin, name='login'),
    path('signup', views.signup, name='register'),
    path('vlogin', views.vlogin, name='vlogin'),
]