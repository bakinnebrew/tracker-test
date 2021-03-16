from datetime import datetime
import json
from django.core import serializers
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.db import IntegrityError
from django.http import JsonResponse
from django.forms import ModelForm


from .models import User, Barrel, Account


class AddNewBarrel(ModelForm):

    class Meta:
        model = Barrel
        fields = ['title', 'beer_style', 'barrel_category',
                  'fill_date', 'estimated_ABV', 'description', 'pull_date', ]
        exclude = ['add_date', 'archived', 'owner']


# Create your views here.


def index(request):
    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "tracker/index.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))


def add_barrel(request):
    # adding a new barrel must be via POST
    if request.method == 'POST':
        user = User.objects.get(username=request.user)
        form = AddNewBarrel(request.POST, request.FILES)
        if form.is_valid():
            new_barrel = form.save(commit=False)
            new_barrel.owner = user
            new_barrel.add_date = datetime.now()
            new_barrel.archived = False
            new_barrel.save()
        return redirect('index')
    else:
        return render(request, "tracker/index.html", {
            "form": AddNewBarrel()
        })


def load_account(request):
    if request.method == "GET":
        account_owner = Account.objects.get()
        return JsonResponse(account_owner.serialize())


def build_barrels(request, build_view):

    try:
        if build_view == "archives":
            barrels = Barrel.objects.filter(archived=True)

        else:
            barrels = Barrel.objects.filter(owner=request.user)

        barrels = barrels.order_by("id").all()
        return JsonResponse([barrel.serialize() for barrel in barrels], safe=False)

    except:
        barrels is None
        return JsonResponse({"error": "You have no barrels in this category"}, status=404)
        # would be better to have an error message that says "you have no archived barrels" and "add a barrel!"


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "mail/login.html", {
                "message": "Invalid email and/or password."
            })
    else:
        return render(request, "tracker/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "tracker/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(email, email, password)
            user.save()
            Account.objects.create(account_owner=user)
        except IntegrityError as e:
            print(e)
            return render(request, "mail/register.html", {
                "message": "Email address already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "tracker/register.html")
