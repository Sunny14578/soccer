from django.shortcuts import render

def home(request):
    return render(request, 'frontapp/base.html')

def schedule(request):
    return render(request, 'frontapp/schedule.html')

def slidetest(request):
    return render(request, 'frontapp/test.html')