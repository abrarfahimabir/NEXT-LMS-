from django.contrib.auth.hashers import make_password
from django.db import migrations


def seed_demo_courses(apps, schema_editor):
    User = apps.get_model("authentication", "User")
    Category = apps.get_model("lms_core", "Category")
    Course = apps.get_model("lms_core", "Course")
    Module = apps.get_model("lms_core", "Module")
    Lesson = apps.get_model("lms_core", "Lesson")

    instructor, _ = User.objects.get_or_create(
        username="demo_instructor",
        defaults={
            "email": "instructor@example.com",
            "role": "instructor",
            "first_name": "Demo",
            "last_name": "Instructor",
            "expertise": "Full-stack Development",
        },
    )
    if not instructor.password:
        instructor.password = make_password("DemoInstructor123!")
        instructor.save(update_fields=["password"])

    course_payloads = [
        {
            "title": "Web Development Bootcamp",
            "category": "Development",
            "short_description": "Build responsive full-stack apps with React and API-driven workflows.",
            "description": "A project-first bootcamp covering frontend fundamentals, backend APIs, and deployment foundations.",
            "thumbnail_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
            "modules": [
                ("Frontend Foundations", [("HTML Structure", 14), ("Responsive CSS", 18)]),
                ("React Application Flow", [("Component State", 16), ("Routing and Data Fetching", 20)]),
            ],
        },
        {
            "title": "Python for Beginners",
            "category": "Programming",
            "short_description": "Learn syntax, automation, and beginner-friendly problem solving.",
            "description": "A supportive track for learners building confidence with Python, scripting, and practical exercises.",
            "thumbnail_url": "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?auto=format&fit=crop&w=1200&q=80",
            "modules": [("Python Basics", [("Variables and Types", 12), ("Conditionals", 15)])],
        },
        {
            "title": "UI/UX Design Masterclass",
            "category": "Design",
            "short_description": "Design user journeys, polished layouts, and modern interfaces.",
            "description": "A systems-driven design class focused on research, interface craft, and usability thinking.",
            "thumbnail_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
            "modules": [("Design Systems", [("Typography", 10), ("Layout Hierarchy", 14)])],
        },
        {
            "title": "Data Science Fundamentals",
            "category": "Data",
            "short_description": "Explore analysis, visualization, and statistical thinking.",
            "description": "Notebook-led lessons introduce learners to data workflows and entry-level machine learning concepts.",
            "thumbnail_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
            "modules": [("Data Literacy", [("Cleaning Data", 17), ("Visual Storytelling", 19)])],
        },
        {
            "title": "Digital Marketing Basics",
            "category": "Marketing",
            "short_description": "Master campaign planning, funnels, and channel analytics.",
            "description": "An approachable primer on audience targeting, creative strategy, and campaign performance tracking.",
            "thumbnail_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
            "modules": [("Growth Essentials", [("Audience Segmentation", 11), ("Content Funnels", 13)])],
        },
    ]

    for payload in course_payloads:
        category, _ = Category.objects.get_or_create(name=payload["category"])
        course, created = Course.objects.get_or_create(
            title=payload["title"],
            defaults={
                "category": category,
                "instructor": instructor,
                "status": "published",
                "short_description": payload["short_description"],
                "description": payload["description"],
                "thumbnail_url": payload["thumbnail_url"],
            },
        )
        if not created:
            continue

        for module_index, (module_title, lessons) in enumerate(payload["modules"], start=1):
            module = Module.objects.create(course=course, title=module_title, order=module_index)
            for lesson_index, (lesson_title, duration) in enumerate(lessons, start=1):
                Lesson.objects.create(
                    module=module,
                    title=lesson_title,
                    duration_minutes=duration,
                    order=lesson_index,
                    content=f"Lesson content for {lesson_title}.",
                )


class Migration(migrations.Migration):
    dependencies = [
        ("authentication", "0003_user_avatar_url_user_bio_user_email_verified_and_more"),
        ("lms_core", "0002_alter_category_options_alter_course_options_and_more"),
    ]

    operations = [migrations.RunPython(seed_demo_courses, migrations.RunPython.noop)]
