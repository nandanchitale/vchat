from django.contrib.auth.decorators import login_required
from .models import AppUser
from django.shortcuts import render
from django.contrib.messages.api import error
from django.http import request
from django.http import response
from django.contrib import messages
from django.http import HttpResponse, StreamingHttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User


# Create your views here.

@login_required(login_url='login')
def home(request):
    username = request.user.username
    context = {
        'user': username,
    }
    return render(request, 'templates/index.html', context)

def signin(request):
    if request.method == 'POST':
        username = request.POST['user']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            print('redirecting to home')
            return redirect('home')
        else:
            messages.error(request, 'Username or password is incorrect')
            print(usr)
            return redirect('login')

    else:
        context = {}
        return render(request, 'templates/login.html', context)


def signup(request):
    if request.method == 'POST':
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        email = request.POST['email']
        password = request.POST['password']

        if User.objects.filter(email=email).exists():
            print('user exists')
            messages.error(request, 'User already exists with email id :' +
                           email + '\ntry with another email')
            return redirect('login')
        else:
            user = User.objects.create_user(
                username=firstname + lastname,
                password=password,
                first_name=firstname,
                last_name=lastname,
                email=email
            )
            user.save()

            appUser = AppUser.objects.create(
                user=user,
                firstname=user.first_name,
                lastname=user.last_name,
                username=user.username,
                email=user.email,
                password=user.password
            )

            appUser.save()

            return redirect('home')

    context = {}
    return render(request, 'templates/login.html')


@login_required(login_url='login')
def logoutUser(request):
    logout(request)
    return redirect('login')
