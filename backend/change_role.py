#!/usr/bin/env python
"""Change user role to admin."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_project.settings')
django.setup()

from authentication.models import User

# Try to find and update the user - common usernames for this system
for username in ['abrarfahim', 'dev.abir', 'Jerin', 'jerinsultana', 'admin']:
    try:
        user = User.objects.get(username=username)
        user.role = 'admin'
        user.save()
        print(f"SUCCESS: User '{user.username}' role changed to 'admin'")
        break
    except User.DoesNotExist:
        continue
else:
    # If no user found, create one or list existing users
    users = User.objects.all()[:5]
    if users:
        print("Available users:")
        for u in users:
            print(f"  - {u.username} (role: {u.role})")
    else:
        print("No users found in database")
